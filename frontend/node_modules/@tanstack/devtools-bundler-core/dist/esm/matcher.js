import picomatch from "picomatch";
//#region src/matcher.ts
var matcher = (patterns, str) => {
	if (patterns.length === 0) return false;
	return patterns.map((pattern) => {
		if (typeof pattern === "string") return picomatch(pattern);
		else return (s) => pattern.test(s);
	}).some((isMatch) => isMatch(str));
};
//#endregion
export { matcher };

//# sourceMappingURL=matcher.js.map