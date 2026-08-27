import "../_chunks/utils.mjs";
const DRIVER_NAME = "null";
const driver = () => {
	return {
		name: DRIVER_NAME,
		hasItem() {
			return false;
		},
		getItem() {
			return null;
		},
		getItemRaw() {
			return null;
		},
		getItems() {
			return [];
		},
		getMeta() {
			return null;
		},
		getKeys() {
			return [];
		},
		setItem() {},
		setItemRaw() {},
		setItems() {},
		removeItem() {},
		clear() {}
	};
};
export { driver as default };
