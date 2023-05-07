import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useWebSocketContext } from "../contexts/useWebSocketContext";
import { useEffect, useState } from "react";

interface player {
  id: string;
  username: string;
  points: number;
}

interface joinedRoomMessage {
  method: string;
  game: {
    clients: player[];
  };
}

export default function RoomPage() {
  const { id } = useParams();
  const { ws } = useWebSocketContext();

  const [players, setPlayers] = useState<player[]>([]);

  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (message) => {
      const response: joinedRoomMessage = JSON.parse(message.data);

      if (response.method === "joinedRoom") {
        const game = response.game;
        console.log(response);

        setPlayers(game.clients);
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title> Sala </title>
      </Helmet>
      roomPage - {id}
      lista de jogadores:
      {players.map((player) => {
        return player.username;
      })}
    </>
  );
}
