import { ChessBoard } from "@utils/ChessBoard";
import { Cell } from "@utils/ChessBoard/Cell";

interface FigurePayload {
  image: string;
  side: SIDES;
}

type Directions = [x: number, y: number][];

export enum SIDES {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export class Figure {
  protected side: SIDES;
  protected isMoved = false;
  private image: HTMLImageElement;

  constructor({ image, side }: FigurePayload) {
    const img = new Image();
    img.src = image;

    this.image = img;
    this.side = side;
  }

  public getImage() {
    return this.image;
  }

  // Получение ВСЕХ доступных клеток по НАПРАВЛЕНИЮ
  protected getCellsByDirection(
    direction: [x: number, y: number],
    cell: Cell | null,
    cells: ChessBoard["cells"]
  ): ReturnType<Figure["getAvailableCells"]> {
    if (!cell) return [];

    const { x, y } = cell.getPosition();
    const figure = cell.getFigure();

    if (!figure) {
      const newX = x + direction[0];
      const newY = y + direction[1];

      return [
        [x, y],
        ...this.getCellsByDirection(
          direction,
          cells[newY]?.[newX] ?? null,
          cells
        ),
      ];
    }

    const isSameSide = figure.sameSide(this.side);

    if (isSameSide) {
      return [];
    }

    return [[x, y]];
  }

  // получение координат доступных клеток для хода
  public getAvailableCells(
    myCell: Cell,
    cells: ChessBoard["cells"]
  ): Directions {
    return [];
  }

  protected isWhite() {
    return this.side === SIDES.WHITE;
  }

  public setMoved() {
    this.isMoved = true;
  }

  public sameSide(side: Figure["side"]) {
    return side === this.side;
  }
}
