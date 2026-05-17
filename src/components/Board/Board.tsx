import { Square } from "./Square";
import s from "./Board.module.css";

export function Board() {
  const colLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const rowLabels = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className={s.wrapper}>
      <div className={`${s.labels} ${s.labelsTop}`}>
        {colLabels.map((c) => (
          <div key={c} className={s.labelCell}>
            {c}
          </div>
        ))}
      </div>

      <div className={s.boardRow}>
        <div className={s.rowLabels}>
          {rowLabels.map((r) => (
            <div key={r} className={s.rowLabel}>
              {r}
            </div>
          ))}
        </div>
        <div
          className={s.grid}
          style={{ width: "min(80vw, 480px)", height: "min(80vw, 480px)" }}
        >
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => (
              <Square key={`${row}-${col}`} row={row} col={col} />
            )),
          )}
        </div>
      </div>

      <div className={`${s.labels} ${s.labelsBottom}`}>
        {colLabels.map((c) => (
          <div key={c} className={s.labelCell}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
