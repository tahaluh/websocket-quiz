import express, { Express, Request, Response } from "express";
import http from "http";
import { WSS_PORT, EXPRESS_PORT } from "./config";
import { server as WebSocketServer, connection } from "websocket";

const app: Express = express();
app.get("/", (req: Request, res: Response) => {
  res.send("HELLO FROM EXPRESS + TS!!!!");
});
app.listen(EXPRESS_PORT, () => {
  console.log(`now listening on port ${EXPRESS_PORT}`);
});

interface client {
  connection?: connection;
  id: string;
  username?: string;
  gameId?: string;
}
interface clientsInterface {
  [name: string]: client;
}
interface game {
  id?: string;
  hostId?: string;
  clients: gameClient[];
  state: "onLobby" | "onGame" | "empty";
  round: number;
}

interface gameClient {
  id: string;
  host: boolean;
  username: string;
  points: number[];
}
interface gamesInterface {
  [name: string]: game;
}

// hashmap clients
const clients: clientsInterface = {};
const games: gamesInterface = {};

// cria servidor webSocket
const httpServer = http.createServer();
httpServer.listen(WSS_PORT, () => console.log("Listening.. on 9090"));

const wss = new WebSocketServer({
  httpServer: httpServer,
});

wss.on("request", (request) => {
  // Conexao
  const connection = request.accept(null, request.origin);

  connection.on("resume", () => {
    console.log(`conexao aberta`);
  });

  connection.on("close", (code: number, message: string) => {
    console.log(`Client disconnected. Reason: ${message}`);
  });

  connection.on("message", async (message) => {
    if (message.type === "utf8") {
      const result = JSON.parse(message.utf8Data);

      // o usuario informa seu username
      if (result.method === "selectUsername") {
        const clientId = result.clientId;
        const username = result.username;

        if (!clients[clientId]) return;
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
          hostId: clientId,
          clients: [],
          state: "onLobby",
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
        let clientId = result.clientId;
        let client = clients[clientId];

        // verifica se o jogador e a sala existem
        if (!games[gameId] || !client) return;

        games[gameId].clients.push({
          id: client.id,
          host: client.id === games[gameId].hostId,
          username: client.username || "",
          points: [],
        });

        // adicionar o id do jogador na entidade client
        clients[clientId].gameId = gameId;

        const payLoad = {
          method: "joinRoom",
          gameId: gameId,
        };

        // retorna ao player que ele entrou na sala
        connection.send(JSON.stringify(payLoad));

        const generalPayLoad = {
          method: "joinedRoom",
          clients: games[gameId].clients,
        };

        setTimeout(() => {
          // avisa pra todo mundo que alguem entrou
          games[gameId].clients.forEach((c) => {
            clients[c.id].connection?.send(JSON.stringify(generalPayLoad));
          });
        }, 1000);

        return;
      }

      // o host inicia a partida
      if (result.method === "startGame") {
        let gameId = result.gameId;
        let clientId = result.clientId;

        // verifica se o requerente e o host
        if (games[gameId].hostId != clientId) return;

        // inicia o jogo
        games[gameId].state = "onGame";
        games[gameId].round = 1;

        const payLoad = {
          method: "startGame",
          game: games[gameId],
        };

        // avisa pra todo mundo que o status do jogo mudou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(payLoad));
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
        if (games[gameId].hostId != clientId) return;

        const answererIndex = games[gameId].clients.findIndex(
          (client) => client.id === answererId
        );

        if (answererIndex === -1) return;

        games[gameId].clients[answererIndex].points[round - 1] = correct
          ? 1
          : -1;

        const payLoad = {
          method: "quizGameFeedback",
          clients: games[gameId].clients,
        };

        // avisa pra todo mundo que o status do jogo mudou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(payLoad));
        });
        return;
      }

      // o host inicia o proximo round
      if (result.method === "nextRound") {
        const clientId = result.clientId;
        const gameId = result.gameId;

        // verifica se o requerente e o host
        if (games[gameId].hostId != clientId) return;

        // aumenta um numero no round
        games[gameId].round += 1;

        const payLoad = {
          method: "nextRound",
          game: games[gameId],
        };

        // avisa pra todo mundo que o status do jogo mudou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(payLoad));
        });
        return;
      }

      // o host finaliza o jogo
      if (result.method === "finishGame") {
        const clientId = result.clientId;
        const gameId = result.gameId;

        // verifica se o requerente e o host
        if (games[gameId].hostId != clientId) return;

        // aumenta um numero no round
        games[gameId].state = "onLobby";
        games[gameId].round = 0;
        games[gameId].clients = games[gameId].clients.map((client) => {
          return { ...client, points: [] };
        });

        const payLoad = {
          method: "finishGame",
          game: games[gameId],
        };

        // avisa pra todo mundo que o status do jogo mudou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(payLoad));
        });

        return;
      }
    }
  });

  // gera um novo clientId
  const clientId = guid();
  clients[clientId] = { connection: connection, id: clientId };

  console.log(Object.keys(clients).length);

  const payLoad = {
    method: "connect",
    client: { id: clientId, username: clients[clientId]?.username },
  };

  connection.send(JSON.stringify(payLoad));
});

console.log("Listening.. on 9090");

// Gera id

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

const guid = () =>
  (
    S4() +
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
    S4()
  ).toLowerCase();
