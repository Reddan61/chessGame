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
    const availableCells: ReturnType<Figure["getAvailableCells"]> = [];

    const singleInFrontCell = cells[cellY + directionY]?.[cellX];
    const doubleInFrontCell = cells[cellY + directionY * 2]?.[cellX];
    const diagonalRightCell = cells[cellY + directionY]?.[cellX + 1];
    const diagonalLeftCell = cells[cellY + directionY]?.[cellX - 1];
    const canGoFrontSingle = !singleInFrontCell?.getFigure();
    const canGoFrontDouble =
      canGoFrontSingle && !doubleInFrontCell?.getFigure() && !this.isMoved;
    const canGoDiagonalRight =
      !!diagonalRightCell?.getFigure() &&
      !diagonalRightCell?.getFigure()?.sameSide(this.side);
    const canGoDiagonalLeft =
      !!diagonalLeftCell?.getFigure() &&
      !diagonalLeftCell?.getFigure()?.sameSide(this.side);

    if (canGoFrontSingle) {
      const { x, y } = singleInFrontCell.getPosition();
      availableCells.push([x, y]);
    }
    if (canGoFrontDouble) {
      const { x, y } = doubleInFrontCell.getPosition();

      availableCells.push([x, y]);
    }
    if (canGoDiagonalRight) {
      const { x, y } = diagonalRightCell.getPosition();

      availableCells.push([x, y]);
    }
    if (canGoDiagonalLeft) {
      const { x, y } = diagonalLeftCell.getPosition();

      availableCells.push([x, y]);
    }

    return availableCells;
  }
}
