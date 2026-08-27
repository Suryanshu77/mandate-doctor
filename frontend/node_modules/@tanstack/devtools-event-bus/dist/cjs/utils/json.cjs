//#region src/utils/json.ts
/**
* Safely stringify data that may contain BigInt values
* BigInt values are converted to objects with a special marker
*/
function stringifyWithBigInt(data) {
	return JSON.stringify(data, (_key, value) => {
		if (typeof value === "bigint") return {
			__type: "bigint",
			value: value.toString()
		};
		return value;
	});
}
/**
* Parse JSON and restore BigInt values
* Objects with __type: 'bigint' are converted back to BigInt
*/
function parseWithBigInt(json) {
	return JSON.parse(json, (_key, value) => {
		if (value && typeof value === "object" && value.__type === "bigint" && typeof value.value === "string") return BigInt(value.value);
		return value;
	});
}
//#endregion
exports.parseWithBigInt = parseWithBigInt;
exports.stringifyWithBigInt = stringifyWithBigInt;

//# sourceMappingURL=json.cjs.map