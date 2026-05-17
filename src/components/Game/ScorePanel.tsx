import { useGameStore } from "../../store/gameStore";
import s from "./ScorePanel.module.css";

export function ScorePanel() {
  const { capturedByRed, capturedByWhite, board } = useGameStore();

  let redCount = 0,
    whiteCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.color === "red") redCount++;
      else if (cell?.color === "white") whiteCount++;
    }
  }

  return (
    <div className={s.row}>
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={`${s.dot} ${s.dotRed}`} />
          <span className={s.cardLabel}>Red</span>
        </div>
        <div className={s.count}>{redCount}</div>
        <div className={s.captured}>captured: {capturedByRed}</div>
      </div>
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={`${s.dot} ${s.dotWhite}`} />
          <span className={s.cardLabel}>White</span>
        </div>
        <div className={s.count}>{whiteCount}</div>
        <div className={s.captured}>captured: {capturedByWhite}</div>
      </div>
    </div>
  );
}
