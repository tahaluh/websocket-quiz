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
const httpServer = http_1.default.createServer();
httpServer.listen(config_1.WSS_PORT, () => console.log("Listening.. on 9090"));
// hashmap clients
const clients = {};
const games = {};
// cria servidor webSocket
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
            if (result.method === "selectUsername") {
                console.log(result);
                const clientId = result.clientId;
                const username = result.username;
                if (!clients[clientId])
                    return;
                clients[clientId] = username;
                const payLoad = {
                    method: "selectUsername",
                    client: { id: clientId, username: username },
                };
                connection.send(JSON.stringify(payLoad));
            }
        }
    });
    // gera um novo clientId
    const clientId = guid();
    clients[clientId] = { connection: connection };
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
