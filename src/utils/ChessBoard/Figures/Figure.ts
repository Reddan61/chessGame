import { ChessBoard } from "@utils/ChessBoard";
import { Cell } from "@utils/ChessBoard/Cell";

interface FigurePayload {
  image: string;
  side: SIDES;
}

type getAvailableCells = {
  move: [x: number, y: number][][];
  beat: [x: number, y: number][][];
  castling: {
    prevRookPosition: { x: number; y: number };
    prevKingPosition: { x: number; y: number };
    nextRookPosition: { x: number; y: number };
    nextKingPosition: { x: number; y: number };
    direction: [x: number, y: number];
  }[];
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
  ): [x: number, y: number][] {
    if (!cell) return [];

    const { x, y } = cell.getPosition();

    const newX = x + direction[0];
    const newY = y + direction[1];

    const result = this.getCellsByDirection(
      direction,
      cells[newY]?.[newX] ?? null,
      cells
    );

    return [[x, y], ...result];
  }

  public getMoved() {
    return this.isMoved;
  }

  // получение координат доступных клеток для хода
  public getAvailableCells(
    myCell: Cell,
    cells: ChessBoard["cells"]
  ): getAvailableCells {
    return {
      beat: [],
      move: [],
      castling: [],
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

  public getSide() {
    return this.side;
  }
}
