import { dirname, isAbsolute, join, normalize, relative, resolve } from "./libs/pathe.mjs";
import { resolveModulePath } from "./libs/exsolve.mjs";
import { createRequire } from "node:module";
import * as fsp from "node:fs/promises";
import { access, readFile, writeFile } from "node:fs/promises";
import nft from "@vercel/nft";
import semver from "semver";
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
const isWindows = process.platform === "win32";
const NODE_MODULES_RE = /^(?<dir>.+[\\/]node_modules[\\/])(?<name>[^@\\/]+|@[^\\/]+[\\/][^\\/]+)(?:[\\/](?<subpath>.+))?$/;
function parseNodeModulePath(path) {
	return NODE_MODULES_RE.exec(path)?.groups || {};
}
const IMPORT_RE = /^(?!\.)(?<name>[^@/\\]+|@[^/\\]+[/\\][^/\\]+)(?:[/\\](?<subpath>.+))?$/;
function importPkgName(id) {
	return IMPORT_RE.exec(id)?.groups?.name;
}
function toImport(id) {
	if (isAbsolute(id)) {
		const { name, subpath } = parseNodeModulePath(id) || {};
		if (name && subpath) return join(name, subpath);
	} else if (IMPORT_RE.test(id)) return id;
}
function guessSubpath(path, conditions) {
	const { dir, name, subpath } = NODE_MODULES_RE.exec(path)?.groups || {};
	if (!dir || !name || !subpath) return;
	const exports = getPkgJSON(join(dir, name) + "/")?.exports;
	if (!exports || typeof exports !== "object") return;
	for (const e of flattenExports(exports)) {
		if (!conditions.includes(e.condition || "default")) continue;
		if (e.fsPath === subpath) return join(name, e.subpath);
		if (e.fsPath.includes("*")) {
			const fsPathRe = new RegExp("^" + escapeRegExp(e.fsPath).replace(String.raw`\*`, "(.+?)") + "$");
			if (fsPathRe.test(subpath)) {
				const matched = fsPathRe.exec(subpath)?.[1];
				if (matched) return join(name, e.subpath.replace("*", matched));
			}
		}
	}
}
function getPkgJSON(dir) {
	const cache = getPkgJSON._cache ||= /* @__PURE__ */ new Map();
	if (cache.has(dir)) return cache.get(dir);
	try {
		const pkg = createRequire(dir)("./package.json");
		cache.set(dir, pkg);
		return pkg;
	} catch {}
}
function flattenExports(exports = {}, parentSubpath = "./") {
	return Object.entries(exports).flatMap(([key, value]) => {
		const [subpath, condition] = key.startsWith(".") ? [key.slice(1)] : [void 0, key];
		const _subPath = join(parentSubpath, subpath || "");
		if (typeof value === "string") return [{
			subpath: _subPath,
			fsPath: value.replace(/^\.\//, ""),
			condition
		}];
		return typeof value === "object" ? flattenExports(value, _subPath) : [];
	});
}
function escapeRegExp(string) {
	return string.replace(/[-\\^$*+?.()|[\]{}]/g, String.raw`\$&`);
}
async function readJSON(path) {
	return JSON.parse(await readFile(path, "utf8"));
}
async function resolvePackageDir(name, from) {
	let dir = from;
	while (true) {
		const candidate = join(dir, "node_modules", name);
		try {
			await access(join(candidate, "package.json"));
			return candidate;
		} catch {}
		const parent = dirname(dir);
		if (parent === dir) return;
		dir = parent;
	}
}
async function writeJSON(path, data) {
	return await writeFile(path, JSON.stringify(data, null, 2), "utf8");
}
function pathRegExp(string) {
	if (isWindows) string = string.replace(/\\/g, "/");
	let escaped = escapeRegExp(string);
	if (isWindows) escaped = escaped.replace(/\//g, String.raw`[/\\]`);
	return escaped;
}
function toPathRegExp(input) {
	if (input instanceof RegExp) return input;
	if (typeof input === "string") return new RegExp(pathRegExp(input));
	throw new TypeError("Expected a string or RegExp", { cause: input });
}
var trace_exports = /* @__PURE__ */ __exportAll({
	DEFAULT_CONDITIONS: () => DEFAULT_CONDITIONS,
	applyProductionCondition: () => applyProductionCondition,
	traceNodeModules: () => traceNodeModules
});
const { nodeFileTrace, resolve: nftResolve } = nft;
const DEFAULT_CONDITIONS = [
	"node",
	"import",
	"default"
];
const JS_FILE_RE = /\.(?:c|m)?js$/;
const FS_CONCURRENCY = 32;
async function traceNodeModules(input, opts) {
	const rootDir = resolve(opts.rootDir || ".");
	const allInput = [...input, ...(opts.traceInclude || []).filter((n) => isAbsolute(n))];
	await opts?.hooks?.traceStart?.(allInput);
	const base = opts.nft?.base ?? "/";
	const nftOptions = {
		exportsOnly: true,
		processCwd: rootDir,
		conditions: (opts.conditions || DEFAULT_CONDITIONS).filter((c) => ![
			"require",
			"import",
			"default"
		].includes(c)),
		...opts.nft,
		base
	};
	nftOptions.resolve ??= async (id, parent, job, cjsResolve) => {
		try {
			return await nftResolve(id, parent, job, cjsResolve);
		} catch (error) {
			const resolved = resolveModulePath(id, {
				from: parent,
				conditions: [...nftOptions.conditions || [], cjsResolve ? "require" : "import"],
				try: true
			});
			if (!resolved) throw error;
			return job.realpath(resolved, parent);
		}
	};
	const traceResult = await nodeFileTrace([...allInput], nftOptions);
	await opts?.hooks?.traceResult?.(traceResult);
	const tracedFiles = await resolveTracedFiles(traceResult, base);
	const tracedPackages = {};
	const pkgCache = /* @__PURE__ */ new Map();
	const seenFiles = /* @__PURE__ */ new Set();
	await indexTracedFiles(Object.values(tracedFiles), {
		tracedFiles,
		tracedPackages,
		pkgCache,
		seenFiles,
		fullTraceInclude: opts.fullTraceInclude
	});
	const transitiveInput = [];
	const traceIncludeSet = new Set((opts.traceInclude || []).filter((n) => !isAbsolute(n)).map((n) => importPkgName(n) || n));
	if (traceIncludeSet.size > 0) {
		const declarerRoots = new Map([...traceIncludeSet].map((name) => [name, /* @__PURE__ */ new Set()]));
		const addDeclarer = (pkgJSON, root) => {
			if (!pkgJSON) return;
			const deps = {
				...pkgJSON.dependencies,
				...pkgJSON.peerDependencies,
				...pkgJSON.optionalDependencies
			};
			for (const depName of Object.keys(deps)) declarerRoots.get(depName)?.add(root);
		};
		for (const tracedPackage of Object.values(tracedPackages)) for (const versionEntry of Object.values(tracedPackage.versions)) addDeclarer(versionEntry.pkgJSON, versionEntry.path);
		const includeRoots = [...new Set(opts.traceIncludeRoots || [])].map((root) => resolve(rootDir, root));
		await Promise.all(includeRoots.map(async (root) => {
			const pkgJSON = await readJSON(join(root, "package.json")).catch(() => null);
			addDeclarer(pkgJSON, root);
		}));
		const includeConditions = [.../* @__PURE__ */ new Set([
			...opts.conditions || DEFAULT_CONDITIONS,
			"import",
			"require",
			"default"
		])];
		for (const [name, roots] of declarerRoots) {
			if (tracedPackages[name]) continue;
			let depPath;
			for (const from of [...roots, rootDir]) {
				const resolved = resolveModulePath(name, {
					try: true,
					from,
					conditions: includeConditions
				}) || resolveModulePath(name + "/package.json", {
					try: true,
					from
				});
				if (resolved) {
					const { dir, name: resolvedName } = parseNodeModulePath(resolved);
					if (dir && resolvedName) {
						depPath = join(dir, resolvedName);
						break;
					}
				}
				depPath = await resolvePackageDir(name, from);
				if (depPath) break;
			}
			if (!depPath) {
				console.warn(`nf3: could not resolve \`traceInclude\` entry ${JSON.stringify(name)} from any root`);
				continue;
			}
			const depPkgJSON = await readJSON(join(depPath, "package.json")).catch(() => null);
			if (!depPkgJSON) continue;
			const depVersion = depPkgJSON.version || "0.0.0";
			const files = await listPkgFiles(depPath);
			tracedPackages[name] = {
				name,
				versions: { [depVersion]: {
					path: depPath,
					files,
					pkgJSON: depPkgJSON
				} }
			};
			const entryFiles = pkgEntryFiles(depPkgJSON, depPath, files);
			for (const file of files) {
				const path = await resolveTracedPath(base, file);
				seenFiles.add(file);
				if (path) seenFiles.add(path);
				if (!JS_FILE_RE.test(file)) continue;
				if (entryFiles.size === 0 || entryFiles.has(file)) transitiveInput.push(file);
				if (path) tracedFiles[path] = {
					path,
					parents: [],
					subpath: parseNodeModulePath(path).subpath,
					pkgName: name,
					pkgVersion: depVersion,
					pkgPath: depPath
				};
			}
		}
	}
	if (transitiveInput.length > 0) try {
		const transitiveFiles = await resolveTracedFiles(await nodeFileTrace(transitiveInput, nftOptions), base, seenFiles);
		await indexTracedFiles(Object.values(transitiveFiles), {
			tracedFiles,
			tracedPackages,
			pkgCache,
			seenFiles,
			fullTraceInclude: opts.fullTraceInclude
		});
	} catch (error) {
		console.error("nf3: failed to trace transitive dependencies of `traceInclude` packages", error);
	}
	await opts?.hooks?.tracedFiles?.(tracedFiles);
	for (const tracedPackage of Object.values(tracedPackages)) for (const versionEntry of Object.values(tracedPackage.versions)) {
		const optionalDeps = versionEntry.pkgJSON.optionalDependencies;
		if (!optionalDeps) continue;
		for (const depName of Object.keys(optionalDeps)) {
			if (tracedPackages[depName]) continue;
			const resolved = resolveModulePath(depName + "/package.json", {
				try: true,
				from: versionEntry.path
			});
			const depPath = resolved ? dirname(resolved) : await resolvePackageDir(depName, versionEntry.path);
			if (!depPath) continue;
			const depPkgJSON = await readJSON(join(depPath, "package.json")).catch(() => null);
			if (!depPkgJSON) continue;
			const depVersion = depPkgJSON.version || "0.0.0";
			const files = await listPkgFiles(depPath);
			tracedPackages[depName] = {
				name: depName,
				versions: { [depVersion]: {
					path: depPath,
					files,
					pkgJSON: depPkgJSON
				} }
			};
		}
	}
	const nativeLoaderRE = /(?:^|\/)(node-gyp-build(?:-optional-packages)?|bindings|prebuild-install|node-pre-gyp)$/;
	for (const tracedPackage of Object.values(tracedPackages)) for (const versionEntry of Object.values(tracedPackage.versions)) {
		const deps = {
			...versionEntry.pkgJSON.dependencies,
			...versionEntry.pkgJSON.devDependencies
		};
		if (!Object.keys(deps).some((d) => nativeLoaderRE.test(d)) && !versionEntry.pkgJSON.gypfile) {
			const install = versionEntry.pkgJSON.scripts?.install;
			if (!install || !/node-gyp|pre-gyp|prebuild|napi/.test(install)) continue;
		}
		if (fsp.glob) {
			const existing = new Set(versionEntry.files);
			for await (const file of fsp.glob("**/*.node", {
				cwd: versionEntry.path,
				exclude: (name) => name === "node_modules"
			})) {
				const fullPath = join(versionEntry.path, file);
				if (!existing.has(fullPath) && await isFile(fullPath)) {
					existing.add(fullPath);
					versionEntry.files.push(fullPath);
				}
			}
		}
	}
	await opts?.hooks?.tracedPackages?.(tracedPackages);
	const usedAliases = {};
	const outDir = resolve(rootDir, opts.outDir || "dist", "node_modules");
	const limitFS = createLimiter(FS_CONCURRENCY);
	const activeTransforms = (opts.transform || []).filter((t) => t?.handler);
	const dirPromises = /* @__PURE__ */ new Map();
	const ensureDir = (dir) => {
		let p = dirPromises.get(dir);
		if (!p) {
			p = fsp.mkdir(dir, { recursive: true }).then(() => {});
			dirPromises.set(dir, p);
		}
		return p;
	};
	const writePackage = async (name, version, _pkgPath) => {
		const pkg = tracedPackages[name];
		const pkgPath = _pkgPath || pkg.name;
		await Promise.all(pkg.versions[version].files.map((src) => limitFS(async () => {
			const { subpath } = parseNodeModulePath(src);
			if (!subpath) return;
			const dst = resolve(outDir, pkgPath, subpath);
			await ensureDir(dirname(dst));
			const transformers = activeTransforms.filter((t) => t.filter?.(src));
			const transformed = transformers.length > 0;
			if (transformed) {
				let content = await fsp.readFile(src, "utf8");
				for (const transformer of transformers) content = await transformer.handler(content, src) ?? content;
				await fsp.writeFile(dst, content, "utf8");
			} else await fsp.copyFile(src, dst);
			if (opts.chmod === true) {
				if (transformed) await fsp.chmod(dst, (await fsp.stat(src)).mode & 511);
			} else if (opts.chmod) await fsp.chmod(dst, opts.chmod);
		})));
		const cachedPkgJSON = pkg.versions[version].pkgJSON;
		const pkgJSON = cachedPkgJSON.exports ? {
			...cachedPkgJSON,
			exports: structuredClone(cachedPkgJSON.exports)
		} : cachedPkgJSON;
		if (pkgJSON.exports) applyProductionCondition(pkgJSON.exports);
		const pkgJSONPath = join(outDir, pkgPath, "package.json");
		await ensureDir(dirname(pkgJSONPath));
		await fsp.writeFile(pkgJSONPath, JSON.stringify(pkgJSON, null, 2), "utf8");
		if (opts.traceAlias && opts.traceAlias[pkgPath]) {
			usedAliases[opts.traceAlias[pkgPath]] = version;
			await linkPackage(pkgPath, opts.traceAlias[pkgPath]);
		}
	};
	const linkPackage = async (from, to) => {
		const src = join(outDir, from);
		const dst = join(outDir, to);
		if ((await fsp.lstat(dst).catch(() => null))?.isSymbolicLink()) return;
		await fsp.mkdir(dirname(dst), { recursive: true });
		await fsp.symlink(relative(dirname(dst), src), dst, isWindows ? "junction" : "dir").catch((error) => {
			if (error.code !== "EEXIST") console.error("Cannot link", from, "to", to, error);
		});
	};
	const findPackageParents = (pkg, version) => {
		const versionFiles = pkg.versions[version].files.map((path) => tracedFiles[path]).filter((x) => x !== void 0);
		return [...new Set(versionFiles.flatMap((file) => file.parents.map((parentPath) => {
			const parentFile = tracedFiles[parentPath];
			if (!parentFile || parentFile.pkgName === pkg.name) return null;
			return `${parentFile.pkgName}@${parentFile.pkgVersion}`;
		}).filter(Boolean)))];
	};
	const multiVersionPkgs = {};
	const singleVersionPackages = [];
	for (const tracedPackage of Object.values(tracedPackages)) {
		const versions = Object.keys(tracedPackage.versions);
		if (versions.length === 1) {
			singleVersionPackages.push(tracedPackage.name);
			continue;
		}
		multiVersionPkgs[tracedPackage.name] = {};
		for (const version of versions) multiVersionPkgs[tracedPackage.name][version] = findPackageParents(tracedPackage, version);
	}
	await Promise.all(singleVersionPackages.map((pkgName) => {
		const pkg = tracedPackages[pkgName];
		const version = Object.keys(pkg.versions)[0];
		return writePackage(pkgName, version);
	}));
	await Promise.all(Object.entries(multiVersionPkgs).map(async ([pkgName, pkgVersions]) => {
		const versionEntries = Object.entries(pkgVersions).sort(([v1, p1], [v2, p2]) => {
			const d1 = p1.length === 0 ? Infinity : p1.length;
			const d2 = p2.length === 0 ? Infinity : p2.length;
			if (d1 !== d2) return d2 - d1;
			return compareVersions(v1, v2);
		});
		for (const [version, parentPkgs] of versionEntries) {
			await writePackage(pkgName, version, `.nf3/${pkgName}@${version}`);
			await linkPackage(`.nf3/${pkgName}@${version}`, `${pkgName}`);
			await Promise.all(parentPkgs.map((parentPkg) => {
				const parentPkgName = parentPkg.replace(/@[^@]+$/, "");
				return multiVersionPkgs[parentPkgName] ? linkPackage(`.nf3/${pkgName}@${version}`, `.nf3/${parentPkg}/node_modules/${pkgName}`) : linkPackage(`.nf3/${pkgName}@${version}`, `${parentPkgName}/node_modules/${pkgName}`);
			}));
		}
	}));
	if (opts.writePackageJson) await writeJSON(resolve(outDir, "../package.json"), {
		name: "traced-node-modules",
		version: "1.0.0",
		type: "module",
		private: true,
		dependencies: Object.fromEntries([...Object.values(tracedPackages).map((pkg) => [pkg.name, Object.keys(pkg.versions)[0]]), ...Object.entries(usedAliases)].sort(([a], [b]) => a.localeCompare(b)))
	});
}
async function resolveTracedPath(base, p) {
	try {
		return normalize(await fsp.realpath(resolve(base, p)));
	} catch (error) {
		if (error?.code === "ENOENT") return;
		throw error;
	}
}
async function resolveTracedFiles(traceResult, base, seen) {
	const resolveCache = /* @__PURE__ */ new Map();
	const resolve1 = (p) => {
		let cached = resolveCache.get(p);
		if (!cached) {
			cached = resolveTracedPath(base, p);
			resolveCache.set(p, cached);
		}
		return cached;
	};
	return Object.fromEntries(await Promise.all([...traceResult.reasons.entries()].map(async ([_path, reasons]) => {
		if (reasons.ignored) return;
		const path = await resolve1(_path);
		if (!path?.includes("node_modules")) return;
		if (seen?.has(path)) return;
		if (!await isFile(path)) return;
		const { dir: baseDir, name: pkgName, subpath } = parseNodeModulePath(path);
		if (!baseDir || !pkgName) return;
		const pkgPath = join(baseDir, pkgName);
		return [path, {
			path,
			parents: (await Promise.all([...reasons.parents].map((p) => resolve1(p)))).filter((p) => p !== void 0),
			subpath,
			pkgName,
			pkgPath
		}];
	})).then((r) => r.filter(Boolean)));
}
async function indexTracedFiles(files, ctx) {
	const { tracedFiles, tracedPackages, pkgCache, seenFiles, fullTraceInclude } = ctx;
	for (const tracedFile of files) {
		if (seenFiles.has(tracedFile.path)) continue;
		seenFiles.add(tracedFile.path);
		tracedFiles[tracedFile.path] = tracedFile;
		const pkgName = tracedFile.pkgName;
		let tracedPackage = tracedPackages[pkgName];
		let pkgJSON = pkgCache.get(tracedFile.pkgPath);
		if (!pkgJSON) {
			pkgJSON = await readJSON(join(tracedFile.pkgPath, "package.json")).catch(() => {
				return {
					name: pkgName,
					version: "0.0.0"
				};
			});
			pkgCache.set(tracedFile.pkgPath, pkgJSON);
		}
		if (!tracedPackage) {
			tracedPackage = {
				name: pkgName,
				versions: {}
			};
			tracedPackages[pkgName] = tracedPackage;
		}
		let tracedPackageVersion = tracedPackage.versions[pkgJSON.version || "0.0.0"];
		if (!tracedPackageVersion) {
			tracedPackageVersion = {
				path: tracedFile.pkgPath,
				files: [],
				pkgJSON
			};
			tracedPackage.versions[pkgJSON.version || "0.0.0"] = tracedPackageVersion;
			const fullTraceEntry = resolveFullTraceEntry(fullTraceInclude, pkgName);
			if (fullTraceEntry) {
				if (fullTraceEntry.glob) {
					if (!fsp.glob) throw new Error("`fullTraceInclude` glob requires Node.js >= 22.0.0 (fs.promises.glob)");
					for await (const file of fsp.glob(fullTraceEntry.glob, {
						cwd: tracedFile.pkgPath,
						exclude: (name) => name === "node_modules"
					})) {
						const fullPath = join(tracedFile.pkgPath, file);
						if (await isFile(fullPath)) tracedPackageVersion.files.push(fullPath);
					}
				} else tracedPackageVersion.files.push(...await listPkgFiles(tracedFile.pkgPath));
			}
		}
		tracedPackageVersion.files.push(tracedFile.path);
		tracedFile.pkgName = pkgName;
		tracedFile.pkgVersion = pkgJSON.version || "0.0.0";
	}
}
function createLimiter(concurrency) {
	let active = 0;
	const queue = [];
	return function limit(fn) {
		return new Promise((resolve, reject) => {
			const run = () => {
				active++;
				fn().then(resolve, reject).finally(() => {
					active--;
					queue.shift()?.();
				});
			};
			if (active < concurrency) run();
			else queue.push(run);
		});
	};
}
function compareVersions(v1 = "0.0.0", v2 = "0.0.0") {
	try {
		return semver.lt(v1, v2, { loose: true }) ? 1 : -1;
	} catch {
		return v1.localeCompare(v2);
	}
}
function applyProductionCondition(exports) {
	if (!exports || typeof exports === "string" || Array.isArray(exports)) return;
	if ("production" in exports) {
		if (typeof exports.production === "string") exports.default = exports.production;
		else Object.assign(exports, exports.production);
	}
	for (const key in exports) {
		if (key === "production") continue;
		applyProductionCondition(exports[key]);
	}
}
function resolveFullTraceEntry(entries, pkgName) {
	if (!entries) return;
	for (const entry of entries) if (typeof entry === "string") {
		if (entry === pkgName) return {};
	} else if (entry[0] === pkgName) return entry[1];
}
function collectExportTargets(node, out) {
	if (typeof node === "string") out.push(node);
	else if (Array.isArray(node)) for (const item of node) collectExportTargets(item, out);
	else if (node && typeof node === "object") for (const value of Object.values(node)) collectExportTargets(value, out);
}
function pkgEntryFiles(pkgJSON, pkgPath, files) {
	const targets = [];
	if (typeof pkgJSON.main === "string") targets.push(pkgJSON.main);
	if (typeof pkgJSON.module === "string") targets.push(pkgJSON.module);
	collectExportTargets(pkgJSON.exports, targets);
	const bin = pkgJSON.bin;
	if (typeof bin === "string") targets.push(bin);
	else if (bin && typeof bin === "object") {
		for (const value of Object.values(bin)) if (typeof value === "string") targets.push(value);
	}
	const fileSet = new Set(files);
	const entries = /* @__PURE__ */ new Set();
	for (const target of targets) {
		const abs = join(pkgPath, target);
		if (JS_FILE_RE.test(abs) && fileSet.has(abs)) entries.add(abs);
	}
	return entries;
}
async function listPkgFiles(dir) {
	const files = [];
	for (const entry of await fsp.readdir(dir, {
		recursive: true,
		withFileTypes: true
	})) {
		const fullPath = join(entry.parentPath, entry.name);
		if (fullPath.slice(dir.length).split("/").includes("node_modules")) continue;
		if (entry.isFile() || entry.isSymbolicLink() && await isFile(fullPath)) files.push(fullPath);
	}
	return files;
}
async function isFile(file) {
	try {
		return (await fsp.stat(file)).isFile();
	} catch (error) {
		if (error?.code === "ENOENT") return false;
		throw error;
	}
}
export { DEFAULT_CONDITIONS, guessSubpath, pathRegExp, toImport, toPathRegExp, traceNodeModules, trace_exports };
