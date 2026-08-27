import { existsSync, promises } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
function ignoreNotfound(err) {
	return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
	return err.code === "EEXIST" ? null : err;
}
const TMP_FILE_PREFIX = ".unstorage-tmp-";
const TMP_FILE_RE = /^\.unstorage-tmp-[\da-z-]+$/;
const _tmpFileId = `${process.pid.toString(36)}-${randomUUID().slice(0, 8)}-`;
let _tmpFileCounter = 0;
function isTmpFile(path) {
	return TMP_FILE_RE.test(basename(path));
}
async function writeFile(path, data, encoding, atomic) {
	const dir = dirname(path);
	await ensuredir(dir);
	if (!atomic) return promises.writeFile(path, data, encoding);
	const tmp = join(dir, TMP_FILE_PREFIX + _tmpFileId + (_tmpFileCounter++).toString(36));
	try {
		const [, destMode] = await Promise.all([promises.writeFile(tmp, data, encoding), promises.stat(path).then((s) => s.mode & 4095).catch((error) => {
			if (error.code === "ENOENT") return;
			throw error;
		})]);
		if (destMode !== void 0) await promises.chmod(tmp, destMode);
		await promises.rename(tmp, path);
	} catch (error) {
		await promises.unlink(tmp).catch(() => {});
		throw error;
	}
}
function readFile(path, encoding) {
	return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
	return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
	return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
	if (existsSync(dir)) return;
	await ensuredir(dirname(dir)).catch(ignoreExists);
	await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
	if (ignore && ignore(dir)) return [];
	const entries = await readdir(dir);
	const files = [];
	await Promise.all(entries.map(async (entry) => {
		const entryPath = resolve(dir, entry.name);
		if (entry.isDirectory()) {
			if (maxDepth === void 0 || maxDepth > 0) {
				const dirFiles = await readdirRecursive(entryPath, ignore, maxDepth === void 0 ? void 0 : maxDepth - 1);
				files.push(...dirFiles.map((f) => entry.name + "/" + f));
			}
		} else if (!(ignore && ignore(entryPath)) && !TMP_FILE_RE.test(entry.name)) files.push(entry.name);
	}));
	return files;
}
async function rmRecursive(dir) {
	const entries = await readdir(dir);
	await Promise.all(entries.map((entry) => {
		const entryPath = resolve(dir, entry.name);
		if (entry.isDirectory()) return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
		else return promises.unlink(entryPath);
	}));
}
export { ensuredir, isTmpFile, readFile, readdirRecursive, rmRecursive, unlink, writeFile };
