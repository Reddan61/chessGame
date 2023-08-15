import { SIDES } from "@src/utils/ChessBoard/Figures/Figure";

export enum Figures {
  PAWN = "PAWN",
  HORSE = "HORSE",
  BISHOP = "BISHOP",
  ROOK = "ROOK",
  QUEEN = "QUEEN",
}

type InitFiguresConfig = {
  side: SIDES;
  coords: [x: number, y: number];
  figure: Figures;
}[];

const WhitePawnConfig: InitFiguresConfig = [
  {
    coords: [0, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [1, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [2, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [3, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [4, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [5, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [6, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
  {
    coords: [7, 1],
    figure: Figures.PAWN,
    side: SIDES.WHITE,
  },
];

const BlackPawnConfig: InitFiguresConfig = [
  {
    coords: [0, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [1, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [2, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [3, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [4, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [5, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [6, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
  {
    coords: [7, 6],
    figure: Figures.PAWN,
    side: SIDES.BLACK,
  },
];

const WhiteHorsesConfig: InitFiguresConfig = [
  {
    coords: [1, 0],
    figure: Figures.HORSE,
    side: SIDES.WHITE,
  },
  {
    coords: [6, 0],
    figure: Figures.HORSE,
    side: SIDES.WHITE,
  },
];

const BlackHorsesConfig: InitFiguresConfig = [
  {
    coords: [1, 7],
    figure: Figures.HORSE,
    side: SIDES.BLACK,
  },
  {
    coords: [6, 7],
    figure: Figures.HORSE,
    side: SIDES.BLACK,
  },
];

const WhiteBishopsConfig: InitFiguresConfig = [
  {
    coords: [2, 0],
    figure: Figures.BISHOP,
    side: SIDES.WHITE,
  },
  {
    coords: [5, 0],
    figure: Figures.BISHOP,
    side: SIDES.WHITE,
  },
];

const BlackBishopsConfig: InitFiguresConfig = [
  {
    coords: [2, 7],
    figure: Figures.BISHOP,
    side: SIDES.BLACK,
  },
  {
    coords: [5, 7],
    figure: Figures.BISHOP,
    side: SIDES.BLACK,
  },
];

const WhiteRooksConfig: InitFiguresConfig = [
  {
    coords: [0, 0],
    figure: Figures.ROOK,
    side: SIDES.WHITE,
  },
  {
    coords: [7, 0],
    figure: Figures.ROOK,
    side: SIDES.WHITE,
  },
];

const BlackRooksConfig: InitFiguresConfig = [
  {
    coords: [0, 7],
    figure: Figures.ROOK,
    side: SIDES.BLACK,
  },
  {
    coords: [7, 7],
    figure: Figures.ROOK,
    side: SIDES.BLACK,
  },
];

const WhiteQueensConfig: InitFiguresConfig = [
  {
    coords: [4, 0],
    figure: Figures.QUEEN,
    side: SIDES.WHITE,
  },
];

const BlackQueensConfig: InitFiguresConfig = [
  {
    coords: [4, 7],
    figure: Figures.QUEEN,
    side: SIDES.BLACK,
  },
];

export const FiguresConfig: InitFiguresConfig = [
  ...WhitePawnConfig,
  ...BlackPawnConfig,
  ...WhiteHorsesConfig,
  ...BlackHorsesConfig,
  ...WhiteBishopsConfig,
  ...BlackBishopsConfig,
  ...WhiteRooksConfig,
  ...BlackRooksConfig,
  ...WhiteQueensConfig,
  ...BlackQueensConfig,
];
