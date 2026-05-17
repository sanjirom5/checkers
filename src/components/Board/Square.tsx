import clsx from "clsx";
import { Piece } from "./Piece";
import { useGameStore } from "../../store/gameStore";
import s from "./Square.module.css";

interface SquareProps {
  row: number;
  col: number;
}

export function Square({ row, col }: SquareProps) {
  const {
    board,
    selectedPos,
    validSquares,
    lastMove,
    gameStatus,
    isAnimating,
    animatingPos,
    selectPiece,
    executeMove,
    validMoves,
  } = useGameStore();

  const isLight = (row + col) % 2 === 0;
  const piece = board[row][col];
  const isSelected = selectedPos?.row === row && selectedPos?.col === col;
  const isValidDest =
    !isAnimating && validSquares.some((p) => p.row === row && p.col === col);
  const isLastMove =
    (lastMove?.from.row === row && lastMove?.from.col === col) ||
    (lastMove?.to.row === row && lastMove?.to.col === col);
  const isAnimatingHere =
    animatingPos?.row === row && animatingPos?.col === col;

  function handleClick() {
    if (gameStatus !== "playing" || isAnimating) return;
    if (isValidDest && selectedPos) {
      const move = validMoves.find(
        (m) =>
          m.from.row === selectedPos.row &&
          m.from.col === selectedPos.col &&
          m.to.row === row &&
          m.to.col === col,
      );
      if (move) {
        executeMove(move);
        return;
      }
    }
    selectPiece({ row, col });
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        s.square,
        isLight ? s.light : s.dark,
        isLastMove && s.lastMove,
      )}
    >
      {isAnimatingHere && (
        <div className={s.animatingRingWrapper}>
          <div className={s.animatingRing} />
        </div>
      )}

      {isValidDest && !piece && <div className={s.moveDot} />}
      {isValidDest && piece && <div className={s.captureRing} />}

      {piece && (
        <Piece
          color={piece.color}
          isKing={piece.isKing}
          isSelected={isSelected}
          isAnimating={isAnimatingHere}
        />
      )}
    </div>
  );
}
