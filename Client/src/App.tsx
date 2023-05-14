import React from "react";
import Router from "./routes";
import { BrowserRouter } from "react-router-dom";
import UserProvider from "./contexts/userContext";
import WebSocketProvider from "./contexts/webSocketContext";
import { HelmetProvider } from "react-helmet-async";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <HelmetProvider>
      <WebSocketProvider>
        <UserProvider>
          <BrowserRouter>
            <SnackbarProvider>
              <Router />
            </SnackbarProvider>
          </BrowserRouter>
        </UserProvider>
      </WebSocketProvider>
    </HelmetProvider>
  );
}

export default App;
