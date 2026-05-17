import { useEffect } from "react";
import clsx from "clsx";
import { useGameStore } from "../../store/gameStore";
import s from "./Timer.module.css";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function Timer() {
  const { redTime, whiteTime, currentTurn, gameStatus, tickTimer } =
    useGameStore();

  useEffect(() => {
    if (gameStatus !== "playing") return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [gameStatus, tickTimer]);

  const redActive = currentTurn === "red" && gameStatus === "playing";
  const whiteActive = currentTurn === "white" && gameStatus === "playing";

  return (
    <div className={s.row}>
      <div className={clsx(s.timer, redActive && s.timerActiveRed)}>
        <div className={s.label}>Red</div>
        <div className={s.time}>{formatTime(redTime)}</div>
      </div>
      <div className={clsx(s.timer, whiteActive && s.timerActiveWhite)}>
        <div className={s.label}>White</div>
        <div className={s.time}>{formatTime(whiteTime)}</div>
      </div>
    </div>
  );
}
