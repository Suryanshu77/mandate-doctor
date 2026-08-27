import { injectPluginIntoFile } from "./inject-plugin.js";
import { readPackageJson, tryParseJson } from "./utils.js";
import chalk from "chalk";
import { existsSync } from "node:fs";
import { exec } from "node:child_process";
import { join } from "node:path";
import { devtoolsEventClient } from "@tanstack/devtools-client";
//#region src/package-manager.ts
/**
* Gets the outdated command for the detected package manager
*/
var getOutdatedCommand = (packageManager) => {
	switch (packageManager) {
		case "yarn": return "yarn outdated --json";
		case "pnpm": return "pnpm outdated --format json";
		case "bun": return "bun outdated --json";
		default: return "npm outdated --json";
	}
};
/**
* Adds a plugin to the devtools configuration file
*/
var addPluginToDevtools = (devtoolsFileId, packageName, pluginName, pluginImport) => {
	if (!devtoolsFileId) {
		const error = "Devtools file not found";
		console.log(chalk.yellowBright(`[@tanstack/devtools-vite] Could not add plugin. ${error}.`));
		return {
			success: false,
			error
		};
	}
	const result = injectPluginIntoFile(devtoolsFileId, {
		packageName,
		pluginName,
		pluginImport
	});
	if (result.success) console.log(chalk.greenBright(`[@tanstack/devtools-vite] Successfully added ${packageName} to devtools!`));
	else console.log(chalk.yellowBright(`[@tanstack/devtools-vite] Could not add plugin: ${result.error}`));
	return result;
};
/**
* Gets the install command for the detected package manager
*/
var getInstallCommand = (packageManager, packageName) => {
	switch (packageManager) {
		case "yarn": return `yarn add -D ${packageName}`;
		case "pnpm": return `pnpm add -D ${packageName}`;
		case "bun": return `bun add -D ${packageName}`;
		default: return `npm install -D ${packageName}`;
	}
};
var installPackage = async (packageName) => {
	return new Promise((resolve) => {
		const installCommand = getInstallCommand(detectPackageManager(), packageName);
		console.log(chalk.blueBright(`[@tanstack/devtools-vite] Installing ${packageName}...`));
		exec(installCommand, async (installError) => {
			if (installError) {
				console.error(chalk.redBright(`[@tanstack/devtools-vite] Failed to install ${packageName}:`), installError.message);
				resolve({
					success: false,
					error: installError.message
				});
				return;
			}
			console.log(chalk.greenBright(`[@tanstack/devtools-vite] Successfully installed ${packageName}`));
			const updatedPackageJson = await readPackageJson();
			devtoolsEventClient.emit("package-json-updated", { packageJson: updatedPackageJson });
			resolve({ success: true });
		});
	});
};
/**
* Detects the package manager used in the project by checking for lock files
*/
var detectPackageManager = () => {
	const cwd = process.cwd();
	if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) return "bun";
	if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
	if (existsSync(join(cwd, "package-lock.json"))) return "npm";
	return "pnpm";
};
var emitOutdatedDeps = async () => {
	return await new Promise((resolve) => {
		exec(getOutdatedCommand(detectPackageManager()), (_, stdout) => {
			if (stdout) {
				const newOutdatedDeps = tryParseJson(stdout);
				if (!newOutdatedDeps) return;
				devtoolsEventClient.emit("outdated-deps-read", { outdatedDeps: newOutdatedDeps });
				resolve(newOutdatedDeps);
			}
		});
	});
};
//#endregion
export { addPluginToDevtools, emitOutdatedDeps, installPackage };

//# sourceMappingURL=package-manager.js.map