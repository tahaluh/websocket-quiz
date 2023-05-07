const http = require("http");
const app = require("express")();
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(9091, () => console.log("Listening on http port 9091"));

const webSocketServer = require("websocket").server;
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"));

// hashmap clients
const clients = {};
const games = {};

// cria servidor webSocket
const wsServer = new webSocketServer({
  httpServer: httpServer,
});

wsServer.on("request", (request) => {
  // Conexao
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("opened!"));
  connection.on("close", () => console.log("closed!"));
  connection.on("message", (message) => {
    const result = JSON.parse(message.utf8Data);
    // ao receber uma mensagem do client

    // um usuario quer criar um novo jogo
    if (result.method === "create") {
      const clientId = result.clientId;
      const gameId = guid();
      games[gameId] = {
        id: gameId,
        balls: 20,
        clients: [],
      };

      const payLoad = {
        method: "create",
        game: games[gameId],
      };

      const con = clients[clientId].connection;

      con.send(JSON.stringify(payLoad));
    }

    // um usuario quer entrar em um jogo
    if (result.method === "join") {
      console.log(result);
      const clientId = result.clientId;
      const gameId = result.gameId;
      const game = games[gameId];

      // se excedeu a quantidade máxima de players
      if (game.clients.length >= 3) {
        return;
      }

      const color = {
        0: "Red",
        1: "Blue",
        2: "Green",
        3: "Yellow",
      }[game.clients.length];

      game.clients.push({
        clientId: clientId,
        color: color,
      });

      if (game.clients.length === 3) {
        updateGameState();
      }

      const payLoad = {
        method: "join",
        game: game,
      };

      game.clients.forEach((c) => {
        clients[c.clientId].connection.send(JSON.stringify(payLoad));
      });
    }

    // um usuario fez uma jogada
    if (result.method === "play") {
      const clientId = result.clientId;
      const gameId = result.gameId;
      const ballId = result.ballId;
      const color = result.color;

      let state = games[gameId].state;
      if (!state) {
        state = {};
      }

      state[ballId] = color;
      games[gameId].state = state;
    }

    console.log(result);
  });

  // gera um novo clientId
  const clientId = guid();
  clients[clientId] = { connection };

  const payLoad = {
    method: "connect",
    clientId: clientId,
  };

  console.log(payLoad);

  // envia de volta a conexao
  connection.send(JSON.stringify(payLoad));
});

function updateGameState() {
  for (const g of Object.keys(games)) {
    const game = games[g];
    const payLoad = {
      method: "update",
      game: game,
    };

    game.clients.forEach((c) => {
      clients[c.clientId].connection.send(JSON.stringify(payLoad));
    });
  }

  setTimeout(updateGameState, 500);
}

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
