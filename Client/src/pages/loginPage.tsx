import { Button, Grid, TextField } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useWebSocketContext } from "../contexts/useWebSocketContext";
import { useAuthContext } from "../contexts/useUserContext";
import { HOST_WS } from "../config-global";
import { useEffect, useState } from "react";
import { PATH_AUTH, PATH_GAME } from "../routes/paths";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { user, setUser, signed } = useAuthContext();
  const { ws, setWs } = useWebSocketContext();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");

  const handleJoin = () => {
    if (ws === undefined) {
      const ws = new WebSocket(HOST_WS);
      setWs(ws);

      ws.onmessage = (message) => {
        const response = JSON.parse(message.data);

        if (response.method === "connect") {
          let responseUser = response.client;
          console.log(responseUser);

          setUser(responseUser);
          const payLoad = {
            method: "selectUsername",
            clientId: responseUser.id,
            username: username || "guest",
          };

          ws.send(JSON.stringify(payLoad));
        }

        if (response.method === "selectUsername") {
          console.log(response);
          let responseUser = response.client;
          setUser(responseUser);
          navigate(PATH_GAME.joinRoom);
        }

        if (response.method === "") {
        }
      };
    }
  };

  return (
    <>
      <Helmet>
        <title> Login </title>
      </Helmet>

      <Grid
        container
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        spacing={6}
      >
        <Grid item container xs={8} md={6} lg={4} xl={3}>
          <TextField
            fullWidth
            placeholder="Insira seu nick..."
            label="Nickname"
            variant="outlined"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </Grid>
        <Grid item container xs={8} md={6} lg={4} xl={3} alignItems="center">
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="success"
            onClick={handleJoin}
          >
            Iniciar
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
