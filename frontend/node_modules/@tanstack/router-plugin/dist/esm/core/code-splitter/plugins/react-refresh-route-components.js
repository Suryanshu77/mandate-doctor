import { getObjectPropertyKeyName, getUniqueProgramIdentifier } from "../../utils.js";
import * as t from "@babel/types";
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
	const key = getObjectPropertyKeyName(prop);
	return key && REACT_REFRESH_ROUTE_COMPONENT_IDENTS.has(key) ? key : void 0;
}
function prepareRouteComponentsForReactRefresh(ctx) {
	const hoistedDeclarations = [];
	let modified = false;
	for (const prop of ctx.routeOptions.properties) {
		if (!t.isObjectProperty(prop)) continue;
		const key = getRouteComponentKey(prop);
		if (!key) continue;
		if (t.isIdentifier(prop.value)) {
			if (isReactComponentName(prop.value.name)) continue;
			const bindingNode = ctx.programPath.scope.getBinding(prop.value.name)?.path.node;
			if (!(t.isFunctionDeclaration(bindingNode) || t.isClassDeclaration(bindingNode) || t.isVariableDeclarator(bindingNode))) continue;
			const componentIdentifier = getUniqueProgramIdentifier(ctx.programPath, `TSR${key[0].toUpperCase()}${key.slice(1)}`);
			ctx.programPath.scope.rename(prop.value.name, componentIdentifier.name);
			modified = true;
			continue;
		}
		if (!t.isArrowFunctionExpression(prop.value) && !t.isFunctionExpression(prop.value)) continue;
		const hoistedIdentifier = getUniqueProgramIdentifier(ctx.programPath, `TSR${key[0].toUpperCase()}${key.slice(1)}`);
		hoistedDeclarations.push(t.variableDeclaration("const", [t.variableDeclarator(hoistedIdentifier, t.cloneNode(prop.value, true))]));
		prop.value = t.cloneNode(hoistedIdentifier);
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
			if (ctx.splitNodeMeta.splitStrategy !== "lazyRouteComponent" || !t.isFunctionDeclaration(ctx.splitNode) || !ctx.splitNode.id || isReactComponentName(ctx.splitNode.id.name)) return;
			const componentIdentifier = getUniqueProgramIdentifier(ctx.programPath, ctx.splitNodeMeta.localExporterIdent);
			ctx.programPath.scope.rename(ctx.splitNode.id.name, componentIdentifier.name);
		}
	};
}
//#endregion
export { createReactRefreshRouteComponentsPlugin };

//# sourceMappingURL=react-refresh-route-components.js.map