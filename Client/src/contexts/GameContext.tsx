import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { Game } from "../@types/localEntity";

export interface GameContextInterface {
  game: Game;
  inGame: boolean;
  setGame: Dispatch<SetStateAction<Game>>;
  reset: () => void;
}

const defaultState = {
  game: {
    id: "",
    hostId: "",
    clients: [],
    state: "onLobby",
    configs: {
      gameMode: "quizGame",
      answerTime: 5,
      rounds: 3,
    },
    round: 0,
  },
  inGame: false,
  setGame: (game: Game) => {},
  reset: () => {},
} as GameContextInterface;

export const GameContext = createContext(defaultState);

type GameProviderProps = {
  children: ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const [game, setGame] = useState<Game>(defaultState.game);
  const reset = () => {
    setGame(defaultState.game);
  };

  return (
    <GameContext.Provider value={{ game, setGame, inGame: !!game, reset }}>
      {children}
    </GameContext.Provider>
  );
}
