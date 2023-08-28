import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@utils/ChessBoard/Cell";
import { IsRook } from "@utils/ChessBoard/Figures/Rook";
import { FiguresImages } from "@utils/ChessBoard/Figures/Images";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], "image">;

export class King extends Figure {
  constructor({ side }: Payload) {
    const king =
      side === SIDES.WHITE
        ? FiguresImages["WhiteKing"]
        : FiguresImages["BlackKing"];

    super({
      image: king,
      side,
    });
  }

  public canBeat(): ReturnType<Figure["canBeat"]> {
    return false;
  }

  private getCastling(
    direction: [x: number, y: number],
    cell: Cell,
    cells: Cell[][]
  ): [x: number, y: number] | null {
    const [directionX, directionY] = direction;

    if (!cell) return null;

    const { x, y } = cell.getPosition();
    const figure = cell.getFigure();

    if (!figure) {
      const nextX = x + directionX;
      const nextY = y + directionY;

      const nextCell = cells[nextY][nextX];

      return this.getCastling(direction, nextCell, cells);
    }

    const isRook = IsRook(figure);

    if (!isRook) return null;

    const moved = figure.getMoved();

    if (moved) return null;

    const sameSide = figure.sameSide(this.side);

    if (!sameSide) return null;

    return [x, y];
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

      if (!cell) continue;

      availableCells.move.push([[dirX, dirY]]);
      availableCells.beat.push([[dirX, dirY]]);
    }

    if (this.isMoved) return availableCells;

    const castling: ReturnType<Figure["getAvailableCells"]>["castling"] = [];

    const castlingDirections: [x: number, y: number][] = [
      [1, 0],
      [-1, 0],
    ];

    castlingDirections.forEach((directionCastling) => {
      const nextX = x + directionCastling[0];
      const nextY = y + directionCastling[1];
      const nextCell = cells[nextY][nextX];
      const result = this.getCastling(directionCastling, nextCell, cells);

      if (!result) return;

      const [rookX, rookY] = result;

      const prevRookPosition = {
        x: rookX,
        y: rookY,
      };
      const prevKingPosition = {
        x,
        y,
      };
      const nextRookPosition = {
        x: x + directionCastling[0],
        y: y + directionCastling[1],
      };
      const nextKingPosition = {
        x: x + directionCastling[0] * 2,
        y: y + directionCastling[1],
      };

      castling.push({
        prevRookPosition,
        prevKingPosition,
        nextRookPosition,
        nextKingPosition,
        direction: directionCastling,
      });
    });

    availableCells.castling = castling;

    return availableCells;
  }
}

export const IsKing = (figure: Figure) => {
  return figure instanceof King;
};
