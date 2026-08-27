//#region src/ast-utils.ts
/**
* Cache of keys that hold child nodes (objects/arrays) per AST node type.
* Since oxc-parser produces AST via JSON.parse, every instance of a given
* node type has the same set of keys, so we only need to discover them once.
*/
var childKeysCache = /* @__PURE__ */ new Map();
function getChildKeys(node) {
	let keys = childKeysCache.get(node.type);
	if (keys) return keys;
	keys = [];
	for (const key in node) {
		if (key === "type" || key === "start" || key === "end") continue;
		if (typeof node[key] === "object") keys.push(key);
	}
	childKeysCache.set(node.type, keys);
	return keys;
}
/**
* Iterate over the direct child nodes of an AST node.
* Uses a per-type cache of which keys hold child nodes to avoid
* allocating Object.entries() arrays on every call.
*/
function forEachChild(node, callback) {
	const keys = getChildKeys(node);
	for (const key of keys) {
		const value = node[key];
		if (value === null) continue;
		if (Array.isArray(value)) {
			for (const item of value) if (typeof item === "object" && item !== null && "type" in item) callback(item);
		} else if ("type" in value) callback(value);
	}
}
/**
* Recursively walk AST nodes, calling `visitor` for each node with a `type`.
*/
function walk(node, visitor, parentNode) {
	visitor(node, parentNode);
	forEachChild(node, (child) => walk(child, visitor, node));
}
//#endregion
export { forEachChild, walk };

//# sourceMappingURL=ast-utils.js.map