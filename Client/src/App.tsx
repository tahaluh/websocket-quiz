import React from "react";
import Router from "./routes";
import { BrowserRouter } from "react-router-dom";
import UserProvider from "./contexts/userContext";
import WebSocketProvider from "./contexts/webSocketContext";
import { HelmetProvider } from "react-helmet-async";
import { SnackbarProvider } from "notistack";
import GameProvider from "./contexts/GameContext";

function App() {
  return (
    <HelmetProvider>
      <WebSocketProvider>
        <UserProvider>
          <GameProvider>
            <BrowserRouter>
              <SnackbarProvider>
                <Router />
              </SnackbarProvider>
            </BrowserRouter>
          </GameProvider>
        </UserProvider>
      </WebSocketProvider>
    </HelmetProvider>
  );
}

export default App;
