import { useEffect, useState } from "react";

export default function RoundTimer() {
  const [loadingPercent, setloadingPercent] = useState(0);
  const [dot, setDot] = useState(0);
  const [text, setText] = useState("00");
  const [counter, setCounter] = useState(60);

  useEffect(() => {
    if (counter >= 0) {
      const currentLoadingPercent = -(440 - 440 * (counter / 60));
      setloadingPercent(currentLoadingPercent);

      const currentDot = -360 * (counter / 60);
      setDot(currentDot);

      setText(counter >= 10 ? `${counter}` : `0${counter}`);
      setTimeout(() => setCounter((prev) => prev - 1), 1000);
    }
  }, [counter]);
  return (
    <div className="container">
      <div className="text">{text}</div>
      <div style={{ transform: `rotate(${dot}deg)` }} className="dot"></div>
      <svg>
        <circle cx="70" cy="70" r="70" />
        <circle
          strokeDashoffset={loadingPercent + 440}
          cx="70"
          cy="70"
          r="70"
        />
      </svg>
    </div>
  );
}
