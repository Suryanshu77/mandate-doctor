import { createError, createRequiredError } from "../_chunks/utils.mjs";
import { readFile, readdirRecursive, rmRecursive, unlink, writeFile } from "../_chunks/node-fs.mjs";
import { existsSync, promises } from "node:fs";
import { join, resolve } from "node:path";
const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const driver = (opts = {}) => {
	if (!opts.base) throw createRequiredError(DRIVER_NAME, "base");
	const base = resolve(opts.base);
	const r = (key) => {
		if (PATH_TRAVERSE_RE.test(key)) throw createError(DRIVER_NAME, `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`);
		return join(base, key.replace(/:/g, "/"));
	};
	return {
		name: DRIVER_NAME,
		options: {
			...opts,
			base
		},
		flags: { maxDepth: true },
		hasItem(key) {
			return existsSync(r(key));
		},
		getItem(key) {
			return readFile(r(key), "utf8");
		},
		getItemRaw(key) {
			return readFile(r(key));
		},
		async getMeta(key) {
			const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
			return {
				atime,
				mtime,
				size,
				birthtime,
				ctime
			};
		},
		setItem(key, value) {
			if (opts.readOnly) return;
			return writeFile(r(key), value, "utf8", opts.atomic);
		},
		setItemRaw(key, value) {
			if (opts.readOnly) return;
			return writeFile(r(key), value, void 0, opts.atomic);
		},
		removeItem(key) {
			if (opts.readOnly) return;
			return unlink(r(key));
		},
		getKeys(_base, topts) {
			return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
		},
		async clear() {
			if (opts.readOnly || opts.noClear) return;
			await rmRecursive(r("."));
		}
	};
};
export { driver as default };
