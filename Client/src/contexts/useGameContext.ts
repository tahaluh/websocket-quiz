import { useContext } from "react";
import { GameContext } from "./GameContext";
//

// ----------------------------------------------------------------------

export const useGameContext = () => {
  const context = useContext(GameContext);

  if (!context)
    throw new Error("useGameContext context must be use inside AuthProvider");

  return context;
};
