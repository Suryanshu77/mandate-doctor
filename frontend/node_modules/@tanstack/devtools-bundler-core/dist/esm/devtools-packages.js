//#region src/devtools-packages.ts
var TANSTACK_DEVTOOLS_PACKAGES = [
	"@tanstack/react-devtools",
	"@tanstack/preact-devtools",
	"@tanstack/solid-devtools",
	"@tanstack/vue-devtools",
	"@tanstack/svelte-devtools",
	"@tanstack/angular-devtools",
	"@tanstack/devtools"
];
var isTanStackDevtoolsImport = (source) => TANSTACK_DEVTOOLS_PACKAGES.includes(source);
//#endregion
export { TANSTACK_DEVTOOLS_PACKAGES, isTanStackDevtoolsImport };

//# sourceMappingURL=devtools-packages.js.map