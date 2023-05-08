import { Helmet } from "react-helmet-async";
import { useAuthContext } from "../contexts/useUserContext";
import { useWebSocketContext } from "../contexts/useWebSocketContext";
import { useNavigate } from "react-router-dom";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PATH_GAME } from "../routes/paths";

export default function JoinPage() {
  const { user } = useAuthContext();
  const { ws } = useWebSocketContext();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState<string>("");

  const handleJoinRoom = (gameId: string) => {
    if (!ws) return;

    console.log(roomCode);

    const payLoad = {
      method: "joinRoom",
      clientId: user ? user.id : "",
      gameId: gameId,
    };

    ws.send(JSON.stringify(payLoad));

    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      
      if (response.method === "joinRoom") {
        let gameId = response.gameId;
        navigate(PATH_GAME.roomLobby(gameId));
      }
    };
  };

  const handleCreateRoom = () => {
    const payLoad = {
      method: "createRoom",
      clientId: user ? user.id : "",
    };
    if (!ws) return;

    ws.send(JSON.stringify(payLoad));

    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);

      if (response.method === "createRoom") {
        let gameId = response.gameId;

        handleJoinRoom(gameId);
      }
    };
  };

  return (
    <>
      <Helmet>
        <title> Entrar </title>
      </Helmet>
      <Grid
        container
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        spacing={6}
      >
        <Grid
          item
          container
          xs={8}
          md={6}
          lg={4}
          xl={3}
          justifyContent="center"
        >
          <Typography align="center" variant="overline" fontSize={20}>
            {user?.username}
          </Typography>
        </Grid>
        <Grid item container xs={8} md={6} lg={4} xl={3} alignItems="center">
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="success"
            onClick={handleCreateRoom}
          >
            Criar Sala
          </Button>
        </Grid>
        <Grid item container xs={8} md={6} lg={4} xl={3}>
          <TextField
            fullWidth
            placeholder="Insira o código da sala..."
            label="Código da sala"
            variant="outlined"
            onChange={(e) => {
              setRoomCode(e.target.value);
            }}
          />
        </Grid>
        <Grid item container xs={8} md={6} lg={4} xl={3} alignItems="center">
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="info"
            onClick={() => {
              handleJoinRoom(roomCode);
            }}
          >
            Juntar-se
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
