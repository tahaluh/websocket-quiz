import { ReactNode, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
// components
//import LoadingScreen from '../components/loading-screen';
import { useAuthContext } from "../contexts/useUserContext";
import { PATH_AUTH } from "../routes/paths";

// ----------------------------------------------------------------------

type UserGuardProps = {
  children?: ReactNode;
};

export default function UserGuard({ children }: UserGuardProps) {
  const { signed } = useAuthContext();

  console.log(signed);
  if (!signed) {
    return <Navigate to={PATH_AUTH.login} />;
  }

  return (
    <>
      {" "}
      {children}
      <Outlet></Outlet>
    </>
  );
}
