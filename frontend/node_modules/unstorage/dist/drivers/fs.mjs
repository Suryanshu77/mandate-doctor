import { createError, createRequiredError, importLib } from "../_chunks/utils.mjs";
import { ensuredir, isTmpFile, readFile, readdirRecursive, rmRecursive, unlink, writeFile } from "../_chunks/node-fs.mjs";
import { existsSync, promises } from "node:fs";
import { isAbsolute, join, matchesGlob, relative, resolve } from "node:path";
const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_DEPENDENCIES = { lib: {
	name: "chokidar",
	version: "^4 || ^5",
	optional: true
} };
const DRIVER_NAME = "fs";
const driver = (userOptions = {}) => {
	if (!userOptions.base) throw createRequiredError(DRIVER_NAME, "base");
	const base = resolve(userOptions.base);
	const ignorePatterns = userOptions.ignore || ["**/node_modules/**", "**/.git/**"];
	const ignore = (path) => {
		const relativePath = relative(base, path);
		return ignorePatterns.some((pattern) => {
			if (isAbsolute(pattern)) return path.startsWith(pattern);
			return matchesGlob(relativePath, pattern);
		});
	};
	const r = (key) => {
		if (PATH_TRAVERSE_RE.test(key)) throw createError(DRIVER_NAME, `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`);
		return join(base, key.replace(/:/g, "/"));
	};
	let _watcher;
	const _unwatch = async () => {
		if (_watcher) {
			await _watcher.close();
			_watcher = void 0;
		}
	};
	return {
		name: DRIVER_NAME,
		options: userOptions,
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
			if (userOptions.readOnly) return;
			return writeFile(r(key), value, "utf8", userOptions.atomic);
		},
		setItemRaw(key, value) {
			if (userOptions.readOnly) return;
			return writeFile(r(key), value, void 0, userOptions.atomic);
		},
		removeItem(key) {
			if (userOptions.readOnly) return;
			return unlink(r(key));
		},
		getKeys(_base, topts) {
			return readdirRecursive(r("."), ignore, topts?.maxDepth);
		},
		async clear() {
			if (userOptions.readOnly || userOptions.noClear) return;
			await rmRecursive(r("."));
		},
		async dispose() {
			if (_watcher) await _watcher.close();
		},
		async watch(callback) {
			if (_watcher) return _unwatch;
			await ensuredir(base);
			const { watch } = await importLib(DRIVER_NAME, "chokidar", userOptions.lib, () => import("chokidar"));
			await new Promise((resolve, reject) => {
				const watchOptions = {
					ignoreInitial: true,
					...userOptions.watchOptions
				};
				if (!watchOptions.ignored) watchOptions.ignored = [];
				else if (Array.isArray(watchOptions.ignored)) watchOptions.ignored = [...watchOptions.ignored];
				else watchOptions.ignored = [watchOptions.ignored];
				watchOptions.ignored.push(ignore, (path) => isTmpFile(path));
				_watcher = watch(base, watchOptions).on("ready", () => {
					resolve();
				}).on("error", reject).on("all", (eventName, path) => {
					path = relative(base, path);
					if (eventName === "change" || eventName === "add") callback("update", path);
					else if (eventName === "unlink") callback("remove", path);
				});
			});
			return _unwatch;
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
