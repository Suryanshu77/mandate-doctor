//#region src/offset-to-loc.ts
/**
* Pre-compute line start offsets for fast byte-offset to line/column conversion.
* Returns a function that maps a byte offset to `{ line, column }`.
*
* Build: O(n) single pass over the source string.
* Lookup: O(log n) binary search.
*/
function createLocMapper(source) {
	const lineStarts = [0];
	for (let i = 0; i < source.length; i++) if (source.charCodeAt(i) === 10) lineStarts.push(i + 1);
	return (offset) => {
		let lo = 0;
		let hi = lineStarts.length - 1;
		while (lo < hi) {
			const mid = lo + hi + 1 >> 1;
			if (lineStarts[mid] <= offset) lo = mid;
			else hi = mid - 1;
		}
		return {
			line: lo + 1,
			column: offset - lineStarts[lo]
		};
	};
}
//#endregion
export { createLocMapper };

//# sourceMappingURL=offset-to-loc.js.map