export interface Player {
  username: string;
  host: boolean;
  points: number[];
}

export interface JoinedRoomMessage {
  method: "joinedRoom";
  clients: Player[];
}

export interface DelayJoinRoomMessage {
  method: "delayJoinRoom";
  game: Game;
}

export interface Game {
  id?: string;
  hostId: string;
  clients: Player[];
  state: "onLobby" | "onGame" | "empty";
  round: number;
}
