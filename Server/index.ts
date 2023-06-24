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
interface clientsInterface {
  [name: string]: client;
}

interface gamesInterface {
  [name: string]: game;
}

interface client {
  connection?: connection;
  id: string;
  username?: string;
  gameId?: string;
}
interface game {
  id: string;
  hostId: string;
  clients: gameClient[];
  state:
    | "onLobby"
    | "onRound"
    | "onRoundFeedback"
    | "onInterval"
    | "starting"
    | "empty";
  configs: quizGameConfig;
  round: number;
}

interface quizGameConfig {
  gameMode: "quizGame";
  rounds: number;
  answerTime: number;
}

interface gameClient {
  id: string;
  username: string;
  points: number[];
  asnwers: string[];
}

interface filteredGame {
  id: string;
  hostId: string;
  clients: filteredGameClient[];
  state:
    | "onLobby"
    | "onRound"
    | "onRoundFeedback"
    | "onInterval"
    | "starting"
    | "empty";
  configs: quizGameConfig;
  round: number;
}
interface filteredGameClient {
  host: boolean;
  username: string;
  points: number[];
}

// request interfaces

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
        if (!games[gameId] || !client) return;

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
            clients[c.id].connection?.send(JSON.stringify(generalPayLoad));
          });
        }, 500);

        return;
      }

      // o host muda as configuracoes do jogo
      if (result.method === "changeConfig") {
        let gameId = result.gameId;
        let clientId = result.clientId;

        // verifica se o requerente e o host
        if (games[gameId].hostId != clientId) return;

        let configs = result.configs;
        games[gameId].configs = { ...games[gameId].configs, ...configs };

        const payLoad = {
          method: "changeConfig",
          configs: games[gameId].configs,
        };

        // avisa pra todo mundo que a config do jogo mudou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(payLoad));
        });
        return;
      }

      // o host inicia a partida
      if (result.method === "startGame") {
        let gameId = result.gameId;
        let clientId = result.clientId;

        // verifica se o requerente e o host
        if (games[gameId].hostId != clientId) return;

        // inicia o jogo
        games[gameId].state = "starting";

        const startingPayLoad = {
          method: "startingGame",
        };

        // avisa pra todo mundo que o jogo esta começando
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(startingPayLoad));
        });

        const payLoad = {
          method: "startGame",
        };

        // avisa pra todo mundo que o jogo iniciou
        setTimeout(() => {
          games[gameId].clients.forEach((c) => {
            clients[c.id].connection?.send(JSON.stringify(payLoad));
          });
        }, 1 * 1000); // aaa

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
        games[gameId].state = "onRound";

        const payLoad = {
          method: "nextRound",
          round: games[gameId].round,
        };

        // avisa pra todo mundo que o status do jogo mudou
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(payLoad));
        });

        const finishRoundPayload = {
          method: "finishRound",
        };

        setTimeout(() => {
          games[gameId].state = "onRoundFeedback";
          games[gameId].clients.forEach((c) => {
            clients[c.id].connection?.send(JSON.stringify(finishRoundPayload));
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

        const answererIndex = games[gameId].clients.findIndex(
          (player) => player.id === client.id
        );

        if (
          !!games[gameId].clients[answererIndex].asnwers[
            games[gameId].round - 1
          ]
        ) {
          return;
        }

        games[gameId].clients[answererIndex].asnwers[games[gameId].round - 1] =
          answer; // salva a resposta do player na entidade do jogo

        // avisa pra todo mundo que o status do jogo mudou
        const generalPayLoad = {
          method: "answerQuizGame",
          answer: answer,
          clientIndex: answererIndex,
        };
        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(generalPayLoad));
        });

        return;
      }

      // o host revela uma das respostas
      if (result.method === "revealAnswer") {
        const clientId = result.clientId;
        const gameId = result.gameId;
        const asnwererId = result.asnwererId;

        // verifica se o requerente e o host e o jogo esta na fase de feedback
        if (
          !games[gameId] ||
          games[gameId].hostId != clientId ||
          games[gameId].state != "onRoundFeedback"
        )
          return;

        const answererIndex = games[gameId].clients.findIndex(
          (player) => player.id.slice(0, 4) === asnwererId
        );

        const answer =
          games[gameId].clients[answererIndex].asnwers[games[gameId].round - 1];

        // retorna a resposta pra todo mundo
        const generalPayLoad = {
          method: "revealAnswer",
          answer: answer,
          clientIndex: answererIndex,
        };

        games[gameId].clients.forEach((c) => {
          clients[c.id].connection?.send(JSON.stringify(generalPayLoad));
        });

        return;
      }

      // o host avalia as respostas
      if (result.method === "quizGameFeedback") {
        const clientId = result.clientId;
        const answererId = result.answererId;
        const feedback = result.feedback;
        const gameId = result.gameId;
        const quizGame = games[gameId];
        const round = quizGame.round;

        // verifica se o requerente e o host
        if (games[gameId].hostId != clientId) return;

        const answererIndex = games[gameId].clients.findIndex(
          (player) => player.id.slice(0, 4) === answererId
        );

        if (answererIndex === -1) return;

        games[gameId].clients[answererIndex].points[round - 1] = feedback
          ? 1
          : -1;

        const payLoad = {
          method: "quizGameFeedback",
          result: feedback,
          clientIndex: answererIndex,
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

        // reseta o state
        games[gameId].state = "onLobby";
        games[gameId].round = 0;
        games[gameId].clients = games[gameId].clients.map((client) => {
          return { ...client, points: [] };
        });

        const payLoad = {
          method: "finishGame",
          game: filterGame(games[gameId]),
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

  const payLoad = {
    method: "connect",
    client: { id: clientId, username: clients[clientId]?.username },
  };

  connection.send(JSON.stringify(payLoad));
});

console.log("Listening.. on 9090");

// retorna game filtrado

const filterGame = (game: game): filteredGame => {
  let filteredGame: filteredGame = {
    ...game,
    hostId: game.hostId?.slice(0, 4),
    clients: filterClients(game.clients, game.hostId),
  };

  return filteredGame;
};

const filterClients = (
  clients: gameClient[],
  hostId: string
): filteredGameClient[] => {
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
