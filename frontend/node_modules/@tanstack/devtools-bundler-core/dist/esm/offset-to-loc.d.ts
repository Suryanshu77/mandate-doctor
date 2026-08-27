export interface Loc {
    /** 1-based line number */
    line: number;
    /** 0-based column offset */
    column: number;
}
/**
 * Pre-compute line start offsets for fast byte-offset to line/column conversion.
 * Returns a function that maps a byte offset to `{ line, column }`.
 *
 * Build: O(n) single pass over the source string.
 * Lookup: O(log n) binary search.
 */
export declare function createLocMapper(source: string): (offset: number) => Loc;
