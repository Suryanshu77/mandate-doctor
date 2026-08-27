//#region src/connection.ts
var connection = {
	port: 4206,
	host: "localhost",
	protocol: "http"
};
var devtoolsFileId = null;
var setDevtoolsConnection = (c) => {
	connection = c;
};
var getDevtoolsConnection = () => connection;
var setDevtoolsFileId = (id) => {
	devtoolsFileId = id;
};
var getDevtoolsFileId = () => devtoolsFileId;
var devServerOrigin = null;
var setDevServerOrigin = (o) => {
	devServerOrigin = o;
};
var getDevServerOrigin = () => devServerOrigin;
//#endregion
export { getDevServerOrigin, getDevtoolsConnection, getDevtoolsFileId, setDevServerOrigin, setDevtoolsConnection, setDevtoolsFileId };

//# sourceMappingURL=connection.js.map