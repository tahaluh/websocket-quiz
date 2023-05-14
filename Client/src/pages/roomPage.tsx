import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useWebSocketContext } from "../contexts/useWebSocketContext";
import { useEffect, useState } from "react";
import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Iconify from "../components/iconify";
import {
  DelayJoinRoomMessage,
  Game,
  JoinedRoomMessage,
  Player,
} from "../@types/localEntity";
import { useAuthContext } from "../contexts/useUserContext";

export default function RoomPage() {
  const { id } = useParams();
  const { ws } = useWebSocketContext();
  const { user } = useAuthContext();

  const [game, setGame] = useState<Game>({
    id: id,
    hostId: "",
    clients: [],
    state: "onLobby",
    round: 0,
  });
  const [gameMode, setGameMode] = useState<string>("");

  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (message) => {
      const response: JoinedRoomMessage | DelayJoinRoomMessage = JSON.parse(
        message.data
      );

      if (response.method === "joinedRoom") {
        const clients = response.clients;
        setGame((prev) => {
          return {
            ...prev,
            clients: clients,
          };
        });
      }

      if (response.method === "delayJoinRoom") {
        const tempGame = response.game;
        setGame(tempGame);

        console.log(tempGame);
      }
    };
  }, []);

  const handleStartGame = () => {};

  return (
    <>
      <Helmet>
        <title> Sala </title>
      </Helmet>
      <Grid
        container
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={14}
        minHeight="90vh"
      >
        <Grid
          item
          xs={6}
          md={4}
          justifySelf="flex-start"
          alignSelf="flex-start"
          sx={{ position: "fixed", top: "10px" }}
        >
          <Typography
            variant="caption"
            fontSize={15}
            onClick={() => {
              navigator.clipboard.writeText(id || "");
            }}
          >
            Código da sala: {id}
          </Typography>
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
            <IconButton onClick={() => {}}>
              <Iconify icon="ph:gear" width="30px" />
            </IconButton>
          </Grid>
          <Grid item xs={10.8}>
            <Button
              onClick={() => {
                console.log(game);
                console.log(user?.id.slice(0, 4));
              }}
            >
              Clica
            </Button>
            <Select
              fullWidth
              displayEmpty
              variant="outlined"
              disabled={!(game.hostId === user?.id.slice(0, 4))}
              value={gameMode}
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
            variant="contained"
            color="success"
            onClick={handleStartGame}
          >
            Iniciar Partida
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
