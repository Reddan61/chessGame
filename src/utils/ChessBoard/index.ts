import { SIDES } from "@utils/ChessBoard/Figures/Figure";
import { Cell } from "@utils/ChessBoard/Cell";
import { Pawn } from "@utils/ChessBoard/Figures/Pawn";
import { percentFromNumber } from "@utils/Math";
import { drawTriangle } from "@utils/Canvas";
import { Horse } from "@utils/ChessBoard/Figures/Horse";

interface Size {
  width: number;
  height: number;
}

export class ChessBoard {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private size: Size;

  private cellColor = {
    primary: "#b58863",
    secondary: "#f0d9b5",
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
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error();
    }

    this.canvas = canvas;
    this.ctx = ctx;

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
  // TODO: исправить это безобразие
  private initFigures() {
    // начальное расстановка фигур и подгрузка их картинок
    const promises = [];
    const { x } = this.cellCount;

    // pawns
    for (let i = 0; i < x; i++) {
      const cellWhite = this.cells[1][i];
      const cellBlack = this.cells[6][i];

      const pawnBlack = new Pawn({
        side: SIDES.BLACK,
      });
      const pawnWhite = new Pawn({
        side: SIDES.WHITE,
      });

      promises.push(
        new Promise((res) => {
          pawnWhite.getImage().onload = () => {
            cellWhite.setFigure(pawnWhite);
            res(true);
          };
        })
      );

      promises.push(
        new Promise((res) => {
          pawnBlack.getImage().onload = () => {
            cellBlack.setFigure(pawnBlack);
            res(true);
          };
        })
      );
    }

    // white horses
    const cellWhiteLeftHorse = this.cells[0][1];
    const cellWhiteRightHorse = this.cells[0][6];
    const horseLeftWhite = new Horse({
      side: SIDES.WHITE,
    });
    const horseRightWhite = new Horse({
      side: SIDES.WHITE,
    });

    promises.push(
      new Promise((res) => {
        horseLeftWhite.getImage().onload = () => {
          cellWhiteLeftHorse.setFigure(horseLeftWhite);
          res(true);
        };
      })
    );
    promises.push(
      new Promise((res) => {
        horseRightWhite.getImage().onload = () => {
          cellWhiteRightHorse.setFigure(horseRightWhite);
          res(true);
        };
      })
    );

    // black horses
    const cellBlackLeftHorse = this.cells[7][1];
    const cellBlackRightHorse = this.cells[7][6];
    const horseLeftBlack = new Horse({
      side: SIDES.BLACK,
    });
    const horseRightBlack = new Horse({
      side: SIDES.BLACK,
    });

    promises.push(
      new Promise((res) => {
        horseLeftBlack.getImage().onload = () => {
          cellBlackLeftHorse.setFigure(horseLeftBlack);
          res(true);
        };
      })
    );
    promises.push(
      new Promise((res) => {
        horseRightBlack.getImage().onload = () => {
          cellBlackRightHorse.setFigure(horseRightBlack);
          res(true);
        };
      })
    );

    return Promise.all(promises);
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
              const canIMove = !!this.canMoveCells.filter(([moveX, moveY]) => {
                return moveX === x && moveY === y;
              }).length;

              if (canIMove) {
                const selectedFigure = this.selectedCell.getFigure();

                selectedFigure?.setMoved();
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
        this.ctx.drawImage(img, startX, startY, width, height);
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

    if (!figure || !cell) {
      this.canMoveCells = [];
      return;
    }

    const { x, y } = cell.getPosition();

    const directions = figure.getDirections(cell, this.cells);
    const newCanMoveCells: ChessBoard["canMoveCells"] = [];

    for (let i = 0; i < directions.length; i++) {
      const [directionX, directionY] = directions[i];

      const newX = x + directionX;
      const newY = y + directionY;
      const directionCell = this.cells[newY]?.[newX];

      if (!directionCell) continue;

      const { x: directionCellX, y: directionCellY } =
        directionCell.getPosition();
      const figure = directionCell.getFigure();

      if (figure) {
        this.drawMoveHightLightWithFigure(directionCell);
      } else {
        this.drawMoveHightLight(directionCell);
      }

      newCanMoveCells.push([directionCellX, directionCellY]);
    }

    this.canMoveCells = newCanMoveCells;
  }

  private drawMoveHightLightWithFigure(cell: Cell) {
    const { color } = this.canMoveOptions;
    const { width, height } = cell.getSize();
    const { startX, startY } = cell.getPosition();

    const widthGap = percentFromNumber(width, 20);
    const heightGap = percentFromNumber(height, 20);

    // top - left
    drawTriangle(
      {
        ctx: this.ctx,
        color,
      },
      [startX, startY],
      [startX + widthGap, startY],
      [startX, startY + heightGap]
    );
    // top - right
    drawTriangle(
      {
        ctx: this.ctx,
        color,
      },
      [startX + width, startY],
      [startX + width - widthGap, startY],
      [startX + width, startY + heightGap]
    );
    // bottom - left
    drawTriangle(
      {
        ctx: this.ctx,
        color,
      },
      [startX, startY + height],
      [startX, startY + height - heightGap],
      [startX + widthGap, startY + height]
    );
    // bottom - right
    drawTriangle(
      {
        ctx: this.ctx,
        color,
      },
      [startX + width, startY + height],
      [startX + width - widthGap, startY + height],
      [startX + width, startY + height - heightGap]
    );
  }

  private drawMoveHightLight(cell: Cell) {
    const { color, radius, endAngle, startAngle } = this.canMoveOptions;
    const { startX, startY } = cell.getPosition();
    const { width, height } = cell.getSize();

    const arcX = startX + width / 2;
    const arcY = startY + height / 2;

    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(arcX, arcY, radius, startAngle, endAngle);
    this.ctx.fill();
    this.ctx.closePath();
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
