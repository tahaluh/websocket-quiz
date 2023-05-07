import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function GamePage() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title> Jogo </title>
      </Helmet>

      gamePage - {id}
    </>
  );
}
