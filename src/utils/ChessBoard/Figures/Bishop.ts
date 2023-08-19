import BishopWhiteSVG from "@svg/BishopWhite.svg";
import BishopBlackSVG from "@svg/BishopBlack.svg";
import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@src/utils/ChessBoard/Cell";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;

export class Bishop extends Figure {
  constructor({ side }: Payload) {
    const bishop = side === SIDES.WHITE ? BishopWhiteSVG : BishopBlackSVG;

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
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];

    const availableCells: ReturnType<Figure["getAvailableCells"]> = {
      beat: [],
      move: [],
      castling: []
    };

    const { x, y } = myCell.getPosition();

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const dirX = x + direction[0];
      const dirY = y + direction[1];
      const cell = cells[dirY]?.[dirX] ?? null;

      const result = this.getCellsByDirection(direction, cell, cells);

      availableCells.move.push([...result]);
      availableCells.beat.push([...result]);
    }

    return availableCells;
  }
}

export const IsBishop = (figure: Figure) => {
  return figure instanceof Bishop;
};
