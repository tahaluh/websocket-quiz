import { useAuthContext } from "../contexts/useUserContext";

export default function JoinPage() {
  const { user, signed } = useAuthContext();
  return <>usuario: {user?.name} {`${signed}`} JoinPage</>;
}
