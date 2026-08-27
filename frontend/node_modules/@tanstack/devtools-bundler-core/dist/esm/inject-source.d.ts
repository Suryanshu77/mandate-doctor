export declare function addSourceToJsx(code: string, id: string, ignore?: {
    files?: Array<string | RegExp>;
    components?: Array<string | RegExp>;
}): {
    code: string;
    map: import('magic-string').SourceMap;
} | undefined;
