import { ChessBoard } from "@utils/ChessBoard";
import { Cell } from "@utils/ChessBoard/Cell";

interface FigurePayload {
  image: string;
  side: SIDES;
}

type getAvailableCells = {
  move: [x: number, y: number][];
  beat: [x: number, y: number][];
  kingCell: [x: number, y: number] | null;
  cellsToKing: [x: number, y: number][];
};

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
  ): {
    move: [x: number, y: number][];
    beat: [x: number, y: number][];
    kingCell: [x: number, y: number] | null;
  } {
    if (!cell)
      return {
        beat: [],
        move: [],
        kingCell: null,
      };

    const { x, y } = cell.getPosition();
    const figure = cell.getFigure();

    if (!figure) {
      const newX = x + direction[0];
      const newY = y + direction[1];

      const result = this.getCellsByDirection(
        direction,
        cells[newY]?.[newX] ?? null,
        cells
      );

      return {
        beat: [...result.beat],
        move: [[x, y], ...result.move],
        kingCell: result.kingCell,
      };
    }

    const isSameSide = figure.sameSide(this.side);

    if (isSameSide) {
      return {
        beat: [],
        move: [],
        kingCell: null,
      };
    }

    const isKing = !figure.canBeat();

    if (isKing) {
      return {
        beat: [],
        move: [],
        kingCell: [x, y],
      };
    }

    return {
      beat: [[x, y]],
      move: [],
      kingCell: null,
    };
  }

  // получение координат доступных клеток для хода
  public getAvailableCells(
    myCell: Cell,
    cells: ChessBoard["cells"]
  ): getAvailableCells {
    return {
      beat: [],
      move: [],
      kingCell: null,
      cellsToKing: []
    };
  }

  protected isWhite() {
    return this.side === SIDES.WHITE;
  }

  public setMoved() {
    this.isMoved = true;
  }

  public canBeat() {
    return true;
  }

  public sameSide(side: Figure["side"]) {
    return side === this.side;
  }
}
