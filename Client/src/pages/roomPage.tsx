import { useParams } from "react-router-dom";

export default function RoomPage() {
  const { id } = useParams();

  return <>roomPage - {id}</>;
}
