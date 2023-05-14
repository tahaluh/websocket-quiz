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

export interface ChangeConfigsRoomMessage {
  method: "changeConfig";
  configs: QuizGameConfig;
}

export interface QuizGameConfig {
  gameMode: "quizGame";
  rounds: number;
  answerTime: number;
}
export interface Game {
  id?: string;
  hostId: string;
  clients: Player[];
  state: "onLobby" | "onGame" | "empty";
  configs: QuizGameConfig;
  round: number;
}
