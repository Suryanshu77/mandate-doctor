import { ConsoleLevel } from './types.js';
/**
 * Generates inline code to inject into entry files (both client and server).
 * This code detects the environment at runtime and:
 *
 * CLIENT:
 * 1. Store original console methods
 * 2. Create batched wrappers that POST to server via fetch
 * 3. Override global console with the wrapped methods
 * 4. Listen for server console logs via SSE
 *
 * SERVER (Nitro/Vinxi runtime):
 * 1. Store original console methods
 * 2. Create batched wrappers that POST to Vite dev server
 * 3. Override global console - original logging still happens, just also pipes to Vite
 *
 * Returns the inline code as a string - no imports needed since we use fetch.
 */
export declare function generateConsolePipeCode(levels: Array<ConsoleLevel>, viteServerUrl: string): string;
