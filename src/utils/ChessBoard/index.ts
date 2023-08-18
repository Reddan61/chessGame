import { Cell } from "@utils/ChessBoard/Cell";
import { percentFromNumber } from "@utils/Math";
import { drawTriangle } from "@utils/Canvas";
import { Figures, FiguresConfig } from "@utils/ChessBoard/Config";
import {
  Pawn,
  Bishop,
  Horse,
  Rook,
  Queen,
  King,
} from "@utils/ChessBoard/Figures";

interface Size {
  width: number;
  height: number;
}

const FiguresConstructors = {
  [Figures.PAWN]: Pawn,
  [Figures.HORSE]: Horse,
  [Figures.BISHOP]: Bishop,
  [Figures.ROOK]: Rook,
  [Figures.QUEEN]: Queen,
  [Figures.KING]: King,
} as const;

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
  private check: {
    kingCell: Cell;
    checkCell: Cell;
  } | null = null;
  private cellTargets: Record<number, Record<number, Cell[]>> = {};

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

    // this.targetCells = newTarget;
    this.cells = newCells;
  }

  private initFigures() {
    // начальное расстановка фигур и подгрузка их картинок
    const config = FiguresConfig;
    const promises = [];

    for (let i = 0; i < config.length; i++) {
      const { coords, figure, side } = config[i];
      const cell = this.cells[coords[1]][coords[0]];

      const Figure = new FiguresConstructors[figure]({
        side,
      });

      promises.push(
        new Promise((res) => {
          Figure.getImage().onload = () => {
            cell.setFigure(Figure);
            res(true);
          };
        })
      );
    }

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

  // проверка на шах
  private getCheck() {
    let check = null as ChessBoard["check"];

    yFor: for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];

        const figure = cell.getFigure();

        if (!figure) continue;

        const { beat: notFilteredBeat } = figure.getAvailableCells(
          cell,
          this.cells
        );

        const beat = this.filterBeatCells(cell, notFilteredBeat);

        for (let k = 0; k < beat.length; k++) {
          const [x, y] = beat[k];
          const potentialCell = this.cells[y][x];

          const figure = potentialCell.getFigure();

          if (!figure) return false;

          const isKing = !figure.canBeat();

          if (isKing) {
            check = {
              checkCell: cell,
              kingCell: potentialCell,
            };
            break yFor;
          }
        }
      }
    }

    this.check = check;

    return !!check;
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
    this.getTargets();
    this.getCheck();
    this.drawBackGround();
    this.drawFigures();
    this.drawDirections();
    console.log(this);
  }
  // открытые клетки для хода во время шаха
  // private filterMovesWhileCheck(
  //   move: [X: number, y: number][],
  //   beat: [X: number, y: number][]
  // ): {
  //   move: [X: number, y: number][];
  //   beat: [X: number, y: number][];
  // } {
  //   const check = this.check;

  //   if (!check)
  //     return {
  //       move,
  //       beat,
  //     };

  //   const { checkCell } = check;
  //   const { x, y } = checkCell.getPosition();

  //   const newMoves = move.filter(([moveX, moveY]) => {
  //     const found = check.needToBlockCells.find((cell) => {
  //       const { x, y } = cell.getPosition();

  //       return moveX === x && moveY === y;
  //     });

  //     return !!found;
  //   });

  //   const newBeat = beat.filter(([beatX, beatY]) => {
  //     return beatX === x && beatY === y;
  //   });

  //   return {
  //     beat: newBeat,
  //     move: newMoves,
  //   };
  // }

  private filterMoveCells(
    cell: Cell,
    move: [x: number, y: number][][]
  ): [x: number, y: number][] {
    const result: [x: number, y: number][] = [];

    const myCellFigure = cell.getFigure();

    if (!myCellFigure) return result;

    for (let i = 0; i < move.length; i++) {
      for (let j = 0; j < move[i].length; j++) {
        const [x, y] = move[i][j];
        const cell = this.cells[y][x];

        const figure = cell.getFigure();

        if (!figure) {
          result.push([x, y]);
          continue;
        }

        break;
      }
    }

    return result;
  }

  private filterBeatCells(
    cell: Cell,
    beat: [x: number, y: number][][],
    priority?: [x: number, y: number]
  ): [x: number, y: number][] {
    const result: [x: number, y: number][] = [];

    const myCellFigure = cell.getFigure();

    if (!myCellFigure) return result;

    const mySide = myCellFigure.getSide();

    for (let i = 0; i < beat.length; i++) {
      for (let j = 0; j < beat[i].length; j++) {
        const [x, y] = beat[i][j];
        const cell = this.cells[y][x];

        const figure = cell.getFigure();

        if (!figure) {
          continue;
        }

        const sameSide = figure.sameSide(mySide);

        if (sameSide) {
          break;
        }

        if (priority) {
          const [priorityX, priorityY] = priority;

          if (priorityX === x && priorityY === y) {
            result.push([x, y]);
          }
        } else {
          result.push([x, y]);
        }

        break;
      }
    }

    return result;
  }

  private getTargets() {
    const result: ChessBoard["cellTargets"] = {};

    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];

        const figure = cell.getFigure();

        if (!figure) continue;

        const { beat: notFilteredBeat } = figure.getAvailableCells(
          cell,
          this.cells
        );

        const beat = this.filterBeatCells(cell, notFilteredBeat);

        beat.forEach(([x, y]) => {
          result[x] = {
            ...result[x],
            [y]: [...(result[x]?.[y] ?? []), cell],
          };
        });
      }
    }

    this.cellTargets = result;
  }

  // получение фигур, которые сделают шах, если убрать текущую фигуру
  private getCheckBySources(cell: Cell, sources: Cell[]) {
    const { x, y } = cell.getPosition();
    const figure = cell.getFigure();

    if (!figure) return [];

    const result: Cell[] = [];

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];

      const figure = source.getFigure();

      if (!figure) continue;

      const { beat } = figure.getAvailableCells(source, this.cells);
      // нашли текущую фигуру
      let hasCurrentCell = false;

      for (let j = 0; j < beat.length; j++) {
        const direction = beat[j];

        for (let k = 0; k < direction.length; k++) {
          const beatPosition = direction[k];

          const isCurrentCell = x === beatPosition[0] && y === beatPosition[1];

          if (isCurrentCell) {
            hasCurrentCell = true;
            continue;
          }

          if (hasCurrentCell) {
            const beatCell = this.cells[beatPosition[1]][beatPosition[0]];

            const beatFigure = beatCell.getFigure();

            if (!beatFigure) continue;

            const beatSide = beatFigure.getSide();
            const sameSide = figure.sameSide(beatSide);
            const isKing = !beatFigure.canBeat();

            if (!sameSide && isKing) {
              result.push(source);
              break;
            }

            break;
          }
        }
      }
    }

    return result;
  }

  private drawDirections() {
    const cell = this.selectedCell;
    const figure = cell?.getFigure();

    if (!figure || !cell) {
      this.canMoveCells = [];
      return;
    }

    const { x, y } = cell.getPosition();

    const { beat: beatNotFiltered, move: moveNotFiltred } =
      figure.getAvailableCells(cell, this.cells);

    const mySources = this.cellTargets[x]?.[y];
    const hasSources = !!mySources?.length;
    let priorityToBeat: [x: number, y: number] | null = null;

    if (hasSources) {
      const cellsWhoWillCheck = this.getCheckBySources(cell, mySources);
      console.log(cellsWhoWillCheck);
      if (cellsWhoWillCheck.length > 1) return;

      if (cellsWhoWillCheck.length) {
        const { x, y } = cellsWhoWillCheck[0].getPosition();

        priorityToBeat = [x, y];
      }
    }

    const move = this.filterMoveCells(cell, moveNotFiltred);
    const beat = this.filterBeatCells(
      cell,
      beatNotFiltered,
      priorityToBeat ?? undefined
    );

    const newCanMoveCells: ChessBoard["canMoveCells"] = [];

    for (let i = 0; i < move.length; i++) {
      const [x, y] = move[i];

      const moveCell = this.cells[y]?.[x];

      if (!moveCell) continue;

      const { x: availableCellX, y: availableCellY } = moveCell.getPosition();

      this.drawMoveHightLight(moveCell);

      newCanMoveCells.push([availableCellX, availableCellY]);
    }

    for (let i = 0; i < beat.length; i++) {
      const [x, y] = beat[i];

      const beatCell = this.cells[y]?.[x];

      if (!beatCell) continue;

      const { x: availableCellX, y: availableCellY } = beatCell.getPosition();
      const figure = beatCell.getFigure();

      if (!figure) continue;

      this.drawMoveHightLightWithFigure(beatCell);

      newCanMoveCells.push([availableCellX, availableCellY]);
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
