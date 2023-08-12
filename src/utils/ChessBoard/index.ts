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

  private canMoveOptions = {
    color: "#646f41",
    radius: 15,
    startAngle: 0,
    endAngle: 2 * Math.PI,
  };

  // cell[y][x]
  private cells: Cell[][] = [];
  private selectedCell: Cell | null = null;
  private canMoveCells: [x: number, y: number][] = [];

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
    // начальное расстановка фигур и подгрузка их картинок
    return new Promise((res) => {
      const cell = this.cells[6][1];
      const pawn = new Pawn();

      const img = pawn.getImage();
      img.onload = () => {
        cell.setFigure(pawn);
        res(true);
      };
    });
  }

  private async init() {
    this.normalizeSize();
    this.initCells();
    await this.initFigures();
    this.initHandlers();
    this.update();
  }

  private clickHandler(e: MouseEvent) {
    const { left, top } = this.canvas.getBoundingClientRect();
    const { clientX, clientY } = e;

    const mouseX = clientX - left;
    const mouseY = clientY - top;

    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];

        const { startX, startY, endX, endY, x, y } = cell.getPosition();

        if (mouseX >= startX && mouseX <= endX) {
          if (mouseY >= startY && mouseY <= endY) {
            if (this.selectedCell) {
              const cellFigure = cell.getFigure();
              const canIMove = !!this.canMoveCells.filter(([moveX, moveY]) => {
                // TODO: убрать проверку !cellFigure (добавить возможность бить вражеские фигуры)
                return moveX === x && moveY === y && !cellFigure;
              }).length;

              if (canIMove) {
                const selectedFigure = this.selectedCell.getFigure();

                cell.setFigure(selectedFigure);
                this.selectedCell.setFigure(null);
                this.selectedCell = null;
              } else {
                this.selectedCell = cell;
              }
            } else {
              this.selectedCell = cell;
            }

            break;
          }
        }
      }
    }

    this.update();
  }

  private initHandlers() {
    this.canvas.onclick = this.clickHandler.bind(this);
  }

  private drawFigures() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        const figure = cell.getFigure();

        if (!figure) continue;

        const { startX, startY } = cell.getPosition();
        const { height, width } = cell.getSize();
        const img = figure.getImage();
        // const img = new Image();
        this.ctx.drawImage(img, startX, startY, width, height);
        // img.onload = () => {
        //   console.log('da')
        // };

        // img.src = imageSRC;
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
    this.drawDirections();
    console.log(this);
  }

  private drawDirections() {
    const cell = this.selectedCell;
    const figure = cell?.getFigure();

    if (!figure) {
      this.canMoveCells = [];
      return;
    }

    const { x, y } = cell.getPosition();
    const directions = figure.getDirections();

    const newCanMoveCells: ChessBoard["canMoveCells"] = [];

    for (let i = 0; i < directions.length; i++) {
      const [directionX, directionY] = directions[i];

      const newX = x + directionX;
      const newY = y + directionY;
      const directionCell = this.cells[newY]?.[newX];

      if (!directionCell) continue;

      const {
        startX,
        startY,
        x: directionCellX,
        y: directionCellY,
      } = directionCell.getPosition();
      const { width, height } = directionCell.getSize();

      const arcX = startX + width / 2;
      const arcY = startY + height / 2;

      const { color, radius, endAngle, startAngle } = this.canMoveOptions;

      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.arc(arcX, arcY, radius, startAngle, endAngle);
      this.ctx.fill();
      this.ctx.closePath();

      newCanMoveCells.push([directionCellX, directionCellY]);
    }

    this.canMoveCells = newCanMoveCells;
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
