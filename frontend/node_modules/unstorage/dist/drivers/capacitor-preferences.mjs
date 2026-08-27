import { importLib, joinKeys, normalizeKey } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "@capacitor/preferences",
	version: "^6 || ^7 || ^8"
} };
const DRIVER_NAME = "capacitor-preferences";
const driver = (opts) => {
	const base = normalizeKey(opts?.base || "");
	const resolveKey = (key) => joinKeys(base, key);
	let _prefs;
	const getPreferences = () => _prefs ??= importLib(DRIVER_NAME, "@capacitor/preferences", opts?.lib, () => import("@capacitor/preferences")).then((lib) => lib.Preferences);
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getPreferences,
		async hasItem(key) {
			const { keys } = await (await getPreferences()).keys();
			return keys.includes(resolveKey(key));
		},
		async getItem(key) {
			return (await (await getPreferences()).get({ key: resolveKey(key) })).value;
		},
		async getItemRaw(key) {
			return (await (await getPreferences()).get({ key: resolveKey(key) })).value;
		},
		async setItem(key, value) {
			return (await getPreferences()).set({
				key: resolveKey(key),
				value
			});
		},
		async setItemRaw(key, value) {
			return (await getPreferences()).set({
				key: resolveKey(key),
				value
			});
		},
		async removeItem(key) {
			return (await getPreferences()).remove({ key: resolveKey(key) });
		},
		async getKeys() {
			const { keys } = await (await getPreferences()).keys();
			return keys.map((key) => key.slice(base.length));
		},
		async clear(prefix) {
			const preferences = await getPreferences();
			const { keys } = await preferences.keys();
			const _prefix = resolveKey(prefix || "");
			await Promise.all(keys.filter((key) => key.startsWith(_prefix)).map((key) => preferences.remove({ key })));
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
