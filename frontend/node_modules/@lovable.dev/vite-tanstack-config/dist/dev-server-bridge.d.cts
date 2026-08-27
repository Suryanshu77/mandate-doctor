import { Plugin } from "vite";
//#region src/dev-server-bridge/error-collector.d.ts
interface ErrorCollectorOptions {
  endpoint?: string;
  outputFile?: string;
  maxBodyBytes?: number;
  resetOnStart?: boolean;
}
declare function errorCollectorPlugin(options?: ErrorCollectorOptions): Plugin;
interface ErrorReportAppenderOptions {
  outputFile?: string;
}
type ErrorReportAppender = (report: Record<string, unknown>) => Promise<void>;
declare function createErrorReportAppender(options?: ErrorReportAppenderOptions): ErrorReportAppender;
//#endregion
//#region src/dev-server-bridge/index.d.ts
interface DevServerBridgeOptions {
  errorCollector?: false | ErrorCollectorOptions;
}
declare function devServerBridgePlugin(options?: DevServerBridgeOptions): Plugin;
//#endregion
export { DevServerBridgeOptions, type ErrorCollectorOptions, type ErrorReportAppender, type ErrorReportAppenderOptions, createErrorReportAppender, devServerBridgePlugin, errorCollectorPlugin };