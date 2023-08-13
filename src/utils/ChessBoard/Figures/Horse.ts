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

  public getDirections(
    myCell: Cell,
    cells: Cell[][]
  ): ReturnType<Figure["getDirections"]> {
    const directions: ReturnType<Figure["getDirections"]> = [
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

    return directions.filter(([dirX, dirY]) => {
      const cell = cells[myCellY + dirY]?.[myCellX + dirX];

      if (!cell) return false;

      const figure = cell.getFigure();

      if (!figure) return true;

      const isSameSide = figure?.sameSide(this.side);

      return !isSameSide;
    });
  }
}
