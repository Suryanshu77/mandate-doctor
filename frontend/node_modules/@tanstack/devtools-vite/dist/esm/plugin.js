import { devtoolsEventClient } from "@tanstack/devtools-client";
import { ServerEventBus } from "@tanstack/devtools-event-bus/server";
import chalk from "chalk";
import { DEFAULT_EDITOR_CONFIG, TANSTACK_DEVTOOLS_PACKAGES, addPluginToDevtools, addSourceToJsx, detectDevtoolsFile, emitOutdatedDeps, enhanceConsoleLog, generateConsolePipeCode, handleDevToolsRequest, handleOpenSource, injectPluginIntoFile, injectRuntimeBridge, installPackage, normalizePath, readPackageJson, removeDevtools, stripEnhancedLogPrefix, wireRuntimeBridgeChannels } from "@tanstack/devtools-bundler-core";
//#region src/plugin.ts
var defineDevtoolsConfig = (config) => config;
var devtools = (args) => {
	let port = 5173;
	const logging = args?.logging ?? true;
	const enhancedLogsConfig = args?.enhancedLogs ?? { enabled: true };
	const injectSourceConfig = args?.injectSource ?? { enabled: true };
	const removeDevtoolsOnBuild = args?.removeDevtoolsOnBuild ?? true;
	const serverBusEnabled = args?.eventBusConfig?.enabled ?? true;
	const consolePipingConfig = args?.consolePiping ?? { enabled: true };
	const consolePipingLevels = consolePipingConfig.levels ?? [
		"log",
		"warn",
		"error",
		"info",
		"debug"
	];
	let devtoolsFileId = null;
	let devtoolsPort = null;
	let devtoolsHost = null;
	let devtoolsProtocol = null;
	return [
		{
			enforce: "pre",
			name: "@tanstack/devtools:inject-source",
			apply(config) {
				return config.mode === "development" && injectSourceConfig.enabled;
			},
			transform: {
				filter: { id: { exclude: [
					/node_modules/,
					/\?raw/,
					/\/dist\//,
					/\/build\//
				] } },
				handler(code, id) {
					return addSourceToJsx(code, id, args?.injectSource?.ignore);
				}
			}
		},
		{
			name: "@tanstack/devtools:config",
			enforce: "pre",
			config(_, { command }) {
				if (command !== "serve") return;
			}
		},
		{
			enforce: "pre",
			name: "@tanstack/devtools:custom-server",
			apply(config) {
				return config.mode === "development";
			},
			async configureServer(server) {
				if (serverBusEnabled) {
					const preferredPort = args?.eventBusConfig?.port ?? 4206;
					const isHttps = !!server.config.server.https;
					const serverHost = typeof server.config.server.host === "string" ? server.config.server.host : "localhost";
					devtoolsProtocol = isHttps ? "https" : "http";
					devtoolsHost = serverHost;
					devtoolsPort = await new ServerEventBus({
						...args?.eventBusConfig,
						port: preferredPort,
						host: serverHost,
						...isHttps && server.httpServer ? { httpServer: server.httpServer } : {}
					}).start();
					if (server.environments) {
						const teardownBridge = wireRuntimeBridgeChannels(server, () => globalThis.__TANSTACK_EVENT_TARGET__);
						server.httpServer?.on("close", teardownBridge);
					}
				}
				server.middlewares.use((req, _res, next) => {
					if (req.socket.localPort && req.socket.localPort !== port) port = req.socket.localPort;
					next();
				});
				if (server.config.server.port) port = server.config.server.port;
				server.httpServer?.on("listening", () => {
					port = server.config.server.port;
				});
				const editor = args?.editor ?? DEFAULT_EDITOR_CONFIG;
				const openInEditor = async (path, lineNum, columnNum) => {
					if (!path) return;
					await editor.open(path, lineNum, columnNum);
				};
				const originalConsole = Object.fromEntries(consolePipingLevels.map((l) => [l, console[l].bind(console)]));
				const sseClients = [];
				let sseClientId = 0;
				const consolePipingEnabled = consolePipingConfig.enabled ?? true;
				server.middlewares.use((req, res, next) => handleDevToolsRequest(req, res, next, {
					onOpenSource: (parsedData) => {
						const { data, routine } = parsedData;
						if (routine === "open-source") return handleOpenSource({
							data: {
								type: data.type,
								data
							},
							openInEditor
						});
					},
					...consolePipingEnabled ? {
						onConsolePipe: (entries) => {
							for (const entry of entries) {
								const prefix = chalk.cyan("[Client]");
								(originalConsole[entry.level] ?? originalConsole.log)(prefix, ...stripEnhancedLogPrefix(entry.args, (loc) => chalk.gray(loc)));
							}
						},
						onConsolePipeSSE: (res, req) => {
							res.setHeader("Content-Type", "text/event-stream");
							res.setHeader("Cache-Control", "no-cache");
							res.setHeader("Connection", "keep-alive");
							res.setHeader("Access-Control-Allow-Origin", "*");
							res.flushHeaders();
							const clientId = ++sseClientId;
							sseClients.push({
								res,
								id: clientId
							});
							req.on("close", () => {
								const index = sseClients.findIndex((c) => c.id === clientId);
								if (index !== -1) sseClients.splice(index, 1);
							});
						},
						onServerConsolePipe: (entries) => {
							try {
								const data = JSON.stringify({ entries: entries.map((e) => ({
									level: e.level,
									args: e.args,
									source: "server",
									timestamp: e.timestamp || Date.now()
								})) });
								for (const client of sseClients) client.res.write(`data: ${data}\n\n`);
							} catch {}
						}
					} : {}
				}));
			}
		},
		{
			name: "@tanstack/devtools:remove-devtools-on-build",
			apply(config, { command }) {
				return (command !== "serve" || config.mode === "production") && removeDevtoolsOnBuild;
			},
			enforce: "pre",
			transform(code, id) {
				if (id.includes("node_modules") || id.includes("?raw") || !TANSTACK_DEVTOOLS_PACKAGES.some((pkg) => code.includes(pkg))) return;
				const transform = removeDevtools(code, id);
				if (!transform) return;
				if (logging) console.log(`\n${chalk.greenBright(`[@tanstack/devtools-vite]`)} Removed devtools code from: ${id.replace(normalizePath(process.cwd()), "")}\n`);
				return transform;
			}
		},
		{
			name: "@tanstack/devtools:event-client-setup",
			apply(config, { command }) {
				if (process.env.CI || process.env.NODE_ENV !== "development" || command !== "serve") return false;
				return config.mode === "development";
			},
			async configureServer() {
				const packageJson = await readPackageJson();
				const outdatedDeps = emitOutdatedDeps().then((deps) => deps);
				devtoolsEventClient.on("install-devtools", async (event) => {
					const result = await installPackage(event.payload.packageName);
					devtoolsEventClient.emit("devtools-installed", {
						packageName: event.payload.packageName,
						success: result.success,
						error: result.error
					});
					if (result.success) {
						const { packageName, pluginName, pluginImport } = event.payload;
						console.log(chalk.blueBright(`[@tanstack/devtools-vite] Auto-adding ${packageName} to devtools...`));
						if (addPluginToDevtools(devtoolsFileId, packageName, pluginName, pluginImport).success) {
							devtoolsEventClient.emit("plugin-added", {
								packageName,
								success: true
							});
							const updatedPackageJson = await readPackageJson();
							devtoolsEventClient.emit("package-json-read", { packageJson: updatedPackageJson });
						}
					}
				});
				devtoolsEventClient.on("add-plugin-to-devtools", (event) => {
					const { packageName, pluginName, pluginImport } = event.payload;
					console.log(chalk.blueBright(`[@tanstack/devtools-vite] Adding ${packageName} to devtools...`));
					const result = addPluginToDevtools(devtoolsFileId, packageName, pluginName, pluginImport);
					devtoolsEventClient.emit("plugin-added", {
						packageName,
						success: result.success,
						error: result.error
					});
				});
				devtoolsEventClient.on("bump-package-version", async (event) => {
					const { packageName, devtoolsPackage, pluginName, minVersion, pluginImport } = event.payload;
					console.log(chalk.blueBright(`[@tanstack/devtools-vite] Bumping ${packageName} to version ${minVersion}...`));
					const result = await installPackage(minVersion ? `${packageName}@^${minVersion}` : packageName);
					if (!result.success) {
						console.log(chalk.redBright(`[@tanstack/devtools-vite] Failed to bump ${packageName}: ${result.error}`));
						devtoolsEventClient.emit("devtools-installed", {
							packageName: devtoolsPackage,
							success: false,
							error: result.error
						});
						return;
					}
					console.log(chalk.greenBright(`[@tanstack/devtools-vite] Successfully bumped ${packageName} to ${minVersion}!`));
					if (!devtoolsFileId) {
						console.log(chalk.yellowBright(`[@tanstack/devtools-vite] Devtools file not found. Skipping auto-injection.`));
						devtoolsEventClient.emit("devtools-installed", {
							packageName: devtoolsPackage,
							success: true
						});
						return;
					}
					console.log(chalk.blueBright(`[@tanstack/devtools-vite] Adding ${devtoolsPackage} to devtools...`));
					const injectResult = injectPluginIntoFile(devtoolsFileId, {
						packageName: devtoolsPackage,
						pluginName,
						pluginImport
					});
					if (injectResult.success) {
						console.log(chalk.greenBright(`[@tanstack/devtools-vite] Successfully added ${devtoolsPackage} to devtools!`));
						devtoolsEventClient.emit("plugin-added", {
							packageName: devtoolsPackage,
							success: true
						});
						const updatedPackageJson = await readPackageJson();
						devtoolsEventClient.emit("package-json-read", { packageJson: updatedPackageJson });
					} else {
						console.log(chalk.redBright(`[@tanstack/devtools-vite] Failed to add ${devtoolsPackage} to devtools: ${injectResult.error}`));
						devtoolsEventClient.emit("plugin-added", {
							packageName: devtoolsPackage,
							success: false,
							error: injectResult.error
						});
					}
				});
				devtoolsEventClient.on("mounted", async () => {
					devtoolsEventClient.emit("outdated-deps-read", { outdatedDeps: await outdatedDeps });
					devtoolsEventClient.emit("package-json-read", { packageJson });
				});
			},
			async handleHotUpdate({ file }) {
				if (file.endsWith("package.json")) {
					const newPackageJson = await readPackageJson();
					devtoolsEventClient.emit("package-json-read", { packageJson: newPackageJson });
					emitOutdatedDeps();
				}
			}
		},
		{
			name: "@tanstack/devtools:better-console-logs",
			enforce: "pre",
			apply(config) {
				return config.mode === "development" && enhancedLogsConfig.enabled;
			},
			transform: {
				filter: {
					id: { exclude: [
						/node_modules/,
						/\?raw/,
						/\/dist\//,
						/\/build\//
					] },
					code: { include: "console." }
				},
				handler(code, id) {
					return enhanceConsoleLog(code, id, port);
				}
			}
		},
		{
			name: "@tanstack/devtools:console-pipe-transform",
			enforce: "pre",
			apply(config, { command }) {
				return config.mode === "development" && command === "serve" && (consolePipingConfig.enabled ?? true);
			},
			transform: {
				filter: {
					id: {
						include: /\.(tsx?|jsx?)$/,
						exclude: [
							/node_modules/,
							/\/dist\//,
							/\?/
						]
					},
					code: { exclude: /__tsdConsolePipe/ }
				},
				handler(code) {
					if (/<html[\s>]/i.test(code) || code.includes("StartClient") || code.includes("hydrateRoot") || code.includes("createRoot") || code.includes("solid-js/web") && code.includes("render(")) return `${generateConsolePipeCode(consolePipingLevels, `http://localhost:${port}`)}\n${code}`;
				}
			}
		},
		{
			name: "@tanstack/devtools:inject-plugin",
			apply(config, { command }) {
				return config.mode === "development" && command === "serve";
			},
			transform(code, id) {
				if (!devtoolsFileId && detectDevtoolsFile(code)) {
					const [filePath] = id.split("?");
					if (filePath) devtoolsFileId = filePath;
				}
			}
		},
		{
			name: "@tanstack/devtools:connection-injection",
			apply(config, { command }) {
				return config.mode === "development" && command === "serve";
			},
			transform(code, id) {
				if (!(code.includes("__TANSTACK_DEVTOOLS_PORT__") || code.includes("__TANSTACK_DEVTOOLS_HOST__") || code.includes("__TANSTACK_DEVTOOLS_PROTOCOL__"))) return;
				if (!id.includes("@tanstack/devtools") && !id.includes("@tanstack/event-bus")) return;
				const portValue = devtoolsPort ?? 4206;
				const hostValue = devtoolsHost ?? "localhost";
				const protocolValue = devtoolsProtocol ?? "http";
				let result = code;
				result = result.replace(/__TANSTACK_DEVTOOLS_PORT__/g, String(portValue));
				result = result.replace(/__TANSTACK_DEVTOOLS_HOST__/g, JSON.stringify(hostValue));
				result = result.replace(/__TANSTACK_DEVTOOLS_PROTOCOL__/g, JSON.stringify(protocolValue));
				return result;
			}
		},
		{
			name: "@tanstack/devtools:runtime-bridge",
			apply(config, { command }) {
				return config.mode === "development" && command === "serve";
			},
			transform(code, id) {
				if (id.includes("?")) return;
				return injectRuntimeBridge(code, id, this.environment?.name);
			}
		}
	];
};
//#endregion
export { defineDevtoolsConfig, devtools };

//# sourceMappingURL=plugin.js.map