import { useGameStore } from "../../store/gameStore";
import { Button } from "../UI/Button";
import s from "./WinScreen.module.css";

interface WinScreenProps {
  onNewGame: () => void;
  isLoggedIn: boolean;
}

export function WinScreen({ onNewGame, isLoggedIn }: WinScreenProps) {
  const {
    winner,
    gameStatus,
    moveHistory,
    redTime,
    whiteTime,
    gameMode,
    difficulty,
    initGame,
  } = useGameStore();
  if (gameStatus !== "won" && gameStatus !== "draw") return null;

  const totalTime = redTime + whiteTime;
  const mins = Math.floor(totalTime / 60);
  const secs = totalTime % 60;

  return (
    <div className={s.overlay}>
      <div className={s.backdrop} />
      <div className={s.panel}>
        <div className={s.trophy}>{gameStatus === "draw" ? "🤝" : "🏆"}</div>
        <h2 className={s.title}>
          {gameStatus === "draw"
            ? "It's a Draw!"
            : `${winner === "red" ? "Red" : "White"} Wins!`}
        </h2>
        <p className={s.subtitle}>
          {moveHistory.length} moves · {mins}m {secs}s
        </p>
        <div className={s.actions}>
          <Button
            onClick={() => initGame(gameMode, difficulty)}
            size="lg"
            style={{ width: "100%" }}
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            onClick={onNewGame}
            style={{ width: "100%" }}
          >
            Change Mode
          </Button>
          {isLoggedIn && (
            <p style={{ fontSize: "0.75rem", color: "#4ade80", margin: 0 }}>
              Game saved to profile
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
