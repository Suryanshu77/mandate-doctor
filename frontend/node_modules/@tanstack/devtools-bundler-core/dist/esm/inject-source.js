import { normalizePath } from "./normalize-path.js";
import { forEachChild } from "./ast-utils.js";
import { createLocMapper } from "./offset-to-loc.js";
import { matcher } from "./matcher.js";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
//#region src/inject-source.ts
/**
* Extract the props name from a function's first parameter.
* Handles: `(props) => {}`, `({ ...props }) => {}`, `function(props) {}`
*/
function getPropsName(params) {
	const first = params[0];
	if (!first) return null;
	if (first.type === "Identifier") return first.name;
	if (first.type === "ObjectPattern") {
		for (const prop of first.properties) if (prop.type === "RestElement" && prop.argument.type === "Identifier") return prop.argument.name;
	}
	return null;
}
/**
* Get the display name from a JSX element name node.
*/
function getNameOfElement(name) {
	if (name.type === "JSXIdentifier") return name.name;
	if (name.type === "JSXMemberExpression") return `${getNameOfElement(name.object)}.${name.property.name}`;
	return `${name.namespace.name}:${name.name.name}`;
}
/**
* Check whether a JSXOpeningElement should receive `data-tsd-source`.
*/
function shouldTransform(node, propsName, ignorePatterns) {
	const nameOfElement = getNameOfElement(node.name);
	if (nameOfElement === "Fragment" || nameOfElement === "React.Fragment") return false;
	if (matcher(ignorePatterns, nameOfElement)) return false;
	if (node.attributes.some((a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === "data-tsd-source")) return false;
	if (node.attributes.some((a) => a.type === "JSXSpreadAttribute" && a.argument.type === "Identifier" && a.argument.name === propsName)) return false;
	return true;
}
function isFunctionLike(node) {
	return node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression";
}
/**
* Walk a subtree collecting JSXOpeningElements owned by the current function.
* Function-like nodes are traversal boundaries so inner components keep their
* own propsName context and aren't annotated with an outer function's props.
*/
function collectJsx(node, out) {
	if (node.type === "JSXOpeningElement") {
		out.push(node);
		return;
	}
	if (isFunctionLike(node)) return;
	forEachChild(node, (child) => collectJsx(child, out));
}
/**
* Walk the AST to find all function-like nodes (in document order).
* For each, extract propsName and collect JSX elements from its body.
*/
function visitFunctions(node, annotated, file, ignorePatterns, offsetToLoc, s, code) {
	let didTransform = false;
	const processFunction = (params, body) => {
		const propsName = getPropsName(params);
		const jsxNodes = [];
		collectJsx(body, jsxNodes);
		for (const jsx of jsxNodes) {
			if (annotated.has(jsx.start)) continue;
			if (!shouldTransform(jsx, propsName, ignorePatterns)) continue;
			const loc = offsetToLoc(jsx.start);
			const attrStr = ` data-tsd-source="${file}:${loc.line}:${loc.column + 1}"`;
			if (jsx.selfClosing) s.appendLeft(jsx.end - 2, attrStr);
			else s.appendLeft(jsx.end - 1, attrStr);
			annotated.add(jsx.start);
			didTransform = true;
		}
	};
	if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression") {
		if (node.body) processFunction(node.params, node.body);
	} else if (node.type === "ArrowFunctionExpression") processFunction(node.params, node.body);
	forEachChild(node, (child) => {
		if (visitFunctions(child, annotated, file, ignorePatterns, offsetToLoc, s, code)) didTransform = true;
	});
	return didTransform;
}
function addSourceToJsx(code, id, ignore = {}) {
	const filePath = id.split("?")[0];
	const location = normalizePath(filePath).replace(normalizePath(process.cwd()), "");
	if (matcher(ignore.files || [], location)) return;
	try {
		const result = parseSync(filePath, code, {
			sourceType: "module",
			lang: "tsx"
		});
		if (result.errors.length > 0) return;
		const offsetToLoc = createLocMapper(code);
		const s = new MagicString(code);
		const annotated = /* @__PURE__ */ new Set();
		if (!visitFunctions(result.program, annotated, location, ignore.components || [], offsetToLoc, s, code)) return;
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
export { addSourceToJsx };

//# sourceMappingURL=inject-source.js.map