import { IncomingMessage, ServerResponse } from 'node:http';
import { PackageJson } from '@tanstack/devtools-client';
type DevToolsRequestHandler = (data: any) => void;
type NextFunction = (err?: unknown) => void;
type DevToolsViteRequestOptions = {
    onOpenSource?: DevToolsRequestHandler;
    onConsolePipe?: (entries: Array<any>) => void;
    onServerConsolePipe?: (entries: Array<any>) => void;
    onConsolePipeSSE?: (res: ServerResponse<IncomingMessage>, req: IncomingMessage) => void;
};
export declare const handleDevToolsRequest: (req: IncomingMessage & {
    url?: string;
}, res: ServerResponse<IncomingMessage>, next: NextFunction, cbOrOptions: DevToolsRequestHandler | DevToolsViteRequestOptions) => void;
export declare const parseOpenSourceParam: (source: string) => {
    file: string | undefined;
    line: string | undefined;
    column: string | undefined;
} | null;
export declare const tryParseJson: <T extends any>(jsonString: string | null | undefined) => T | null;
export declare const readPackageJson: () => Promise<PackageJson | null>;
/**
 * Extracts and formats the source location from enhanced client console logs.
 * Instead of stripping the prefix entirely, we extract the file:line:column
 * from the "Go to Source" URL and use that as a prefix.
 *
 * Enhanced logs format (two variants):
 * 1. ['%cLOG%c %cGo to Source: http://...?source=%2Fsrc%2F...%c \n → ', 'color:...', 'color:...', 'color:...', 'color:...', 'message']
 * 2. ['\x1b[...]%s\x1b[...]', '%cLOG%c %cGo to Source: ...%c \n → ', 'color:...', 'color:...', 'color:...', 'color:...', 'message']
 *
 * Output: ['src/components/Header.tsx:26:13', 'message']
 */
export declare const stripEnhancedLogPrefix: (args: Array<unknown>, formatSourceLocation?: (location: string) => unknown) => Array<unknown>;
export {};
