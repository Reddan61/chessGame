import { useEffect, useRef } from "react";
import { ChessBoard as ChessBoardGame } from "@utils/ChessBoard"
import classes from "./index.modules.scss";

export const ChessBoard = () => {
  const boardRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const board = boardRef.current;

    if (board) {
        new ChessBoardGame(board)
    }
  }, []);

  return (
    <>
      <canvas ref={boardRef} className={classes.board} />
    </>
  );
};
