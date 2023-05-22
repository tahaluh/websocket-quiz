import { Box, ButtonBase, Fade, Grid, Typography } from "@mui/material";
import { answerCard } from "../../@types/localEntity";
import animations from "../../animations/animations";
import Iconify from "../iconify";
import { memo } from "react";

interface propsInterface {
  answerCard: answerCard;
}

const PlayerAnswerCard = ({ answerCard }: propsInterface) => {
  return (
    <ButtonBase
      onClick={() => {
        console.log();
      }}
      key={answerCard.height}
    >
      <Grid
        justifyContent="center"
        alignItems="center"
        position="fixed"
        left={answerCard.width}
        top={answerCard.height}
        flexDirection="row"
        sx={{
          backgroundColor: "rgba(256,256,256,0.95)",
          rotate: answerCard.rotation,
          animation: `${animations.cardMoveRotate(
            Math.floor(Math.random() * 25) + 10,
            Math.floor(Math.random() * 5) + 10
          )} ${Math.floor(Math.random() * 5) + 10}s infinite ease-in-out;`,
          "&:hover": {
            transform: "scale(1.2)",
            animationPlayState: "paused",
            cursor: "pointer",
            zIndex: "999",
          },
        }}
      >
        <Box
          minWidth={"20vw"}
          minHeight={"10vh"}
          border={2}
          sx={{
            animation: `${animations.entraceScaleUp} .2s 1 ease-in-out;`,
          }}
        >
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
              {answerCard.username}
            </Typography>
          </Grid>
          <Grid
            position="absolute"
            top={1}
            right={1}
            minHeight="100%"
            item
            xs={1}
            justifyContent="space-between"
          >
            <Iconify
              icon="fluent-mdl2:like-solid"
              width="24px"
              color="green"
              position="fixed"
              top={7}
              right={7}
            />
            <Iconify
              icon="fluent-mdl2:dislike-solid"
              width="24px"
              color="red"
              position="fixed"
              bottom={7}
              right={7}
            />
          </Grid>
        </Box>
      </Grid>
    </ButtonBase>
  );
};

export default memo(PlayerAnswerCard);
