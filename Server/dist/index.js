"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const config_1 = require("./config");
const websocket_1 = require("websocket");
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.send("HELLO FROM EXPRESS + TS!!!!");
});
app.listen(config_1.EXPRESS_PORT, () => {
    console.log(`now listening on port ${config_1.EXPRESS_PORT}`);
});
// hashmap clients
const clients = {};
const games = {};
// cria servidor webSocket
const httpServer = http_1.default.createServer();
httpServer.listen(config_1.WSS_PORT, () => console.log("Listening.. on 9090"));
const wss = new websocket_1.server({
    httpServer: httpServer,
});
wss.on("request", (request) => {
    var _a;
    // Conexao
    const connection = request.accept(null, request.origin);
    connection.on("resume", () => {
        console.log(`conexao aberta`);
    });
    connection.on("close", (code, message) => {
        console.log(`Client disconnected. Reason: ${message}`);
        console.log("\n\n");
    });
    connection.on("message", (message) => {
        if (message.type === "utf8") {
            const result = JSON.parse(message.utf8Data);
            console.log(result);
            if (result.method === "selectUsername") {
                const clientId = result.clientId;
                const username = result.username;
                if (!clients[clientId])
                    return;
                clients[clientId].username = username;
                const payLoad = {
                    method: "selectUsername",
                    client: { id: clientId, username: username },
                };
                connection.send(JSON.stringify(payLoad));
            }
            // um usuario quer criar uma nova sala
            if (result.method === "createRoom") {
                const clientId = result.clientId;
                const gameId = S4();
                games[gameId] = {
                    hostId: clientId,
                    clients: [],
                };
                const payLoad = {
                    method: "createRoom",
                    game: Object.assign({ id: gameId }, games[gameId]),
                };
                connection.send(JSON.stringify(payLoad));
            }
            // um usuario quer entrar em uma sala
            if (result.method === "joinRoom") {
                let gameId = result.gameId;
                let clientId = result.clientId;
                let client = clients[clientId];
                if (!games[gameId] || !client)
                    return;
                games[gameId].clients.push({
                    id: client.id,
                    username: client.username || "",
                    points: 0,
                });
                const payLoad = {
                    method: "joinRoom",
                    game: Object.assign({ id: gameId }, games[gameId]),
                };
                connection.send(JSON.stringify(payLoad));
                const generalPayLoad = {
                    method: "joinedRoom",
                    game: games[gameId],
                };
                // avisa pra todo mundo que alguem entrou
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(generalPayLoad));
                });
            }
        }
    });
    // gera um novo clientId
    const clientId = guid();
    clients[clientId] = { connection: connection, id: clientId };
    console.log(Object.keys(clients).length);
    const payLoad = {
        method: "connect",
        client: { id: clientId, username: (_a = clients[clientId]) === null || _a === void 0 ? void 0 : _a.username },
    };
    connection.send(JSON.stringify(payLoad));
});
console.log("Listening.. on 9090");
// Gera id
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
const guid = () => (S4() +
    S4() +
    "-" +
    S4() +
    "-4" +
    S4().substr(0, 3) +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()).toLowerCase();
