import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { PATH_AFTER_LOGIN } from "../config-global";
import { GamePage, JoinPage, LoginPage, RoomPage } from "./elements";
import UserGuard from "../auth/UserGuard";

export default function Router() {
  return useRoutes([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: <UserGuard />,
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        {
          path: "join",
          element: <JoinPage />,
        },
        {
          path: "room/:id",
          element: <RoomPage />,
        },
        {
          path: "game/:id",
          element: <GamePage />,
        },
      ],
    },
  ]);
}
