import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useWebSocketContext } from "../contexts/useWebSocketContext";
import { useEffect, useState } from "react";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Iconify from "../components/iconify";
import {
  ChangeConfigsRoomMessage,
  DelayJoinRoomMessage,
  Game,
  JoinedRoomMessage,
  StartGameMessage,
  StartingGameMessage,
} from "../@types/localEntity";
import { useAuthContext } from "../contexts/useUserContext";
import GameConfigPopover from "../components/gameConfigPopover/GameConfigPopover";
import { useSnackbar } from "notistack";
import { PATH_GAME } from "../routes/paths";
import { useGameContext } from "../contexts/useGameContext";

export default function RoomPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { ws } = useWebSocketContext();
  const { user } = useAuthContext();
  const { game, setGame, reset } = useGameContext();

  const { enqueueSnackbar } = useSnackbar();

  const [gameMode, setGameMode] = useState<string>("quizGame");

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (message) => {
      const response:
        | JoinedRoomMessage
        | DelayJoinRoomMessage
        | ChangeConfigsRoomMessage
        | StartGameMessage
        | StartingGameMessage = JSON.parse(message.data);

      if (response.method === "joinedRoom") {
        const clients = response.clients;
        setGame((prev) => {
          return {
            ...prev,
            clients: clients,
          };
        });
      } else if (response.method === "delayJoinRoom") {
        const tempGame = response.game;
        setGame((prev) => {
          return {
            ...prev,
            ...tempGame,
            hostId: tempGame.hostId,
          };
        });
      } else if (response.method === "changeConfig") {
        const configs = response.configs;
        setGame((prev) => {
          return {
            ...prev,
            configs: configs,
          };
        });
        if (game.hostId === user?.id.slice(0, 4)) {
          enqueueSnackbar("Configurações alteradas com sucesso!");
        }
      } else if (response.method === "startingGame") {
        setGame((prev) => {
          return {
            ...prev,
            state: "starting",
          };
        });
        setCounter(5);
      } else if (response.method === "startGame") {
        setGame((prev) => {
          return {
            ...prev,
            round: 1,
            state: "onGame",
          };
        });
        console.log("o jogo começou");
        navigate(PATH_GAME.gameRoom(id || ""));
      }
    };
  }, [game.hostId === user?.id.slice(0, 4)]);

  const handleStartGame = () => {
    if (!ws) return;

    const payLoad = {
      method: "startGame",
      clientId: user ? user.id : "",
      gameId: id,
    };

    ws.send(JSON.stringify(payLoad));
  };

  // counter

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (game.state === "starting")
      counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  return (
    <>
      <Helmet>
        <title> Sala </title>
      </Helmet>
      <Backdrop
        sx={{ color: "#fff", zIndex: 9 }}
        open={game.state === "starting"}
      >
        <Typography variant="h1" fontFamily="cursive" color="white">
          {counter ? `${counter}...` : "Start!"}
        </Typography>
      </Backdrop>
      <Grid
        container
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={14}
        minHeight="90vh"
      >
        <Grid
          container
          item
          justifySelf="flex-start"
          alignSelf="flex-start"
          alignItems="center"
          sx={{
            position: "fixed",
            top: "10px",
            cursor: "pointer",
          }}
          role="button"
          onClick={() => {
            navigator.clipboard.writeText(id || "");
          }}
          gap={1}
        >
          <Grid>
            <Typography variant="caption" fontSize={15} display="inline">
              Código da sala: {id}{" "}
            </Typography>
          </Grid>
          <Grid>
            <Iconify
              icon="material-symbols:content-copy-outline"
              width="24px"
              color="grey"
            />
          </Grid>
        </Grid>

        <Grid
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
                <Grid item container alignItems="center" key={index}>
                  <Grid>
                    <Typography display="inline">{player.username} </Typography>
                  </Grid>
                  <Grid>
                    {player.host ? (
                      <Iconify
                        icon="ph:crown-simple"
                        width="24px"
                        color="gold"
                      />
                    ) : (
                      ""
                    )}
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item container xs={10} md={8} lg={5} alignItems="center">
          <Grid item xs={1.2} justifyItems="center">
            <GameConfigPopover
              configs={game.configs}
              host={game.hostId === user?.id.slice(0, 4)}
            />
          </Grid>
          <Grid item xs={10.8}>
            <Select
              fullWidth
              displayEmpty
              variant="outlined"
              disabled={!(game.hostId === user?.id.slice(0, 4))}
              value={
                game.hostId === user?.id.slice(0, 4)
                  ? gameMode
                  : game.configs.gameMode
              }
              onChange={(e) => {
                setGameMode(e.target.value);
              }}
            >
              <MenuItem value={""} disabled>
                <Typography variant="overline">Modo de jogo...</Typography>
              </MenuItem>
              <MenuItem value={"quizGame"}>Quiz Game</MenuItem>
            </Select>
          </Grid>
        </Grid>

        <Grid item container xs={8} md={6} lg={4} xl={3} alignItems="center">
          <Button
            fullWidth
            size="large"
            variant={
              game.hostId === user?.id.slice(0, 4) ? "contained" : "outlined"
            }
            color="success"
            onClick={handleStartGame}
            disabled={!(game.hostId === user?.id.slice(0, 4))}
          >
            {game.hostId === user?.id.slice(0, 4) ? (
              "Iniciar Partida"
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
      </Grid>
    </>
  );
}
