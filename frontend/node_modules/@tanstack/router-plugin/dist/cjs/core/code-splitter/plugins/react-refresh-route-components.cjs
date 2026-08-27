const require_runtime = require("../../../_virtual/_rolldown/runtime.cjs");
const require_utils = require("../../utils.cjs");
let _babel_types = require("@babel/types");
_babel_types = require_runtime.__toESM(_babel_types, 1);
//#region src/core/code-splitter/plugins/react-refresh-route-components.ts
var REACT_REFRESH_ROUTE_COMPONENT_IDENTS = new Set([
	"component",
	"shellComponent",
	"pendingComponent",
	"errorComponent",
	"notFoundComponent"
]);
function isReactComponentName(name) {
	const firstCharacter = name[0];
	return firstCharacter !== void 0 && firstCharacter >= "A" && firstCharacter <= "Z";
}
function getRouteComponentKey(prop) {
	const key = require_utils.getObjectPropertyKeyName(prop);
	return key && REACT_REFRESH_ROUTE_COMPONENT_IDENTS.has(key) ? key : void 0;
}
function prepareRouteComponentsForReactRefresh(ctx) {
	const hoistedDeclarations = [];
	let modified = false;
	for (const prop of ctx.routeOptions.properties) {
		if (!_babel_types.isObjectProperty(prop)) continue;
		const key = getRouteComponentKey(prop);
		if (!key) continue;
		if (_babel_types.isIdentifier(prop.value)) {
			if (isReactComponentName(prop.value.name)) continue;
			const bindingNode = ctx.programPath.scope.getBinding(prop.value.name)?.path.node;
			if (!(_babel_types.isFunctionDeclaration(bindingNode) || _babel_types.isClassDeclaration(bindingNode) || _babel_types.isVariableDeclarator(bindingNode))) continue;
			const componentIdentifier = require_utils.getUniqueProgramIdentifier(ctx.programPath, `TSR${key[0].toUpperCase()}${key.slice(1)}`);
			ctx.programPath.scope.rename(prop.value.name, componentIdentifier.name);
			modified = true;
			continue;
		}
		if (!_babel_types.isArrowFunctionExpression(prop.value) && !_babel_types.isFunctionExpression(prop.value)) continue;
		const hoistedIdentifier = require_utils.getUniqueProgramIdentifier(ctx.programPath, `TSR${key[0].toUpperCase()}${key.slice(1)}`);
		hoistedDeclarations.push(_babel_types.variableDeclaration("const", [_babel_types.variableDeclarator(hoistedIdentifier, _babel_types.cloneNode(prop.value, true))]));
		prop.value = _babel_types.cloneNode(hoistedIdentifier);
		modified = true;
	}
	if (hoistedDeclarations.length > 0) ctx.insertionPath.insertBefore(hoistedDeclarations);
	return modified;
}
function createReactRefreshRouteComponentsPlugin() {
	return {
		name: "react-refresh-route-components",
		getStableRouteOptionKeys() {
			return [...REACT_REFRESH_ROUTE_COMPONENT_IDENTS];
		},
		onAddHmr(ctx) {
			if (prepareRouteComponentsForReactRefresh(ctx)) return { modified: true };
		},
		onVirtualRouteSplitNode(ctx) {
			if (ctx.splitNodeMeta.splitStrategy !== "lazyRouteComponent" || !_babel_types.isFunctionDeclaration(ctx.splitNode) || !ctx.splitNode.id || isReactComponentName(ctx.splitNode.id.name)) return;
			const componentIdentifier = require_utils.getUniqueProgramIdentifier(ctx.programPath, ctx.splitNodeMeta.localExporterIdent);
			ctx.programPath.scope.rename(ctx.splitNode.id.name, componentIdentifier.name);
		}
	};
}
//#endregion
exports.createReactRefreshRouteComponentsPlugin = createReactRefreshRouteComponentsPlugin;

//# sourceMappingURL=react-refresh-route-components.cjs.map