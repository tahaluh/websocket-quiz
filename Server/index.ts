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
}
interface clientsInterface {
  [name: string]: client;
}
interface game {
  id?: string;
  hostId?: string;
  clients: gameClient[];
}

interface gameClient {
  id: string;
  username: string;
  points: number;
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
    console.log("\n\n");
  });

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      const result = JSON.parse(message.utf8Data);
      console.log(result);

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
          game: { id: gameId, ...games[gameId] },
        };

        connection.send(JSON.stringify(payLoad));
      }

      // um usuario quer entrar em uma sala
      if (result.method === "joinRoom") {
        let gameId = result.gameId;
        let clientId = result.clientId;
        let client = clients[clientId];

        if (!games[gameId] || !client) return;
        games[gameId].clients.push({
          id: client.id,
          username: client.username || "",
          points: 0,
        });

        const payLoad = {
          method: "joinRoom",
          game: { id: gameId, ...games[gameId] },
        };

        connection.send(JSON.stringify(payLoad));

        const generalPayLoad = {
          method: "joinedRoom",
          game: games[gameId],
        };

        // avisa pra todo mundo que alguem entrou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(generalPayLoad));
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
