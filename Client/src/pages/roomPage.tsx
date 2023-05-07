import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function RoomPage() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title> Sala </title>
      </Helmet>

      roomPage - {id}
    </>
  );
}
