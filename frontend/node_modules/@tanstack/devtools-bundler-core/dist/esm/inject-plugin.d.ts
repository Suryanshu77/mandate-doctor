import { PluginInjection } from '@tanstack/devtools-client';
/**
 * Finds the TanStackDevtools component name in the file
 * Handles renamed imports and namespace imports
 */
export declare const findDevtoolsComponentName: (code: string) => string | null;
export declare const transformAndInject: (code: string, injection: PluginInjection, devtoolsComponentName: string) => {
    code: string;
    transformed: boolean;
} | null;
/**
 * Detects if a file contains TanStack devtools import
 */
export declare function detectDevtoolsFile(code: string): boolean;
/**
 * Injects a plugin into the TanStackDevtools component in a file
 * Reads the file, transforms it, and writes it back
 */
export declare function injectPluginIntoFile(filePath: string, injection: PluginInjection): {
    success: boolean;
    error?: string;
};
