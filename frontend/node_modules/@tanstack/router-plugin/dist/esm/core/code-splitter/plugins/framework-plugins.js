import { createReactRefreshIgnoredRouteExportsPlugin } from "./react-refresh-ignored-route-exports.js";
import { createReactRefreshRouteComponentsPlugin } from "./react-refresh-route-components.js";
import { createReactStableHmrSplitRouteComponentsPlugin } from "./react-stable-hmr-split-route-components.js";
//#region src/core/code-splitter/plugins/framework-plugins.ts
function getFrameworkHmrCompilerPlugins(opts) {
	switch (opts.targetFramework) {
		case "react": {
			const hmrStyle = opts.hmrStyle ?? "vite";
			return [
				...hmrStyle === "vite" ? [createReactRefreshIgnoredRouteExportsPlugin()] : [],
				createReactRefreshRouteComponentsPlugin(),
				createReactStableHmrSplitRouteComponentsPlugin({ hmrStyle })
			];
		}
		default: return;
	}
}
//#endregion
export { getFrameworkHmrCompilerPlugins };

//# sourceMappingURL=framework-plugins.js.map