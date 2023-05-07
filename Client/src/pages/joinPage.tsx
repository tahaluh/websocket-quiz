import { Helmet } from "react-helmet-async";
import { useAuthContext } from "../contexts/useUserContext";

export default function JoinPage() {
  const { user, signed } = useAuthContext();
  return (
    <>
      <Helmet>
        <title> Entrar </title>
      </Helmet>
      usuario: {user?.name} {`${signed}`} JoinPage
    </>
  );
}
