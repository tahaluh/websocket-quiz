export interface Player {
  username: string;
  host: boolean;
  id: string;
  points: number[];
  answers: string[];
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

export interface StartingGameMessage {
  method: "startingGame";
}

export interface StartGameMessage {
  method: "startGame";
}

export interface NextRoundMessage {
  method: "nextRound";
}
export interface AnswerQuizGameMessage {
  method: "answerQuizGame";
  clientIndex: number;
}

export interface FinishRoundMessage {
  method: "finishRound";
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
  state:
    | "onLobby"
    | "onRound"
    | "onRoundFeedback"
    | "onInterval"
    | "starting"
    | "empty";
  configs: QuizGameConfig;
  round: number;
}
