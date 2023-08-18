import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@utils/ChessBoard/Cell";
import HorseWhiteSVG from "@svg/HorseWhite.svg";
import HorseBlackSVG from "@svg/HorseBlack.svg";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;

export class Horse extends Figure {
  constructor({ side }: Payload) {
    const pawn = side === SIDES.WHITE ? HorseWhiteSVG : HorseBlackSVG;

    super({
      image: pawn,
      side,
    });
  }

  public getAvailableCells(
    myCell: Cell,
    cells: Cell[][]
  ): ReturnType<Figure["getAvailableCells"]> {
    const directions = [
      [1, 2],
      [-1, 2],
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, -2],
      [-1, -2],
    ];

    const { x: myCellX, y: myCellY } = myCell.getPosition();
    const availbleCells: ReturnType<Figure["getAvailableCells"]> = {
      beat: [],
      move: []
    };

    directions.forEach(([dirX, dirY]) => {
      const cell = cells[myCellY + dirY]?.[myCellX + dirX];

      if (!cell) return;

      const { x, y } = cell.getPosition();

      availbleCells.move.push([[x, y]]);
      availbleCells.beat.push([[x, y]]);
    });

    return availbleCells;
  }
}
