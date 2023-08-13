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

  public getDirections(myCell: Cell, cells: ChessBoard["cells"]): Directions {
    return [];
  }

  protected isWhite() {
    return this.side === SIDES.WHITE;
  }

  public setMoved() {
    this.isMoved = true;
  }

  public sameSide(side: Figure['side']) {
    return side === this.side
  }
}
