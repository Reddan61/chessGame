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
import { Figure, SIDES } from "@utils/ChessBoard/Figures/Figure";
import { IsKing } from "@utils/ChessBoard/Figures/King";

interface Size {
  width: number;
  height: number;
}

export interface Handlers {
  changeSide: (side: SIDES) => void;
  onBeat: (target: Figure, by: Figure) => void;
  onEnd: (wonSide: SIDES) => void;
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
  private canMoveCells: {
    move: [x: number, y: number][];
    castlings: ReturnType<Figure["getAvailableCells"]>["castling"];
  } = {
    move: [],
    castlings: [],
  };
  private check: {
    kingCell: Cell;
    checkCell: Cell;
    needToBlockCells: [x: number, y: number][];
  } | null = null;
  private cellTargets: Record<number, Record<number, Cell[]>> = {};
  private currentSide: SIDES = SIDES.WHITE;
  private handlers: Handlers | null = null;

  constructor(canvas: ChessBoard["canvas"], handlers: Handlers) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error();
    }

    this.canvas = canvas;
    this.ctx = ctx;

    this.handlers = handlers;
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

  private setSide(newSide: SIDES) {
    this.currentSide = newSide;
    this.handlers?.changeSide(newSide);
  }

  private initSide() {
    this.setSide(SIDES.WHITE);
  }

  private async init() {
    this.normalizeSize();
    this.initSide();
    this.initCells();
    await this.initFigures();
    this.initHandlers();
    this.update();
  }

  private moved() {
    if (this.currentSide === SIDES.WHITE) {
      this.setSide(SIDES.BLACK);
    } else {
      this.setSide(SIDES.WHITE);
    }
  }

  private clickHandler(e: MouseEvent) {
    const { left, top } = this.canvas.getBoundingClientRect();
    const { clientX, clientY } = e;

    const mouseX = clientX - left;
    const mouseY = clientY - top;

    yFor: for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];

        const { startX, startY, endX, endY, x, y } = cell.getPosition();

        if (mouseX >= startX && mouseX <= endX) {
          if (mouseY >= startY && mouseY <= endY) {
            if (this.selectedCell) {
              const canIMove = !!this.canMoveCells.move.filter(
                ([moveX, moveY]) => {
                  return moveX === x && moveY === y;
                }
              ).length;

              const castlings = this.canMoveCells.castlings.filter(
                ({ nextKingPosition }) => {
                  return nextKingPosition.x === x && nextKingPosition.y === y;
                }
              );

              const moveCastling = !!castlings.length;

              if (moveCastling) {
                const { nextKingPosition, nextRookPosition, prevRookPosition } =
                  castlings[0];

                const prevRookCell =
                  this.cells[prevRookPosition.y][prevRookPosition.x];
                const prevRookFigure = prevRookCell.getFigure();

                const nextRookCell =
                  this.cells[nextRookPosition.y][nextRookPosition.x];

                const kingFigure = this.selectedCell.getFigure();
                const nextKingCell =
                  this.cells[nextKingPosition.y][nextKingPosition.x];

                kingFigure?.setMoved();
                prevRookFigure?.setMoved();
                nextRookCell.setFigure(prevRookFigure);
                nextKingCell.setFigure(kingFigure);
                prevRookCell.setFigure(null);
                // prevKingCell
                this.selectedCell.setFigure(null);

                this.selectedCell = null;
                this.moved();
              } else if (canIMove) {
                const selectedFigure = this.selectedCell.getFigure();
                const cellFigure = cell.getFigure();

                // мы бьем фигуру противника
                if (cellFigure && selectedFigure) {
                  const sameSide = selectedFigure.sameSide(
                    cellFigure.getSide()
                  );

                  if (!sameSide) {
                    this.handlers?.onBeat(cellFigure, selectedFigure);
                  }
                }

                selectedFigure?.setMoved();
                cell.setFigure(selectedFigure);
                this.selectedCell.setFigure(null);
                this.selectedCell = null;
                this.moved();
              } else {
                this.selectedCell = cell;
              }
            } else {
              this.selectedCell = cell;
            }

            break yFor;
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

        const { beat } = figure.getAvailableCells(cell, this.cells);
        const side = figure.getSide();

        // получение клеток, которые нужно перекрыть чтобы убрать шах
        for (let k = 0; k < beat.length; k++) {
          const cells: [x: number, y: number][] = [];

          for (let h = 0; h < beat[k].length; h++) {
            const [x, y] = beat[k][h];

            const potentialCell = this.cells[y][x];

            const figure = potentialCell.getFigure();

            if (!figure) {
              cells.push(beat[k][h]);
              continue;
            }

            const isKing = !figure.canBeat();
            const sameSide = figure.sameSide(side);

            if (!isKing || sameSide) break;

            check = {
              checkCell: cell,
              kingCell: potentialCell,
              needToBlockCells: cells,
            };

            break yFor;
          }
        }
      }
    }

    this.check = check;

    return !!check;
  }

  private getCheckMate() {
    const check = this.check;
    if (!check) return false;

    const { kingCell, checkCell } = check;

    const checkFigure = checkCell.getFigure();

    if (!checkFigure) return false;

    const checkSide = checkFigure.getSide();
    const { x: checkX, y: checkY } = checkCell.getPosition();

    const { move, beat } = this.getKingMoveCells(kingCell);

    const cantKingMove = !move.length && !beat.length;

    if (!cantKingMove) return false;

    // проверка на блок шаха союзными фигурами
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        const figure = cell.getFigure();

        if (!figure) continue;

        const sameSide = figure.sameSide(checkSide);

        if (sameSide) continue;

        const { move: movesNotFiltered, beat: beatNotFiltered } =
          figure.getAvailableCells(cell, this.cells);

        const isKing = IsKing(figure);

        const { move, beat } = isKing
          ? this.getKingMoveCells(cell)
          : {
              move: this.filterMoveCells({
                cell,
                move: movesNotFiltered,
                priority: check.needToBlockCells,
              }),
              beat: this.filterBeatCells({
                cell,
                beat: beatNotFiltered,
                priority: [checkX, checkY],
              }),
            };

        const canDoSomething = move.length || beat.length;

        if (canDoSomething) {
          return false;
        }
      }
    }

    return cantKingMove;
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
    const isCheckMate = this.getCheckMate();
    this.drawBackGround();
    this.drawFigures();

    if (isCheckMate) {
      this.handlers?.onEnd(this.currentSide);

      return;
    }

    this.drawDirections();
  }

  public restart() {
    this.init();
  }

  private filterMoveCells({
    move,
    cell,
    priority,
  }: {
    cell: Cell;
    move: [x: number, y: number][][];
    priority?: [x: number, y: number][];
  }): [x: number, y: number][] {
    const result: [x: number, y: number][] = [];

    const myCellFigure = cell.getFigure();

    if (!myCellFigure) return result;

    for (let i = 0; i < move.length; i++) {
      for (let j = 0; j < move[i].length; j++) {
        const [x, y] = move[i][j];
        const cell = this.cells[y][x];

        const figure = cell.getFigure();

        if (!figure) {
          if (priority) {
            const isPriority = priority.some(
              ([priorityX, priorityY]) => priorityX === x && priorityY === y
            );

            if (isPriority) {
              result.push([x, y]);
            }
          } else {
            result.push([x, y]);
          }

          continue;
        }

        break;
      }
    }

    return result;
  }

  private filterBeatCells({
    beat,
    cell,
    priority,
  }: {
    cell: Cell;
    beat: [x: number, y: number][][];
    priority?: [x: number, y: number];
  }): [x: number, y: number][] {
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

        if (sameSide || IsKing(figure)) {
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

  private filterBeatCellsWithEmptyCells({
    beat,
    cell,
    ignoreCell,
  }: {
    cell: Cell;
    beat: [x: number, y: number][][];
    ignoreCell?: [x: number, y: number];
  }): [x: number, y: number][] {
    const result: [x: number, y: number][] = [];

    const myCellFigure = cell.getFigure();

    if (!myCellFigure) return result;

    for (let i = 0; i < beat.length; i++) {
      for (let j = 0; j < beat[i].length; j++) {
        const [x, y] = beat[i][j];

        const isIgnore = x === ignoreCell?.[0] && y === ignoreCell?.[1];

        if (isIgnore) continue;

        const cell = this.cells[y][x];

        const figure = cell.getFigure();

        if (!figure) {
          result.push([x, y]);
          continue;
        }

        result.push([x, y]);

        break;
      }
    }

    return result;
  }

  private canBeatMeBySource(sources: Cell[], side: SIDES) {
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];

      const sourceFigure = source.getFigure();

      if (!sourceFigure) continue;

      const sameSide = sourceFigure.sameSide(side);

      if (!sameSide) {
        return true;
      }
    }

    return false;
  }

  private canMoveCastling(
    cell: Cell,
    castling: ReturnType<Figure["getAvailableCells"]>["castling"][number]
  ): boolean {
    if (!cell) return false;

    const { x, y } = cell.getPosition();
    const { direction, nextKingPosition, prevKingPosition } = castling;
    const king = this.cells[prevKingPosition.y][prevKingPosition.x];
    const kingFigure = king.getFigure();

    if (!kingFigure) return false;

    const kingSide = kingFigure.getSide();

    const sources = this.cellTargets[x]?.[y];

    const nextX = x + direction[0];
    const nextY = y + direction[1];
    const nextCell = this.cells[nextY]?.[nextX];
    const isLast = nextKingPosition.x === x && nextKingPosition.y === y;

    if (sources?.length) {
      const canBeatBySources = this.canBeatMeBySource(sources, kingSide);

      if (canBeatBySources) return false;

      if (isLast) return true;

      return this.canMoveCastling(nextCell, castling);
    }

    return !isLast ? this.canMoveCastling(nextCell, castling) : true;
  }

  private filterCastling(
    cell: Cell,
    castlings: ReturnType<Figure["getAvailableCells"]>["castling"]
  ) {
    const figure = cell.getFigure();

    if (!figure) return [];

    const isKing = IsKing(figure);

    if (!isKing) return [];

    const result = castlings.filter((castling) => {
      return this.canMoveCastling(cell, castling);
    });

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

        const beat = this.filterBeatCellsWithEmptyCells({
          cell,
          beat: notFilteredBeat,
        });

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

  // получение фигур, которые сделают шах, если убрать текущую фигуру + доступные ходы без шаха
  private getCheckBySources(cell: Cell, sources: Cell[]) {
    const { x, y } = cell.getPosition();
    const figure = cell.getFigure();

    if (!figure) return [];
    const side = figure.getSide();

    const result: { cell: Cell; direction: [x: number, y: number][] }[] = [];

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];

      const figure = source.getFigure();

      if (!figure) continue;

      const sameSide = figure.sameSide(side);

      if (sameSide) continue;

      const { beat } = figure.getAvailableCells(source, this.cells);
      // нашли текущую фигуру
      let hasCurrentCell = false;

      for (let j = 0; j < beat.length; j++) {
        const direction = beat[j];
        const resultDirection: [x: number, y: number][] = [];

        for (let k = 0; k < direction.length; k++) {
          const beatPosition = direction[k];
          const isCurrentCell = x === beatPosition[0] && y === beatPosition[1];

          if (!isCurrentCell && !hasCurrentCell) {
            resultDirection.push(beatPosition);
          }

          if (isCurrentCell) {
            hasCurrentCell = true;
            continue;
          }

          if (hasCurrentCell) {
            const beatCell = this.cells[beatPosition[1]][beatPosition[0]];

            const beatFigure = beatCell.getFigure();

            if (!beatFigure) {
              resultDirection.push(beatPosition);
              continue;
            }

            const beatSide = beatFigure.getSide();
            const sameSide = figure.sameSide(beatSide);
            const isKing = !beatFigure.canBeat();

            if (!sameSide && isKing) {
              result.push({
                cell: source,
                direction: resultDirection,
              });
              break;
            }

            break;
          }
        }
      }
    }

    return result;
  }

  private getKingMoveCells(kingCell: Cell): {
    move: [x: number, y: number][];
    beat: [x: number, y: number][];
  } {
    const figure = kingCell.getFigure();

    if (!figure)
      return {
        beat: [],
        move: [],
      };

    const kingSide = figure.getSide();
    const { x: kingX, y: kingY } = kingCell.getPosition();
    const { move: notFilteredMove, beat: notFilteredBeat } =
      figure.getAvailableCells(kingCell, this.cells);

    let kingMoves = this.filterMoveCells({
      cell: kingCell,
      move: notFilteredMove,
    });
    let kingBeats = this.filterBeatCells({
      cell: kingCell,
      beat: notFilteredBeat,
    });

    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];

        const figure = cell.getFigure();

        if (!figure) continue;

        const sameSide = figure.sameSide(kingSide);

        if (sameSide) continue;

        const { beat } = figure.getAvailableCells(cell, this.cells);

        const filteredBeat = this.filterBeatCellsWithEmptyCells({
          cell,
          beat,
          ignoreCell: [kingX, kingY],
        });

        kingMoves = kingMoves.filter(([kingX, kingY]) => {
          return !filteredBeat.some(
            ([beatX, beatY]) => kingX === beatX && kingY === beatY
          );
        });
        kingBeats = kingBeats.filter(([kingX, kingY]) => {
          return !filteredBeat.some(
            ([beatX, beatY]) => kingX === beatX && kingY === beatY
          );
        });
      }
    }

    return {
      beat: kingBeats,
      move: kingMoves,
    };
  }

  private drawDirections() {
    const cell = this.selectedCell;
    const figure = cell?.getFigure();
    const isCurrentSide = figure?.sameSide(this.currentSide);

    if (!figure || !isCurrentSide || !cell) {
      this.canMoveCells = {
        move: [],
        castlings: [],
      };
      return;
    }

    const { x, y } = cell.getPosition();

    const {
      beat: beatNotFiltered,
      move: moveNotFiltred,
      castling: castlingsNotFiltered,
    } = figure.getAvailableCells(cell, this.cells);

    const mySources = this.cellTargets[x]?.[y];
    const hasSources = !!mySources?.length;
    let priorityToBeat: [x: number, y: number] | null = null;
    let priorityToMove: [x: number, y: number][] | null = null;

    // Блок ходов при которых будет шах своему королю
    if (hasSources) {
      const cellsWhoWillCheck = this.getCheckBySources(cell, mySources);

      if (cellsWhoWillCheck.length > 1) return;

      if (cellsWhoWillCheck.length) {
        const { cell, direction } = cellsWhoWillCheck[0];
        const { x, y } = cell.getPosition();
        priorityToMove = direction;
        priorityToBeat = [x, y];
      }
    }

    // получение возможных ходов для блока шаха
    if (this.check) {
      const side = figure.getSide();
      const checkCell = this.check.checkCell;
      const { x, y } = checkCell.getPosition();
      const sameSide = checkCell.getFigure()?.sameSide(side);

      if (!sameSide) {
        if (priorityToMove) {
          priorityToMove = [...priorityToMove, ...this.check.needToBlockCells];
        } else {
          priorityToMove = this.check.needToBlockCells;
        }

        priorityToBeat = [x, y];
      }
    }

    const { beat, move } = IsKing(figure)
      ? this.getKingMoveCells(cell)
      : {
          move: this.filterMoveCells({
            cell,
            move: moveNotFiltred,
            priority: priorityToMove ?? undefined,
          }),
          beat: this.filterBeatCells({
            cell,
            beat: beatNotFiltered,
            priority: priorityToBeat ?? undefined,
          }),
        };
    const castlings = this.filterCastling(cell, castlingsNotFiltered);

    const newCanMoveCells: ChessBoard["canMoveCells"]["move"] = [];
    const newCanMoveCastlingsCells: ChessBoard["canMoveCells"]["castlings"] =
      [];

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

    for (let i = 0; i < castlings.length; i++) {
      const castling = castlings[i];
      const { nextKingPosition } = castling;
      const nextKingCell = this.cells[nextKingPosition.y]?.[nextKingPosition.x];

      if (!nextKingCell) continue;

      this.drawMoveHightLight(nextKingCell);

      newCanMoveCastlingsCells.push(castling);
    }

    this.canMoveCells.move = newCanMoveCells;
    this.canMoveCells.castlings = newCanMoveCastlingsCells;
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
