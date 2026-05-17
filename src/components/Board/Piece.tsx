import clsx from "clsx";
import type { Color } from "../../utils/checkers";
import s from "./Piece.module.css";

interface PieceProps {
  color: Color;
  isKing: boolean;
  isSelected: boolean;
  isAnimating?: boolean;
}

export function Piece({ color, isKing, isSelected, isAnimating }: PieceProps) {
  const isRed = color === "red";

  return (
    <div
      className={clsx(
        s.piece,
        isRed ? s.red : s.white,
        isAnimating ? s.animating : isSelected && s.selected,
      )}
    >
      {isKing ? (
        <span className={clsx(s.kingSymbol, isRed ? s.redKing : s.whiteKing)}>
          ♛
        </span>
      ) : (
        <div
          className={clsx(s.innerCircle, isRed ? s.redInner : s.whiteInner)}
        />
      )}
    </div>
  );
}
