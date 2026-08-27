import { createError, importLib } from "../_chunks/utils.mjs";
import { createDefaultAzureCredential } from "../_chunks/azure.mjs";
const DRIVER_DEPENDENCIES = {
	lib: {
		name: "@azure/storage-blob",
		version: "^12.31.0"
	},
	identityLib: {
		name: "@azure/identity",
		version: "^4.13.0",
		optional: true
	}
};
const DRIVER_NAME = "azure-storage-blob";
const driver = (opts) => {
	let containerClient;
	const endpointSuffix = opts.endpointSuffix || ".blob.core.windows.net";
	const getContainerClient = () => containerClient ??= (async () => {
		if (!opts.connectionString && !opts.sasUrl && !opts.accountName) throw createError(DRIVER_NAME, "missing accountName");
		const { BlobServiceClient, ContainerClient, StorageSharedKeyCredential } = await importLib(DRIVER_NAME, "@azure/storage-blob", opts.lib, () => import("@azure/storage-blob"));
		let serviceClient;
		if (opts.accountKey) {
			const credential = new StorageSharedKeyCredential(opts.accountName, opts.accountKey);
			serviceClient = new BlobServiceClient(`https://${opts.accountName}${endpointSuffix}`, credential);
		} else if (opts.sasUrl) {
			if (opts.containerName && opts.sasUrl.includes(`${opts.containerName}?`)) return new ContainerClient(`${opts.sasUrl}`);
			serviceClient = new BlobServiceClient(opts.sasUrl);
		} else if (opts.sasKey) {
			if (opts.containerName) return new ContainerClient(`https://${opts.accountName}${endpointSuffix}/${opts.containerName}?${opts.sasKey}`);
			serviceClient = new BlobServiceClient(`https://${opts.accountName}${endpointSuffix}?${opts.sasKey}`);
		} else if (opts.connectionString) serviceClient = BlobServiceClient.fromConnectionString(opts.connectionString);
		else serviceClient = new BlobServiceClient(`https://${opts.accountName}${endpointSuffix}`, await createDefaultAzureCredential(DRIVER_NAME, opts));
		const client = serviceClient.getContainerClient(opts.containerName || "unstorage");
		client.createIfNotExists();
		return client;
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getContainerClient,
		async hasItem(key) {
			return await (await getContainerClient()).getBlockBlobClient(key).exists();
		},
		async getItem(key) {
			try {
				const blob = await (await getContainerClient()).getBlockBlobClient(key).download();
				if (isBrowser) return blob.blobBody ? await blobToString(await blob.blobBody) : null;
				return blob.readableStreamBody ? (await streamToBuffer(blob.readableStreamBody)).toString() : null;
			} catch {
				return null;
			}
		},
		async getItemRaw(key) {
			try {
				const blob = await (await getContainerClient()).getBlockBlobClient(key).download();
				if (isBrowser) return blob.blobBody ? await blobToString(await blob.blobBody) : null;
				return blob.readableStreamBody ? await streamToBuffer(blob.readableStreamBody) : null;
			} catch {
				return null;
			}
		},
		async setItem(key, value) {
			await (await getContainerClient()).getBlockBlobClient(key).upload(value, Buffer.byteLength(value));
		},
		async setItemRaw(key, value) {
			await (await getContainerClient()).getBlockBlobClient(key).upload(value, Buffer.byteLength(value));
		},
		async removeItem(key) {
			await (await getContainerClient()).getBlockBlobClient(key).deleteIfExists({ deleteSnapshots: "include" });
		},
		async getKeys() {
			const iterator = (await getContainerClient()).listBlobsFlat().byPage({ maxPageSize: 1e3 });
			const keys = [];
			for await (const page of iterator) {
				const pageKeys = page.segment.blobItems.map((blob) => blob.name);
				keys.push(...pageKeys);
			}
			return keys;
		},
		async getMeta(key) {
			const blobProperties = await (await getContainerClient()).getBlockBlobClient(key).getProperties();
			return {
				mtime: blobProperties.lastModified,
				atime: blobProperties.lastAccessed,
				cr: blobProperties.createdOn,
				...blobProperties.metadata
			};
		},
		async clear() {
			const iterator = (await getContainerClient()).listBlobsFlat().byPage({ maxPageSize: 1e3 });
			for await (const page of iterator) await Promise.all(page.segment.blobItems.map(async (blob) => await (await getContainerClient()).deleteBlob(blob.name, { deleteSnapshots: "include" })));
		}
	};
};
const isBrowser = typeof window !== "undefined";
async function streamToBuffer(readableStream) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		readableStream.on("data", (data) => {
			chunks.push(data instanceof Buffer ? data : Buffer.from(data));
		});
		readableStream.on("end", () => {
			resolve(Buffer.concat(chunks));
		});
		readableStream.on("error", reject);
	});
}
async function blobToString(blob) {
	const fileReader = new FileReader();
	return new Promise((resolve, reject) => {
		fileReader.onloadend = (ev) => {
			resolve(ev.target?.result);
		};
		fileReader.onerror = reject;
		fileReader.readAsText(blob);
	});
}
export { DRIVER_DEPENDENCIES, driver as default };
