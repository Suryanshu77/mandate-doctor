//#region src/editor.ts
var DEFAULT_EDITOR_CONFIG = {
	name: "VSCode",
	open: async (path, lineNumber, columnNumber) => {
		const launch = (await import("launch-editor")).default;
		launch(`${path}${lineNumber ? `:${lineNumber}` : ""}${columnNumber ? `:${columnNumber}` : ""}`, void 0, (filename, err) => {
			console.warn(`Failed to open ${filename} in editor: ${err}`);
		});
	}
};
var handleOpenSource = async ({ data, openInEditor }) => {
	const { source, line, column } = data.data;
	const lineNum = line ? `${line}` : void 0;
	const columnNum = column ? `${column}` : void 0;
	if (source) return openInEditor(source, lineNum, columnNum);
};
//#endregion
export { DEFAULT_EDITOR_CONFIG, handleOpenSource };

//# sourceMappingURL=editor.js.map