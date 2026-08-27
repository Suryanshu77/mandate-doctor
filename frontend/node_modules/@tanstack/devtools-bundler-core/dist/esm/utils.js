import { normalizePath } from "./normalize-path.js";
import fs from "node:fs/promises";
//#region src/utils.ts
var handleDevToolsRequest = (req, res, next, cbOrOptions) => {
	const options = typeof cbOrOptions === "function" ? { onOpenSource: cbOrOptions } : cbOrOptions;
	if (req.url?.includes("__tsd/open-source")) {
		const source = new URLSearchParams(req.url.split("?")[1]).get("source");
		if (!source) return;
		const parsed = parseOpenSourceParam(source);
		if (!parsed) return;
		const { file, line, column } = parsed;
		options.onOpenSource?.({
			type: "open-source",
			routine: "open-source",
			data: {
				source: file ? normalizePath(`${process.cwd()}/${file}`) : void 0,
				line,
				column
			}
		});
		res.setHeader("Content-Type", "text/html");
		res.write(`<script> window.close(); <\/script>`);
		res.end();
		return;
	}
	if (req.url?.includes("__tsd/console-pipe/sse") && req.method === "GET") {
		if (options.onConsolePipeSSE) {
			options.onConsolePipeSSE(res, req);
			return;
		}
		return next();
	}
	if (req.url?.includes("__tsd/console-pipe/server") && req.method === "POST") {
		if (options.onServerConsolePipe) {
			let body = "";
			req.on("data", (chunk) => {
				body += chunk.toString();
			});
			req.on("end", () => {
				try {
					const { entries } = JSON.parse(body);
					options.onServerConsolePipe(entries);
					res.statusCode = 200;
					res.end("OK");
				} catch {
					res.statusCode = 400;
					res.end("Bad Request");
				}
			});
			return;
		}
		return next();
	}
	if (req.url?.includes("__tsd/console-pipe") && req.method === "POST") {
		if (options.onConsolePipe) {
			let body = "";
			req.on("data", (chunk) => {
				body += chunk.toString();
			});
			req.on("end", () => {
				try {
					const { entries } = JSON.parse(body);
					options.onConsolePipe(entries);
					res.statusCode = 200;
					res.end("OK");
				} catch {
					res.statusCode = 400;
					res.end("Bad Request");
				}
			});
			return;
		}
		return next();
	}
	if (!req.url?.includes("__tsd")) return next();
	const chunks = [];
	req.on("data", (chunk) => {
		chunks.push(chunk);
	});
	req.on("end", () => {
		const dataToParse = Buffer.concat(chunks);
		try {
			const parsedData = JSON.parse(dataToParse.toString());
			options.onOpenSource?.(parsedData);
		} catch (e) {}
		res.write("OK");
		res.end();
	});
};
var parseOpenSourceParam = (source) => {
	const parts = source.match(/^(.+):(\d+):(\d+)$/);
	if (!parts) return null;
	const [, file, line, column] = parts;
	return {
		file,
		line,
		column
	};
};
var tryReadFile = async (filePath) => {
	try {
		return await fs.readFile(filePath, "utf-8");
	} catch (error) {
		return null;
	}
};
var tryParseJson = (jsonString) => {
	if (!jsonString) return null;
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		return null;
	}
};
var readPackageJson = async () => tryParseJson(await tryReadFile(process.cwd() + "/package.json"));
/**
* Extracts and formats the source location from enhanced client console logs.
* Instead of stripping the prefix entirely, we extract the file:line:column
* from the "Go to Source" URL and use that as a prefix.
*
* Enhanced logs format (two variants):
* 1. ['%cLOG%c %cGo to Source: http://...?source=%2Fsrc%2F...%c \n → ', 'color:...', 'color:...', 'color:...', 'color:...', 'message']
* 2. ['\x1b[...]%s\x1b[...]', '%cLOG%c %cGo to Source: ...%c \n → ', 'color:...', 'color:...', 'color:...', 'color:...', 'message']
*
* Output: ['src/components/Header.tsx:26:13', 'message']
*/
var stripEnhancedLogPrefix = (args, formatSourceLocation) => {
	if (args.length === 0) return args;
	let sourceArgIndex = -1;
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (typeof arg === "string" && arg.includes("__tsd/open-source?source=")) {
			sourceArgIndex = i;
			break;
		}
	}
	if (sourceArgIndex === -1) return args;
	const sourceArg = args[sourceArgIndex];
	let sourceLocation = "";
	const sourceMatch = sourceArg.match(/source=([^&\s]+?)%c/);
	if (sourceMatch?.[1]) try {
		sourceLocation = decodeURIComponent(sourceMatch[1]);
		if (sourceLocation.startsWith("/")) sourceLocation = sourceLocation.slice(1);
	} catch {}
	const styleCount = (sourceArg.match(/%c/g) || []).length;
	const userArgsStart = sourceArgIndex + 1 + styleCount;
	const result = [];
	if (sourceLocation) result.push(formatSourceLocation ? formatSourceLocation(sourceLocation) : sourceLocation);
	for (let i = userArgsStart; i < args.length; i++) result.push(args[i]);
	return result.length > 0 ? result : args;
};
//#endregion
export { handleDevToolsRequest, parseOpenSourceParam, readPackageJson, stripEnhancedLogPrefix, tryParseJson };

//# sourceMappingURL=utils.js.map