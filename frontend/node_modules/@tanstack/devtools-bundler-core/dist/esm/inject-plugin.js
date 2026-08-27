import { walk } from "./ast-utils.js";
import { isTanStackDevtoolsImport } from "./devtools-packages.js";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
import { readFileSync, writeFileSync } from "node:fs";
//#region src/inject-plugin.ts
/**
* Detects if a file imports TanStack devtools packages
*/
var detectDevtoolsImport = (code) => {
	try {
		const result = parseSync("input.tsx", code, {
			sourceType: "module",
			lang: "tsx"
		});
		if (result.errors.length > 0) return false;
		let hasDevtoolsImport = false;
		walk(result.program, (node) => {
			if (hasDevtoolsImport) return;
			if (node.type === "ImportDeclaration" && isTanStackDevtoolsImport(node.source.value)) hasDevtoolsImport = true;
		});
		return hasDevtoolsImport;
	} catch (e) {
		return false;
	}
};
/**
* Finds the TanStackDevtools component name in the file
* Handles renamed imports and namespace imports
*/
var findDevtoolsComponentName = (code) => {
	try {
		const result = parseSync("input.tsx", code, {
			sourceType: "module",
			lang: "tsx"
		});
		if (result.errors.length > 0) return null;
		let componentName = null;
		walk(result.program, (node) => {
			if (componentName) return;
			if (node.type !== "ImportDeclaration") return;
			if (!isTanStackDevtoolsImport(node.source.value)) return;
			for (const spec of node.specifiers) {
				if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier" && spec.imported.name === "TanStackDevtools") {
					componentName = spec.local.name;
					return;
				}
				if (spec.type === "ImportNamespaceSpecifier") {
					componentName = `${spec.local.name}.TanStackDevtools`;
					return;
				}
			}
		});
		return componentName;
	} catch (e) {
		return null;
	}
};
/**
* Check if a plugin already exists in the array expression
*/
function pluginExists(code, node, importName, displayName, pluginType) {
	if (node.type !== "ArrayExpression") return false;
	for (const element of node.elements) {
		if (!element) continue;
		if (pluginType === "function") {
			if (element.type === "CallExpression" && element.callee.type === "Identifier" && element.callee.name === importName) return true;
		} else {
			if (element.type !== "ObjectExpression") continue;
			for (const prop of element.properties) if (prop.type === "Property" && prop.key.type === "Identifier" && prop.key.name === "name" && prop.value.type === "Literal" && code.slice(prop.value.start + 1, prop.value.end - 1) === displayName) return true;
		}
	}
	return false;
}
function buildPluginString(importName, displayName, pluginType) {
	if (pluginType === "function") return `${importName}()`;
	return `{ name: ${JSON.stringify(displayName)}, render: <${importName} /> }`;
}
var transformAndInject = (code, injection, devtoolsComponentName) => {
	const importName = injection.pluginImport?.importName;
	const pluginType = injection.pluginImport?.type || "jsx";
	const displayName = injection.pluginName;
	if (!importName) return null;
	try {
		const result = parseSync("input.tsx", code, {
			sourceType: "module",
			lang: "tsx"
		});
		if (result.errors.length > 0) return null;
		const s = new MagicString(code);
		const isNamespaceImport = devtoolsComponentName.includes(".");
		walk(result.program, (node) => {
			if (node.type !== "JSXOpeningElement") return;
			let matches = false;
			if (isNamespaceImport) {
				if (node.name.type === "JSXMemberExpression") matches = `${node.name.object.type === "JSXIdentifier" ? node.name.object.name : ""}.${node.name.property.name}` === devtoolsComponentName;
			} else matches = node.name.type === "JSXIdentifier" && node.name.name === devtoolsComponentName;
			if (!matches) return;
			const pluginsProp = node.attributes.find((attr) => attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier" && attr.name.name === "plugins");
			if (pluginsProp && pluginsProp.type === "JSXAttribute") {
				if (pluginsProp.value && pluginsProp.value.type === "JSXExpressionContainer") {
					const expression = pluginsProp.value.expression;
					if (expression.type === "ArrayExpression") {
						if (!pluginExists(code, expression, importName, displayName, pluginType)) {
							const pluginStr = buildPluginString(importName, displayName, pluginType);
							const arrayEnd = expression.end - 1;
							let prefix = "";
							if (expression.elements.length > 0) prefix = code.slice(expression.start + 1, arrayEnd).trimEnd().endsWith(",") ? " " : ", ";
							s.appendLeft(arrayEnd, prefix + pluginStr);
						}
					}
				}
			} else {
				const attrStr = ` plugins={[${buildPluginString(importName, displayName, pluginType)}]}`;
				if (node.selfClosing) s.appendLeft(node.end - 2, attrStr);
				else s.appendLeft(node.end - 1, attrStr);
			}
		});
		if (s.hasChanged()) {
			const state = {
				lastImportEnd: 0,
				alreadyImported: false
			};
			walk(result.program, (n) => {
				if (n.type !== "ImportDeclaration") return;
				if (n.end > state.lastImportEnd) state.lastImportEnd = n.end;
				if (n.source.value !== injection.packageName) return;
				for (const spec of n.specifiers) if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier" && spec.imported.name === importName) state.alreadyImported = true;
			});
			if (!state.alreadyImported) {
				const importStr = `\nimport { ${importName} } from ${JSON.stringify(injection.packageName)};`;
				s.appendRight(state.lastImportEnd, importStr);
			}
		}
		return {
			code: s.toString(),
			transformed: s.hasChanged()
		};
	} catch (e) {
		return null;
	}
};
/**
* Detects if a file contains TanStack devtools import
*/
function detectDevtoolsFile(code) {
	return detectDevtoolsImport(code);
}
/**
* Injects a plugin into the TanStackDevtools component in a file
* Reads the file, transforms it, and writes it back
*/
function injectPluginIntoFile(filePath, injection) {
	try {
		const code = readFileSync(filePath, "utf-8");
		const devtoolsComponentName = findDevtoolsComponentName(code);
		if (!devtoolsComponentName) return {
			success: false,
			error: "Could not find TanStackDevtools import"
		};
		const result = transformAndInject(code, injection, devtoolsComponentName);
		if (!result?.transformed) return {
			success: false,
			error: "Plugin already exists or no TanStackDevtools component found"
		};
		writeFileSync(filePath, result.code, "utf-8");
		return { success: true };
	} catch (e) {
		console.error("Error injecting plugin:", e);
		return {
			success: false,
			error: e instanceof Error ? e.message : "Unknown error"
		};
	}
}
//#endregion
export { detectDevtoolsFile, findDevtoolsComponentName, injectPluginIntoFile, transformAndInject };

//# sourceMappingURL=inject-plugin.js.map