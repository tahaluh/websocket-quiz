import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import Iconify from "../components/iconify";
import { useWebSocketContext } from "../contexts/useWebSocketContext";
import { useAuthContext } from "../contexts/useUserContext";
import { useGameContext } from "../contexts/useGameContext";
import { useEffect, useState } from "react";
import {
  AnswerQuizGame,
  ConfirmAnswerQuizGame,
  NextRoundMessage,
} from "../@types/localEntity";

export default function GamePage() {
  const { ws } = useWebSocketContext();
  const { user } = useAuthContext();
  const { game, setGame } = useGameContext();

  const [answer, setAnswer] = useState<string>("");

  // ws message
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (message) => {
      const response:
        | NextRoundMessage
        | ConfirmAnswerQuizGame
        | AnswerQuizGame = JSON.parse(message.data);

      if (response.method === "nextRound") {
        setGame((prev) => {
          return {
            ...prev,
            state: "onRound",
            round: prev.round + 1,
          };
        });
        setCounter(game.configs.answerTime * 10);
      } else if (response.method === "confirmAnswerQuizGame") {
        setGame((prev) => {
          const tempClients = prev.clients;
          const localClientIndex = tempClients.findIndex(
            (client) => client.id === user?.id.slice(0, 4)
          );

          tempClients[localClientIndex] = {
            ...tempClients[localClientIndex],
            answer: answer,
          };

          return {
            ...prev,
            clients: tempClients,
          };
        });
      } else if (response.method === "answerQuizGame") {
        const clientIndex = response.clientIndex;
        const clientAnswer = response.asnwer;

        setGame((prev) => {
          const tempClients = prev.clients;

          tempClients[clientIndex] = {
            ...tempClients[clientIndex],
            answer: clientAnswer,
          };

          return {
            ...prev,
            clients: tempClients,
          };
        });
      }
    };
  }, [game.hostId === user?.id.slice(0, 4)]);

  // handle

  const handleAnswerRound = () => {
    if (!ws) return;

    const payLoad = {
      method: "answerQuizGame",
      clientId: user ? user.id : "",
      gameId: game.id,
      answer: answer,
    };

    ws.send(JSON.stringify(payLoad));
  };

  const handleNextRound = () => {
    if (!ws) return;

    const payLoad = {
      method: "nextRound",
      clientId: user ? user.id : "",
      gameId: game.id,
    };

    ws.send(JSON.stringify(payLoad));
  };

  // counter

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (counter > game.configs.answerTime * 10) {
      setCounter(game.configs.answerTime * 10);
    } else if (counter >= 0 && game.state === "onRound")
      counter > 0 && setTimeout(() => setCounter((prev) => prev - 1), 100);
  }, [counter]);

  return (
    <>
      <Helmet>
        <title> Jogo </title>
      </Helmet>
      {game.state === "onRound" && ( // caso esteja no round
        <Grid // listagem de players
          container
          item
          alignItems="center"
          sx={{
            position: "fixed",
            top: "0",
            left: "0",
          }}
        >
          <Grid
            padding={1}
            sx={{
              backgroundColor: "rgba(0,0,0,0.25)",
              borderRadius: "0 0 10px 0",
            }}
          >
            {game.clients.map((player, index) => {
              return (
                <Grid item container alignItems="center" key={index}>
                  <Grid>
                    <Typography display="inline">{player.username} </Typography>
                  </Grid>
                  <Grid>
                    {player.host ? (
                      <Iconify
                        icon="ph:crown-simple-fill"
                        width="24px"
                        color="gold"
                      />
                    ) : (
                      ""
                    )}
                  </Grid>
                  <Grid>
                    <Typography display="inline">
                      :{" "}
                      {player.points.reduce(
                        (partialSum, a) => partialSum + a,
                        0
                      ) || 0}
                    </Typography>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      )}

      {!!game.round && ( // caso o round seja diferente de 0, o timer aparece
        <>
          <Grid // contador de round
            container
            item
            justifyContent="center"
            alignItems="center"
            sx={{
              position: "fixed",
              top: "0",
            }}
          >
            <Grid item paddingX={3} border={1} borderTop={0}>
              <Typography padding={1} fontFamily={"cursive"}>
                {game.round || 1}
              </Typography>
            </Grid>
          </Grid>

          <Grid // circle timer
            container
            item
            justifyContent="flex-end"
            alignItems="center"
            sx={{
              position: "fixed",
              top: "0",
              right: "0",
            }}
          >
            <Grid padding={1}>
              <CircularProgress
                size={50}
                thickness={22}
                variant="determinate"
                value={100 - (counter * 10) / game.configs.answerTime}
                color="error"
                sx={{
                  backgroundColor: "green",
                  borderRadius: "50%",
                  border: "solid 2px #333",
                }}
              />
            </Grid>
          </Grid>
        </>
      )}

      <Grid // container principal
        container
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={14}
        minHeight="90vh"
      >
        {game.state === "onRoundFeedback" ||
          (game.state === "onInterval" && ( // caso o jogo não esteja em round
            <>
              <Grid // lista de jogadores
                container
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                spacing={4}
              >
                <Grid item xs={8} md={5} justifyContent="center">
                  <Typography>Lista de Jogadores:</Typography>
                </Grid>
                <Grid item container xs={8} md={4} direction="column">
                  {game.clients.map((player, index) => {
                    return (
                      <Grid
                        item
                        container
                        alignItems="center"
                        key={index}
                        padding={1}
                        border={1}
                        borderTop={!index ? 1 : 0}
                      >
                        <Grid>
                          <Typography display="inline">
                            {player.username}{" "}
                          </Typography>
                        </Grid>
                        <Grid>
                          {player.host ? (
                            <Iconify
                              icon="ph:crown-simple-fill"
                              width="24px"
                              color="gold"
                            />
                          ) : (
                            ""
                          )}
                        </Grid>
                        <Grid>
                          <Typography display="inline">
                            :{" "}
                            {player.points.reduce(
                              (partialSum, a) => partialSum + a,
                              0
                            ) || 0}
                          </Typography>
                          {!!game.round && (
                            <Typography
                              display="inline"
                              color={
                                player.points[game.round] === 1
                                  ? "success"
                                  : "error"
                              }
                            >{` ${
                              player.points[game.round - 1] || ""
                            }`}</Typography>
                          )}
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              <Grid // Botão de próximo round
                item
                container
                xs={8}
                md={6}
                lg={4}
                xl={3}
                alignItems="center"
              >
                <Button
                  fullWidth
                  size="large"
                  variant={
                    game.hostId === user?.id.slice(0, 4)
                      ? "contained"
                      : "outlined"
                  }
                  color="success"
                  onClick={handleNextRound}
                  disabled={!(game.hostId === user?.id.slice(0, 4))}
                >
                  {game.hostId === user?.id.slice(0, 4) ? (
                    game.state === "onInterval" ? (
                      "Iniciar Round"
                    ) : (
                      "Próximo Round"
                    )
                  ) : (
                    <>
                      {"Aguarde pelo host... "}
                      <Iconify
                        icon="ph:crown-simple-fill"
                        width="24px"
                        color="gold"
                      />
                    </>
                  )}
                </Button>
              </Grid>
            </>
          ))}
        {game.state === "onRound" && ( // caso o jogo esteja em round
          <>
            <Grid // Timer
              item
              xs={8}
              alignItems="center"
            >
              <Typography
                variant="h1"
                fontFamily="cursive"
                color={counter <= 50 ? "black" : "white"}
              >
                {counter ? `${Math.ceil(counter / 10)}...` : "Zero!"}
              </Typography>
            </Grid>
            <Grid // Inserir resposta
              item
              container
              xs={12}
              md={8}
              xl={5}
              alignItems="center"
              justifyContent="center"
              gap={3}
            >
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Resposta"
                  placeholder="Insira sua resposta..."
                  onChange={(e) => {
                    setAnswer(e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={9}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="success"
                  onClick={handleAnswerRound}
                  disabled={!(game.hostId === user?.id.slice(0, 4))}
                >
                  Enviar resposta
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
