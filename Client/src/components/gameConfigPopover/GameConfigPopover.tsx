import * as React from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Grid, IconButton, Typography } from "@mui/material";
import FormProvider, { RHFSlider, RHFTextField } from "../hook-form";
import Iconify from "../iconify";
import { QuizGameConfig } from "../../@types/localEntity";
import { useWebSocketContext } from "../../contexts/useWebSocketContext";
import { useAuthContext } from "../../contexts/useUserContext";
import { useParams } from "react-router-dom";

type FormValuesProps = {
  rounds: number;
  answerTime: number;
};

interface propsInterface {
  configs: QuizGameConfig;
  host: boolean;
}

export default function GameConfigPopover({ configs, host }: propsInterface) {
  const { id: gameId } = useParams();
  const { ws } = useWebSocketContext();
  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    reset(defaultValues);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Create convenio

  const defaultValues = {
    rounds: configs?.rounds ? configs.rounds : 3,
    answerTime: configs?.answerTime ? configs?.answerTime : 5,
  };

  const methods = useForm<FormValuesProps>({
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (submitData: FormValuesProps) => {
    if (!ws) return;

    const payLoad = {
      method: "changeConfig",
      clientId: user ? user.id : "",
      gameId: gameId,
      configs: submitData,
    };

    ws.send(JSON.stringify(payLoad));
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Iconify icon="ph:gear" width="30px" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            padding={4}
            width="40vw"
          >
            <Grid item xs={10}>
              <Typography variant="overline">Regras do jogo</Typography>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={handleClose}>
                <Iconify icon="material-symbols:close" width="30px" />
              </IconButton>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                fullWidth
                name="rounds"
                type="number"
                label="Rounds"
                placeholder="insira a quantidade de rounds"
                InputProps={{
                  inputProps: { min: 1 },
                }}
                {...(!host ? { value: configs.rounds, disabled: true } : {})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSlider
                name="rounds"
                min={1}
                max={20}
                {...(!host ? { value: configs.rounds, disabled: true } : {})}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                fullWidth
                name="answerTime"
                type="number"
                label="Tempo para responder"
                placeholder="insira o tempo para responder..."
                InputProps={{
                  inputProps: { min: 3 },
                }}
                {...(!host
                  ? { value: configs.answerTime, disabled: true }
                  : {})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSlider
                name="answerTime"
                min={3}
                max={60}
                {...(!host
                  ? { value: configs.answerTime, disabled: true }
                  : {})}
              />
            </Grid>

            {host && (
              <Grid item xs={12} md={12}>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  color="success"
                  aria-describedby={id}
                  type="submit"
                >
                  Salvar
                </Button>
              </Grid>
            )}
          </Grid>
        </FormProvider>
      </Popover>
    </>
  );
}
