import {
  Button,
  ButtonBase,
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
  AnswerQuizGameMessage,
  FinishGameMessage,
  FinishRoundMessage,
  NextRoundMessage,
  QuizGameFeedbackMessage,
  RevealAnswerMessage,
  answerCard,
} from "../@types/localEntity";
import PlayerAnswerCard from "../components/playerAnswerCard/playerAnswerCard";
import { useNavigate } from "react-router-dom";
import { PATH_GAME } from "../routes/paths";
import universalTransition from "../animations/transition";

export default function GamePage() {
  const { ws } = useWebSocketContext();
  const { user } = useAuthContext();
  const { game, setGame } = useGameContext();
  const navigate = useNavigate();
  const [answersCards, setAnswersCards] = useState<answerCard[]>([]);

  const [answer, setAnswer] = useState<string>("");

  // ws message
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (message) => {
      const response:
        | NextRoundMessage
        | AnswerQuizGameMessage
        | FinishRoundMessage
        | RevealAnswerMessage
        | QuizGameFeedbackMessage
        | FinishGameMessage = JSON.parse(message.data);

      if (response.method === "nextRound") {
        setGame((prev) => {
          prev.state = "onRound";
          prev.round = prev.round + 1;
          return prev;
        });
        setCounter(game.configs.answerTime * 10);
        setAnswersCards([]);
      } else if (response.method === "answerQuizGame") {
        const clientIndex = response.clientIndex;

        setGame((prev) => {
          const tempClients = prev.clients;
          tempClients[clientIndex].answers[game.round - 1] = null;

          return {
            ...prev,
            clients: tempClients,
          };
        });

        setAnswersCards((prev) => {
          if (!prev.find((client) => client.clientIndex == clientIndex)) {
            prev.push({
              clientIndex: clientIndex,
              width: `${Math.floor(Math.random() * 38 * 2) - 38}vw`,
              height: `${
                Math.floor(Math.random() * 40 * 2) - 40 - prev.length * 10
              }vh`,
              rotation: `${Math.floor(Math.random() * 180) - 90}deg`,
            });
          }
          return prev;
        });
      } else if (response.method === "finishRound") {
        console.log("terminou o round");
        setGame((prev) => {
          return { ...prev, state: "onRoundFeedback" };
        });
      } else if (response.method === "revealAnswer") {
        const clientIndex = response.clientIndex;
        const revealedAnswer = response.answer;
        setGame((prev) => {
          let tempClients = [...prev.clients];
          tempClients[clientIndex].answers[game.round - 1] = revealedAnswer;

          return { ...prev, clients: tempClients };
        });
      } else if (response.method === "quizGameFeedback") {
        const clientIndex = response.clientIndex;
        const result = response.result;
        setGame((prev) => {
          let tempClients = [...prev.clients];
          tempClients[clientIndex].points[game.round - 1] = result ? 1 : -1;

          return { ...prev, clients: tempClients };
        });
      } else if (response.method === "finishGame") {
        const resetGame = response.game;
        setGame((prev) => {
          return resetGame;
        });
        navigate(PATH_GAME.roomLobby(game.id || ""));
      }
    };
  }, [game.hostId === user?.id.slice(0, 4), game.round]);

  useEffect(() => {
    console.log(game);
  }, [game]);

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
      method: game.round < game.configs.rounds ? "nextRound" : "finishGame",
      clientId: user ? user.id : "",
      gameId: game.id,
    };

    ws.send(JSON.stringify(payLoad));
  };

  useEffect(() => {}, [game]);

  // counter

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (counter > game.configs.answerTime * 10) {
      setCounter(game.configs.answerTime * 10);
    } else if (
      (counter >= 0 && game.state === "onRound") ||
      game.state === "onRoundFeedback"
    )
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
        marginTop={9}
        flexDirection="column"
        alignItems="center"
        gap={12}
        sx={{
          transition: universalTransition,
        }}
      >
        {
          // caso o jogo não esteja em round
          <>
            {(game.state === "onInterval" ||
              game.state === "onRoundFeedback" ||
              game.state === "onRound") && (
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
                                player.points[game.round - 1] > 0
                                  ? "green"
                                  : "error"
                              }
                            >{`${player.points[game.round - 1] > 0 ? "+" : ""}${
                              player.points[game.round - 1] || ""
                            }`}</Typography>
                          )}
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            )}

            {(game.state === "onRoundFeedback" || game.state === "onRound") && ( // map respostas de jogadores
              <Grid
                container
                item
                justifyContent={"center"}
                flexDirection={"column"}
                alignItems={"center"}
                sx={{ transition: universalTransition }}
              >
                {answersCards.map((asnwerCard) => {
                  return <PlayerAnswerCard answerCard={asnwerCard} />;
                })}
              </Grid>
            )}

            {(game.state === "onInterval" ||
              game.state === "onRoundFeedback") &&
            answersCards.every((answerCard) => {
              return (
                game.clients[answerCard.clientIndex].points[game.round - 1] !==
                undefined
              );
            }) ? (
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
                    ) : game.round < game.configs.rounds ? (
                      "Próximo Round"
                    ) : (
                      "Finalizar Partida"
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
            ) : (
              <></>
            )}
          </>
        }
      </Grid>
      {game.state === "onRound" && ( // caso o jogo esteja em round
        <>
          <Grid
            container
            position="fixed"
            sx={{ top: "30vh" }}
            alignContent={"center"}
            justifyContent={"center"}
            gap={10}
          >
            <Grid // Timer
              item
              container
              alignItems="center"
              justifyContent={"center"}
            >
              <Typography
                variant="h1"
                fontFamily="cursive"
                color={counter <= 50 ? "black" : "white"}
              >
                {counter ? `${Math.ceil(counter / 10)}...` : "Zero!"}
              </Typography>
            </Grid>
            {/* game.clients[clientIndex].answers[game.round] */}
            {!game.clients.some((player) => {
              return (
                player.id === user?.id.slice(0, 4) &&
                player.answers[game.round - 1] === null
              );
            }) && (
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
                  >
                    Enviar resposta
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </>
  );
}
