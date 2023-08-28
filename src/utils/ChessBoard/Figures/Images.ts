import HorseWhiteSVG from "@svg/HorseWhite.svg";
import HorseBlackSVG from "@svg/HorseBlack.svg";
import BishopWhiteSVG from "@svg/BishopWhite.svg";
import BishopBlackSVG from "@svg/BishopBlack.svg";
import KingWhiteSVG from "@svg/KingWhite.svg";
import KingBlackSVG from "@svg/KingBlack.svg";
import PawnBlackSVG from "@svg/PawnBlack.svg";
import PawnWhiteSVG from "@svg/PawnWhite.svg";
import QueenWhiteSVG from "@svg/QueenWhite.svg";
import QueenBlackSVG from "@svg/QueenBlack.svg";
import RookWhiteSVG from "@svg/RookWhite.svg";
import RookBlackSVG from "@svg/RookBlack.svg";
import { getObjectKeys } from "@utils/index";

export const FiguresImages = {
  WhitePawn: new Image(),
  WhiteHorse: new Image(),
  WhiteBishop: new Image(),
  WhiteRook: new Image(),
  WhiteKing: new Image(),
  WhiteQueen: new Image(),
  BlackPawn: new Image(),
  BlackHorse: new Image(),
  BlackBishop: new Image(),
  BlackRook: new Image(),
  BlackKing: new Image(),
  BlackQueen: new Image(),
};

const FiguresSVG: Record<keyof typeof FiguresImages, string> = {
  WhitePawn: PawnWhiteSVG,
  WhiteHorse: HorseWhiteSVG,
  WhiteBishop: BishopWhiteSVG,
  WhiteRook: RookWhiteSVG,
  WhiteQueen: QueenWhiteSVG,
  WhiteKing: KingWhiteSVG,

  BlackPawn: PawnBlackSVG,
  BlackHorse: HorseBlackSVG,
  BlackBishop: BishopBlackSVG,
  BlackRook: RookBlackSVG,
  BlackQueen: QueenBlackSVG,
  BlackKing: KingBlackSVG,
};

export const LoadFiguresImages = async () => {
  const promises: Promise<boolean>[] = [];

  getObjectKeys(FiguresImages).forEach((key) => {
    const img = FiguresImages[key];
    const svg = FiguresSVG[key];
    img.src = svg;

    promises.push(
      new Promise((res) => {
        img.onload = () => {
          res(true);
        };
      })
    );
  });

  return Promise.all(promises);
};
