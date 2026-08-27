import { NodeNativePackages } from "./db.mjs";
import "./_chunks/libs/pkg-types.mjs";
import { ExternalsTraceOptions } from "./_chunks/types.mjs";
declare function traceNodeModules(input: string[], opts: ExternalsTraceOptions): Promise<void>;
export { type ExternalsTraceOptions, NodeNativePackages, traceNodeModules };