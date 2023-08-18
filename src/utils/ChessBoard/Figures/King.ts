import KingWhiteSVG from "@svg/KingWhite.svg";
import KingBlackSVG from "@svg/KingBlack.svg";
import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@src/utils/ChessBoard/Cell";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;

export class King extends Figure {
  constructor({ side }: Payload) {
    const king = side === SIDES.WHITE ? KingWhiteSVG : KingBlackSVG;

    super({
      image: king,
      side,
    });
  }

  public canBeat(): ReturnType<Figure["canBeat"]> {
    return false;
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
    };

    const { x, y } = myCell.getPosition();

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const dirX = x + direction[0];
      const dirY = y + direction[1];
      const cell = cells[dirY]?.[dirX] ?? null;

      if (!cell) continue;

      availableCells.move.push([[dirX, dirY]]);
      availableCells.beat.push([[dirX, dirY]]);
    }

    return availableCells;
  }
}
