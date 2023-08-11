import { Cell } from "@utils/ChessBoard/Cell";
import { Pawn } from "@utils/ChessBoard/Figures/Pawn";

interface Size {
  width: number;
  height: number;
}

export class ChessBoard {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private size: Size;

  private cellColor = {
    primary: "#769656",
    secondary: "#eeeed2",
  };

  private cellCount = {
    x: 8,
    y: 8,
  };

  private cells: Cell[][];

  constructor(canvas: ChessBoard["canvas"]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.init();
  }

  private initCells() {
    const { x, y } = this.cellCount;
    const { primary, secondary } = this.cellColor;
    const { height, width } = this.size;

    const newCells: ChessBoard["cells"] = [];

    const widthCell = width / x;
    const heightCell = height / y;

    for (let i = 0; i < y; i++) {
      newCells.push([]);

      for (let j = 0; j < x; j++) {
        const isEven = (i + (j % x)) % 2 === 0;
        const color: Cell["color"] = isEven ? secondary : primary;
        const position: Cell["position"] = {
          x: j,
          y: i,
        };
        const size: Cell["size"] = {
          width: widthCell,
          height: heightCell,
        };

        const cell = new Cell({
          color,
          position,
          size,
        });

        newCells[i].push(cell);
      }
    }

    this.cells = newCells;
  }

  private initFigures() {
    const cell = this.cells[0][0];

    cell.setFigure(
      new Pawn({
        x: 1,
        y: 1,
      })
    );
  }

  private init() {
    this.normalizeSize();
    this.initCells();
    this.initFigures();
    this.update();
  }

  private drawFigures() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        const figure = cell.getFigure();

        if (!figure) continue;

        const {startX, startY, endX, endY } = cell.getPosition();
        const imageSRC = figure.getImageSrc();

        const img = new Image();

        img.onload = () => {
          this.ctx.drawImage(img, startX, startY, endX, endY);
        };

        img.src = imageSRC;
      }
    }
  }

  private normalizeSize() {
    const { offsetHeight, offsetWidth } = this.canvas;

    this.canvas.width = offsetWidth;
    this.canvas.height = offsetHeight;

    this.size = {
      width: offsetWidth,
      height: offsetHeight,
    };
  }

  private update() {
    this.drawBackGround();
    this.drawFigures();
    console.log(this);
  }
  // TODO: Возможно обьединить drawBackGround и drawFigures
  private drawBackGround() {
    const { x, y } = this.cellCount;

    for (let i = 0; i < y; i++) {
      const yCurrent = this.cells[i];

      for (let j = 0; j < x; j++) {
        const cell = yCurrent[j];

        const color = cell.getColor();
        const { endX, endY, startX, startY } = cell.getPosition();

        this.ctx.fillStyle = color;
        this.ctx.fillRect(startX, startY, endX, endY);
      }
    }
  }
}
