import React from "react";
import Router from "./routes";
import { BrowserRouter } from "react-router-dom";
import UserProvider from "./contexts/userContext";
import WebSocketProvider from "./contexts/webSocketContext";

function App() {
  return (
    <WebSocketProvider>
      <UserProvider>
        <BrowserRouter>
          <Router></Router>
        </BrowserRouter>
      </UserProvider>
    </WebSocketProvider>
  );
}

export default App;
