import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@utils/ChessBoard/Cell";
import { FiguresImages } from "@utils/ChessBoard/Figures/Images";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;

export class Queen extends Figure {
  constructor({ side }: Payload) {
    const bishop =
      side === SIDES.WHITE
        ? FiguresImages["WhiteQueen"]
        : FiguresImages["BlackQueen"];

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
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ];

    const availableCells: ReturnType<Figure["getAvailableCells"]> = {
      beat: [],
      move: [],
      castling: [],
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

export const IsQueen = (figure: Figure) => {
  return figure instanceof Queen;
};
