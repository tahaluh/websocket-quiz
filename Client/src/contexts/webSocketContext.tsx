import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
  useEffect,
} from "react";
import { HOST_WS } from "../config-global";

export interface WebSocketContextInterface {
  ws: WebSocket | undefined;
  setWs: Dispatch<SetStateAction<WebSocket | undefined>>;
}

const defaultState = {
  ws: undefined,
  setWs: (ws: WebSocket) => {},
} as WebSocketContextInterface;

export const WebSocketContext = createContext(defaultState);

type WebSocketProviderProps = {
  children: ReactNode;
};

export default function WebSocketProvider({
  children,
}: WebSocketProviderProps) {
  const [ws, setWs] = useState<WebSocket>();

  return (
    <WebSocketContext.Provider value={{ ws, setWs }}>
      {children}
    </WebSocketContext.Provider>
  );
}
