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
  connection: connection;
  id?: string;
  username?: string;
}
interface clientsInterface {
  [name: string]: client | null;
}
const httpServer = http.createServer();
httpServer.listen(WSS_PORT, () => console.log("Listening.. on 9090"));

// hashmap clients
const clients: clientsInterface = {};
const games = {};

// cria servidor webSocket
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
    console.log("\n\n")
  });

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      const result = JSON.parse(message.utf8Data);

      if (result.method === "selectUsername") {
        console.log(result)
        const clientId = result.clientId;
        const username = result.username;

        if (!clients[clientId]) return;
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
