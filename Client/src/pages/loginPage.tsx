import { Button, TextField } from "@mui/material";

export default function LoginPage() {
  return (
    <>
      <TextField placeholder="Insira seu nickname..." variant="filled" />

      <Button variant="contained">Iniciar</Button>
    </>
  );
}
