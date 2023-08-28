import { ChessBoard } from "@utils/ChessBoard";
import { Cell } from "@utils/ChessBoard/Cell";
import { Figure, SIDES } from "./Figure";
import { FiguresImages } from "@utils/ChessBoard/Figures/Images";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;
export class Pawn extends Figure {
  constructor({ side }: Payload) {
    const pawn =
      side === SIDES.WHITE
        ? FiguresImages["WhitePawn"]
        : FiguresImages["BlackPawn"];

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
      castling: [],
    };

    const directionsDiagonal = [
      [1, directionY],
      [-1, directionY],
    ];

    const singleInFrontCell = cells[cellY + directionY]?.[cellX];
    const doubleInFrontCell = cells[cellY + directionY * 2]?.[cellX];
    const canGoFrontSingle =
      singleInFrontCell && !singleInFrontCell?.getFigure();
    const canGoFrontDouble =
      canGoFrontSingle && !doubleInFrontCell?.getFigure() && !this.isMoved;

    const frontMove: [x: number, y: number][] = [];

    if (canGoFrontSingle) {
      const { x, y } = singleInFrontCell.getPosition();
      frontMove.push([x, y]);
    }
    if (canGoFrontDouble) {
      const { x, y } = doubleInFrontCell.getPosition();

      frontMove.push([x, y]);
    }

    directionsDiagonal.forEach(([directionX, directionY]) => {
      const cell = cells[cellY + directionY]?.[cellX + directionX];

      if (!cell) return;

      const { x, y } = cell.getPosition();
      availableCells.beat.push([[x, y]]);
    });

    availableCells.move.push(frontMove);

    return availableCells;
  }
}

export const IsPawn = (figure: Figure) => figure instanceof Pawn;
