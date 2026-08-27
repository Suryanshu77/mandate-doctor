import { createError, importLib, joinKeys, normalizeKey } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "@vercel/blob",
	version: ">=0.27.3"
} };
const DRIVER_NAME = "vercel-blob";
const driver = (opts) => {
	const optsBase = normalizeKey(opts?.base);
	const r = (...keys) => joinKeys(optsBase, ...keys).replace(/:/g, "/");
	const envName = `${opts.envPrefix || "BLOB"}_READ_WRITE_TOKEN`;
	let _blob;
	const getBlob = () => _blob ??= importLib(DRIVER_NAME, "@vercel/blob", opts.lib, () => import("@vercel/blob"));
	const getToken = () => {
		const token = opts.token || globalThis.process?.env?.[envName];
		if (!token) throw createError(DRIVER_NAME, `Missing token. Set ${envName} env or token config.`);
		return token;
	};
	const get = async (key) => (await getBlob()).get(r(key), {
		token: getToken(),
		access: opts.access
	});
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getBlob,
		async hasItem(key) {
			try {
				await (await getBlob()).head(r(key), { token: getToken() });
				return true;
			} catch {
				return false;
			}
		},
		async getItem(key) {
			const result = await get(key);
			if (!result) return null;
			return new Response(result.stream).text();
		},
		async getItemRaw(key) {
			const result = await get(key);
			if (!result) return null;
			return new Response(result.stream).arrayBuffer();
		},
		async getMeta(key) {
			try {
				const blobHead = await (await getBlob()).head(r(key), { token: getToken() });
				return {
					mtime: blobHead.uploadedAt,
					...blobHead
				};
			} catch {
				return null;
			}
		},
		async setItem(key, value, callOpts) {
			await (await getBlob()).put(r(key), value, {
				access: opts.access,
				addRandomSuffix: false,
				token: getToken(),
				...callOpts
			});
		},
		async setItemRaw(key, value, callOpts) {
			await (await getBlob()).put(r(key), value, {
				access: opts.access,
				addRandomSuffix: false,
				token: getToken(),
				...callOpts
			});
		},
		async removeItem(key) {
			await (await getBlob()).del(r(key), { token: getToken() });
		},
		async getKeys(base) {
			const blobs = [];
			let cursor = void 0;
			do {
				const listBlobResult = await (await getBlob()).list({
					token: getToken(),
					cursor,
					prefix: r(base)
				});
				cursor = listBlobResult.cursor;
				for (const blob of listBlobResult.blobs) blobs.push(blob);
			} while (cursor);
			return blobs.map((blob) => blob.pathname.replace(new RegExp(`^${optsBase.replace(/:/g, "/")}/`), ""));
		},
		async clear(base) {
			let cursor = void 0;
			const blobs = [];
			do {
				const listBlobResult = await (await getBlob()).list({
					token: getToken(),
					cursor,
					prefix: r(base)
				});
				blobs.push(...listBlobResult.blobs);
				cursor = listBlobResult.cursor;
			} while (cursor);
			if (blobs.length > 0) await (await getBlob()).del(blobs.map((blob) => blob.url), { token: getToken() });
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
