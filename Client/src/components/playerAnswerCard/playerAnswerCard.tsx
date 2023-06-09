import { Box, ButtonBase, Fade, Grid, Typography } from "@mui/material";
import { answerCard } from "../../@types/localEntity";
import animations from "../../animations/animations";
import Iconify from "../iconify";
import { memo } from "react";
import { useWebSocketContext } from "../../contexts/useWebSocketContext";
import { useAuthContext } from "../../contexts/useUserContext";
import { useGameContext } from "../../contexts/useGameContext";
import universalTransition from "../../animations/transition";

interface propsInterface {
  answerCard: answerCard;
}

const PlayerAnswerCard = ({ answerCard }: propsInterface) => {
  const { ws } = useWebSocketContext();
  const { user } = useAuthContext();
  const { game } = useGameContext();

  const handleRevealAnswer = () => {
    if (!ws) return;

    console.log(game.clients[answerCard.clientIndex]);

    if (user && game.hostId === user.id.slice(0, 4)) {
      const payLoad = {
        method: "revealAnswer",
        clientId: user.id,
        gameId: game.id,
        asnwererId: game.clients[answerCard.clientIndex].id,
      };

      ws.send(JSON.stringify(payLoad));
    }
  };

  const handleQuizGameFeedback = (feedback: boolean) => {
    if (!ws) return;

    if (user && game.hostId === user.id.slice(0, 4)) {
      const payLoad = {
        method: "quizGameFeedback",
        clientId: user.id,
        gameId: game.id,
        feedback: feedback,
        answererId: game.clients[answerCard.clientIndex].id,
      };

      ws.send(JSON.stringify(payLoad));
    }
  };

  const revealed =
    !!game.clients[answerCard.clientIndex].answers[game.round - 1];

  const roundPoints =
    game.clients[answerCard.clientIndex].points[game.round - 1];

  return (
    <Box
      {...(!revealed
        ? {
            onClick: () => {
              handleRevealAnswer();
            },
          }
        : {})}
      key={game.clients[answerCard.clientIndex].id}
      sx={{
        "&:hover": {
          cursor: "normal",
        },
      }}
    >
      <Grid
        justifyContent="center"
        alignItems="center"
        flexDirection="row"
        position="relative"
        sx={{
          transition: universalTransition,
          backgroundColor: "rgba(256,256,256,0.95)",
          ...(!revealed
            ? {
                top: answerCard.height,
                left: answerCard.width,
                rotate: answerCard.rotation,
                animation: `${animations.cardMoveRotate(
                  Math.floor(Math.random() * 25) + 10,
                  Math.floor(Math.random() * 5) + 10
                )} ${
                  Math.floor(Math.random() * 5) + 10
                }s infinite ease-in-out;`,
              }
            : { top: 0, left: 0 }),
          "&:hover": {
            animationPlayState: "paused",
          },
        }}
      >
        <Box
          border={2}
          display={"flex"}
          {...(!revealed
            ? {
                minWidth: "20vw",
                minHeight: "10vh",
              }
            : { minWidth: "40vw", minHeight: "10vh" })}
          sx={{
            animation: `${animations.entraceScaleUp} .2s 1 ease-in-out;`,
            ...(!revealed
              ? {
                  zIndex: "998",
                  "&:hover": {
                    transform: "scale(1.1)",
                    animationPlayState: "paused",
                    cursor: "pointer",
                    zIndex: "999",
                  },
                }
              : {}),
          }}
        >
          {revealed && (
            <>
              <Grid
                item
                xs={1.5}
                border={2}
                borderTop={0}
                borderLeft={0}
                height={30}
                position="static"
                sx={{
                  textAlign: "center",
                }}
              >
                <Iconify
                  width="24px"
                  {...(roundPoints > 0
                    ? {
                        icon: "material-symbols:check",
                        color: "green",
                      }
                    : roundPoints < 0
                    ? { icon: "heroicons-solid:x", color: "red" }
                    : { icon: "" })}
                />
              </Grid>
              {/* <Grid
                item
                margin={"auto"}
                xs={6}
                border={2}
                borderTop={0}
                height={30}
                position="static"
                sx={{
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="overline"
                  display="inline"
                  width="100%"
                  fontSize={10}
                >
                  {game.clients[answerCard.clientIndex].username}
                </Typography>
              </Grid> */}
            </>
          )}
          <Grid
            item
            position="relative"
            top={7.5}
            xs={12}
            sx={{
              textAlign: "center",
            }}
          >
            <Typography
              variant="overline"
              display="inline"
              width="100%"
              fontSize={20}
            >
              {game.clients[answerCard.clientIndex].answers[game.round - 1] ||
                game.clients[answerCard.clientIndex].username}
            </Typography>
          </Grid>
          <Grid
            minHeight="100%"
            container
            item
            xs={2}
            padding={1}
            justifyContent="space-between"
            alignItems="flex-end"
            flexDirection={"column"}
            {...(!revealed
              ? {
                  position: "absolute",
                  right: 1,
                  top: 1,
                }
              : {})}
          >
            <Iconify
              {...(revealed
                ? {
                    onClick: () => {
                      handleQuizGameFeedback(true);
                    },
                  }
                : {})}
              icon="fluent-mdl2:like-solid"
              width="24px"
              color="green"
              {...(!revealed
                ? {
                    position: "fixed",
                    right: 7,
                    top: 7,
                  }
                : {})}
              sx={{
                ...(!revealed
                  ? {}
                  : {
                      "&:hover": {
                        transform: "scale(1.2)",
                        cursor: "pointer",
                      },
                    }),
              }}
            />
            <Iconify
              {...(revealed
                ? {
                    onClick: () => {
                      handleQuizGameFeedback(false);
                    },
                  }
                : {})}
              icon="fluent-mdl2:dislike-solid"
              width="24px"
              color="red"
              {...(!revealed
                ? {
                    position: "fixed",
                    right: 7,
                    bottom: 7,
                  }
                : {})}
              sx={{
                ...(!revealed
                  ? {}
                  : {
                      "&:hover": {
                        transform: "scale(1.2)",
                        cursor: "pointer",
                      },
                    }),
              }}
            />
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
};

export default memo(PlayerAnswerCard);
