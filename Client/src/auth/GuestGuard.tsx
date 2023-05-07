import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
// components
//import LoadingScreen from '../components/loading-screen';
import { useAuthContext } from '../contexts/useUserContext';


// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { signed } = useAuthContext();

  if (signed) {
    return <Navigate to="/join" />;
  }

  if (!signed) {
    //return <LoadingScreen />;
  }

  return <> {children} </>;
}
