import { normalizePath } from "./normalize-path.js";
import { walk } from "./ast-utils.js";
import { createLocMapper } from "./offset-to-loc.js";
import chalk from "chalk";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
//#region src/enhance-logs.ts
function escapeForStringLiteral(str) {
	return str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n");
}
function enhanceConsoleLog(code, id, port) {
	const filePath = id.split("?")[0];
	const location = normalizePath(filePath).replace(normalizePath(process.cwd()), "");
	try {
		const result = parseSync(filePath, code, {
			sourceType: "module",
			lang: "tsx"
		});
		if (result.errors.length > 0) return;
		const offsetToLoc = createLocMapper(code);
		const s = new MagicString(code);
		walk(result.program, (node) => {
			if (node.type !== "CallExpression") return;
			const callee = node.callee;
			if (callee.type === "MemberExpression" && !callee.computed && callee.object.type === "Identifier" && callee.object.name === "console" && callee.property.type === "Identifier" && (callee.property.name === "log" || callee.property.name === "error")) {
				const loc = offsetToLoc(node.start);
				const [lineNumber, column] = [loc.line, loc.column];
				const finalPath = `${location}:${lineNumber}:${column + 1}`;
				const spreadStr = `...(typeof window === "undefined" ? ${`["${escapeForStringLiteral(`${chalk.magenta("LOG")} ${chalk.blueBright(`${finalPath}`)}\n → `)}"]`} : ${`["%cLOG%c %c${`Go to Source: http://localhost:${port}/__tsd/open-source?source=${encodeURIComponent(finalPath)}`}%c \\n \\u2192 ","color:#A0A","color:#FFF","color:#55F","color:#FFF"]`}), `;
				let parenOffset = callee.end;
				while (parenOffset < code.length && code[parenOffset] !== "(") parenOffset++;
				s.appendRight(parenOffset + 1, spreadStr);
			}
		});
		if (!s.hasChanged()) return;
		return {
			code: s.toString(),
			map: s.generateMap({
				source: filePath,
				file: id,
				includeContent: true
			})
		};
	} catch (e) {
		return;
	}
}
//#endregion
export { enhanceConsoleLog };

//# sourceMappingURL=enhance-logs.js.map