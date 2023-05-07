import { Navigate, useRoutes } from "react-router-dom";
import LoginPage from "../pages/loginPage";
import JoinPage from "../pages/joinPage";
import RoomPage from "../pages/roomPage";
import GamePage from "../pages/gamePage";
import UserGuard from "../auth/UserGuard";
import { PATH_AFTER_LOGIN } from "../config-global";

export default function Router() {
  return useRoutes([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: <UserGuard/>,
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
