import { keyframes } from "@mui/material";

const entraceScaleUp = keyframes`
    0% {
        transform: scale(.1);
    }

    100% {
        transform: scale(1);
    }
`;

const cardMoveRotate = (translate: number, rotateDeg: number) => {
  return keyframes`
  0% {
    -webkit-transform: translate(0) rotate(0deg);
            transform: translate(0) rotate(0deg);
  }
  50% {
    -webkit-transform: translate(-${translate}px, ${translate}px) rotate(-${rotateDeg}deg);
            transform: translate(-${translate}px, ${translate}px) rotate(-${rotateDeg}deg);
  }
  100% {
    -webkit-transform: translate(0) rotate(0deg);
            transform: translate(0) rotate(0deg);
  }    
`;
};

const animations = {
  entraceScaleUp,
  cardMoveRotate,
};

export default animations;
