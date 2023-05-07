import { useParams } from "react-router-dom";

export default function GamePage() {
  const { id } = useParams();

  return <>gamePage - {id}</>;
}
