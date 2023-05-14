"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// request interfaces
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
    });
    connection.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.type === "utf8") {
            const result = JSON.parse(message.utf8Data);
            // o usuario informa seu username
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
                return;
            }
            // um usuario quer criar uma nova sala
            if (result.method === "createRoom") {
                const clientId = result.clientId;
                const gameId = S4();
                games[gameId] = {
                    id: gameId,
                    hostId: clientId,
                    clients: [],
                    state: "onLobby",
                    configs: {
                        gameMode: "quizGame",
                        rounds: 3,
                        answerTime: 5,
                    },
                    round: 0,
                };
                const payLoad = {
                    method: "createRoom",
                    gameId: gameId,
                };
                connection.send(JSON.stringify(payLoad));
                return;
            }
            // um usuario quer entrar em uma sala
            if (result.method === "joinRoom") {
                let gameId = result.gameId;
                let client = clients[result.clientId];
                // verifica se o jogador e a sala existem
                if (!games[gameId] || !client)
                    return;
                games[gameId].clients.push({
                    id: client.id,
                    username: client.username || "",
                    points: [],
                    asnwers: [],
                });
                // adicionar o id do jogador na entidade client
                clients[clientId].gameId = gameId;
                const payLoad = {
                    method: "joinRoom",
                    gameId: gameId,
                };
                // retorna ao player que ele entrou na sala
                connection.send(JSON.stringify(payLoad));
                // retorna o estado do jogo para o player que acabou de entrar (com um pequeno delay)
                const delayedPayLoad = {
                    method: "delayJoinRoom",
                    game: filterGame(games[gameId]),
                };
                setTimeout(() => {
                    connection.send(JSON.stringify(delayedPayLoad));
                }, 500);
                // payload para todo mundo
                const generalPayLoad = {
                    method: "joinedRoom",
                    clients: filterClients(games[gameId].clients, games[gameId].hostId),
                };
                setTimeout(() => {
                    // avisa pra todo mundo que alguem entrou
                    games[gameId].clients.forEach((c) => {
                        var _a;
                        (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(generalPayLoad));
                    });
                }, 500);
                return;
            }
            // o host muda as configuracoes do jogo
            if (result.method === "changeConfig") {
                let gameId = result.gameId;
                let clientId = result.clientId;
                // verifica se o requerente e o host
                if (games[gameId].hostId != clientId)
                    return;
                let configs = result.configs;
                games[gameId].configs = Object.assign(Object.assign({}, games[gameId].configs), configs);
                const payLoad = {
                    method: "changeConfig",
                    configs: games[gameId].configs,
                };
                // avisa pra todo mundo que a config do jogo mudou
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(payLoad));
                });
                return;
            }
            // o host inicia a partida
            if (result.method === "startGame") {
                let gameId = result.gameId;
                let clientId = result.clientId;
                // verifica se o requerente e o host
                if (games[gameId].hostId != clientId)
                    return;
                // inicia o jogo
                games[gameId].state = "starting";
                const startingPayLoad = {
                    method: "startingGame",
                };
                // avisa pra todo mundo que o jogo esta começando
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(startingPayLoad));
                });
                const payLoad = {
                    method: "startGame",
                };
                // avisa pra todo mundo que o jogo iniciou
                setTimeout(() => {
                    games[gameId].clients.forEach((c) => {
                        var _a;
                        (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(payLoad));
                    });
                }, 1 * 1000); // aaa
                return;
            }
            // o host inicia o proximo round
            if (result.method === "nextRound") {
                const clientId = result.clientId;
                const gameId = result.gameId;
                // verifica se o requerente e o host
                if (games[gameId].hostId != clientId)
                    return;
                // aumenta um numero no round
                games[gameId].round += 1;
                games[gameId].state = "onRound";
                const payLoad = {
                    method: "nextRound",
                    round: games[gameId].round,
                };
                // avisa pra todo mundo que o status do jogo mudou
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(payLoad));
                });
                const finishRoundPayload = {
                    method: "finishRound",
                };
                setTimeout(() => {
                    games[gameId].state = "onRoundFeedback";
                    games[gameId].clients.forEach((c) => {
                        var _a;
                        (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(finishRoundPayload));
                    });
                }, (games[gameId].configs.answerTime + 1) * 1000);
                return;
            }
            // um player envia sua resposta
            if (result.method === "answerQuizGame") {
                const client = clients[result.clientId];
                const gameId = result.gameId;
                const answer = result.answer;
                // verifica se o jogador e a sala existem e se o modo de jogo está aceitando respostas
                if (!games[gameId] || !client || games[gameId].state != "onRound")
                    return;
                const answererIndex = games[gameId].clients.findIndex((player) => player.id === client.id);
                games[gameId].clients[answererIndex].asnwers[games[gameId].round - 1] =
                    answer; // salva a resposta do player na entidade do jogo
                // avisa pra todo mundo que o status do jogo mudou
                const generalPayLoad = {
                    method: "answerQuizGame",
                    answer: answer,
                    clientIndex: answererIndex,
                };
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(generalPayLoad));
                });
                return;
            }
            // o host avalia as respostas
            if (result.method === "quizGameFeedback") {
                const clientId = result.clientId;
                const answererId = result.answererId;
                const correct = result.correct;
                const gameId = result.gameId;
                const quizGame = games[gameId];
                const round = quizGame.round;
                // verifica se o requerente e o host
                if (games[gameId].hostId != clientId)
                    return;
                const answererIndex = games[gameId].clients.findIndex((client) => client.id === answererId);
                if (answererIndex === -1)
                    return;
                games[gameId].clients[answererIndex].points[round - 1] = correct
                    ? 1
                    : -1;
                const payLoad = {
                    method: "quizGameFeedback",
                    clients: filterClients(games[gameId].clients, games[gameId].hostId),
                };
                // avisa pra todo mundo que o status do jogo mudou
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(payLoad));
                });
                return;
            }
            // o host finaliza o jogo
            if (result.method === "finishGame") {
                const clientId = result.clientId;
                const gameId = result.gameId;
                // verifica se o requerente e o host
                if (games[gameId].hostId != clientId)
                    return;
                // reseta o state
                games[gameId].state = "onLobby";
                games[gameId].round = 0;
                games[gameId].clients = games[gameId].clients.map((client) => {
                    return Object.assign(Object.assign({}, client), { points: [] });
                });
                const payLoad = {
                    method: "finishGame",
                    game: filterGame(games[gameId]),
                };
                // avisa pra todo mundo que o status do jogo mudou
                games[gameId].clients.forEach((c) => {
                    var _a;
                    (_a = clients[c.id].connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(payLoad));
                });
                return;
            }
        }
    }));
    // gera um novo clientId
    const clientId = guid();
    clients[clientId] = { connection: connection, id: clientId };
    const payLoad = {
        method: "connect",
        client: { id: clientId, username: (_a = clients[clientId]) === null || _a === void 0 ? void 0 : _a.username },
    };
    connection.send(JSON.stringify(payLoad));
});
console.log("Listening.. on 9090");
// retorna game filtrado
const filterGame = (game) => {
    var _a;
    let filteredGame = Object.assign(Object.assign({}, game), { hostId: (_a = game.hostId) === null || _a === void 0 ? void 0 : _a.slice(0, 4), clients: filterClients(game.clients, game.hostId) });
    return filteredGame;
};
const filterClients = (clients, hostId) => {
    return clients.map((client) => ({
        host: client.id == hostId,
        id: client.id.slice(0, 4),
        username: client.username,
        points: client.points,
        answers: client.asnwers,
    }));
};
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
