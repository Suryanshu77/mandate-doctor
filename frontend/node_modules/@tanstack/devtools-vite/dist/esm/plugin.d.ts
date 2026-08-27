import { TanStackDevtoolsConfig } from '@tanstack/devtools-bundler-core';
import { Plugin } from 'vite';
export type { ConsoleLevel } from '@tanstack/devtools-bundler-core';
export type TanStackDevtoolsViteConfig = TanStackDevtoolsConfig;
export declare const defineDevtoolsConfig: (config: TanStackDevtoolsViteConfig) => TanStackDevtoolsConfig;
export declare const devtools: (args?: TanStackDevtoolsViteConfig) => Array<Plugin>;
