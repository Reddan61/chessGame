import { Figure } from "@utils/ChessBoard/Figures/Figure";

interface ConstructorPayload {
  color: Cell["color"];
  position: Cell["position"];
  size: Cell["size"];
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export class Cell {
  private color: string;
  private position: Position;
  private size: Size;
  private figure: Figure | null = null;

  constructor({ color, position, size }: ConstructorPayload) {
    this.color = color;
    this.position = position;
    this.size = size;
  }

  public getColor() {
    return this.color;
  }

  public getSize() {
    return this.size;
  }

  public getPosition() {
    const { height, width } = this.size;
    const { x, y } = this.position;

    const startY = height * y;
    const endY = startY + height;
    const startX = width * x;
    const endX = startX + width;

    return {
      x,
      y,
      startY,
      startX,
      endY,
      endX,
    };
  }

  public setFigure(figure: Cell["figure"]) {
    this.figure = figure;
  }

  public getFigure() {
    return this.figure;
  }
}
