import { useEffect, useRef } from "react";
import { useGameStore } from "../../store/gameStore";
import s from "./MoveHistory.module.css";

export function MoveHistory() {
  const { moveHistory } = useGameStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moveHistory]);

  return (
    <div className={s.container}>
      <div className={s.label}>Move History</div>
      <div className={s.scroll}>
        {moveHistory.length === 0 ? (
          <p className={s.empty}>No moves yet</p>
        ) : (
          <div className={s.grid}>
            {moveHistory.map((move, i) => (
              <div key={i} className={i % 2 === 0 ? s.moveRed : s.moveWhite}>
                <span className={s.moveNum}>
                  {Math.floor(i / 2) + 1}
                  {i % 2 === 0 ? "." : ""}
                </span>
                {move}
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
