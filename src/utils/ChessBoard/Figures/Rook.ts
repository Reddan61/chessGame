import RookWhiteSVG from "@svg/RookWhite.svg";
import RookBlackSVG from "@svg/RookBlack.svg";
import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@src/utils/ChessBoard/Cell";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;

export class Rook extends Figure {
  constructor({ side }: Payload) {
    const bishop = side === SIDES.WHITE ? RookWhiteSVG : RookBlackSVG;

    super({
      image: bishop,
      side,
    });
  }

  public getAvailableCells(
    myCell: Cell,
    cells: Cell[][]
  ): ReturnType<Figure["getAvailableCells"]> {
    const directions: [x: number, y: number][] = [
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ];

    const availableCells: ReturnType<Figure["getAvailableCells"]> = {
      beat: [],
      move: [],
      kingCell: null,
      cellsToKing: [],
    };

    const { x, y } = myCell.getPosition();

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const dirX = x + direction[0];
      const dirY = y + direction[1];
      const cell = cells[dirY]?.[dirX] ?? null;

      const result = this.getCellsByDirection(direction, cell, cells);
      availableCells.move.push(...result.move);
      availableCells.beat.push(...result.beat);
      if (!availableCells.kingCell) {
        availableCells.kingCell = result.kingCell;
        availableCells.cellsToKing = result.move;
      }
    }

    return availableCells;
  }
}
