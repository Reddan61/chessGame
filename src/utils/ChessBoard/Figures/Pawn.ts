import { ChessBoard } from "@utils/ChessBoard";
import PawnBlackSVG from "@svg/PawnBlack.svg";
import PawnWhiteSVG from "@svg/PawnWhite.svg";
import { Cell } from "@utils/ChessBoard/Cell";
import { Figure, SIDES } from "./Figure";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;
export class Pawn extends Figure {
  constructor({ side }: Payload) {
    const pawn = side === SIDES.WHITE ? PawnWhiteSVG : PawnBlackSVG;

    super({
      image: pawn,
      side,
    });
  }

  public getAvailableCells(
    myCell: Cell,
    cells: ChessBoard["cells"]
  ): ReturnType<Figure["getAvailableCells"]> {
    const isWhite = this.isWhite();
    const { x: cellX, y: cellY } = myCell.getPosition();

    const directionY = isWhite ? 1 : -1;
    const availableCells: ReturnType<Figure["getAvailableCells"]> = {
      beat: [],
      move: [],
      kingCell: null,
      cellsToKing: []
    };

    const directionsDiagonal = [
      [1, directionY],
      [-1, directionY],
    ];

    const singleInFrontCell = cells[cellY + directionY]?.[cellX];
    const doubleInFrontCell = cells[cellY + directionY * 2]?.[cellX];
    const canGoFrontSingle = singleInFrontCell && !singleInFrontCell?.getFigure();
    const canGoFrontDouble =
      canGoFrontSingle && !doubleInFrontCell?.getFigure() && !this.isMoved;


    if (canGoFrontSingle) {
      const { x, y } = singleInFrontCell.getPosition();
      availableCells.move.push([x, y]);
    }
    if (canGoFrontDouble) {
      const { x, y } = doubleInFrontCell.getPosition();

      availableCells.move.push([x, y]);
    }

    directionsDiagonal.forEach(([directionX, directionY]) => {
      const cell = cells[cellY + directionY]?.[cellX + directionX];

      if (!cell) return;

      const figure = cell.getFigure();

      if (!figure) return;

      const { x, y } = cell.getPosition();
      const sameSide = figure.sameSide(this.side);
      const isKing = !figure.canBeat();

      if (!sameSide) {
        if (isKing) {
          availableCells.kingCell = [x, y];
        } else {
          availableCells.beat.push([x, y]);
        }
      }
    });

    return availableCells;
  }
}
