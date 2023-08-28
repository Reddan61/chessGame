import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { ChessBoard as ChessBoardGame, Handlers } from "@utils/ChessBoard";
import { getObjectKeys } from "@utils/index";
import { SIDES } from "@utils/ChessBoard/Figures/Figure";
import { ChangePawnModal } from "@src/Components/ChangePawnModal";
import classes from "./index.modules.scss";

interface Config {
  currentSide: SIDES | null;
  beat: {
    [SIDES.WHITE]: string[];
    [SIDES.BLACK]: string[];
  };
}

export const ChessBoard = () => {
  const [board, setBoard] = useState<ChessBoardGame | null>(null);
  const [config, setConfig] = useState<Config>({
    currentSide: null,
    beat: {
      [SIDES.WHITE]: [],
      [SIDES.BLACK]: [],
    },
  });
  const [Modal, setModal] = useState<ReactElement | null>(null);
  
  const boardRef = useRef<HTMLCanvasElement | null>(null);

  const changeSideHandler = useCallback((currentSide: SIDES) => {
    setConfig((state) => ({
      ...state,
      currentSide,
    }));
  }, []);

  const onBeatHandler = useCallback<Handlers["onBeat"]>((target, by) => {
    const image = target.getImage();
    const side = target.getSide();

    setConfig((state) => ({
      ...state,
      beat: {
        ...state.beat,
        [side]: [...state.beat[side], image.src],
      },
    }));
  }, []);

  const onEnd = useCallback<Handlers["onEnd"]>((side) => {
    setTimeout(() => {
      alert(`${side} победили`);
    }, 0);
  }, []);

  const onPawnChange = useCallback<Handlers["onPawnChange"]>(
    ({ nextCell, availableFigures }) => {
      return new Promise((res) => {
        const images = availableFigures.map((figure) => figure.getImage().src);
        const { startX, startY } = nextCell.getPosition();

        const canvas = boardRef.current

        if (!canvas) {
          return res(null)
        }

        const { left, top } = canvas.getBoundingClientRect()

        const newX = left + startX
        const newY = top + startY

        setModal(
          <ChangePawnModal
            options={{
              x: newX,
              y: newY,
            }}
            images={images}
            onChange={(i) => {
              setModal(null);
              res(availableFigures[i]);
            }}
          />
        );
      });
    },
    []
  );

  const restart = () => {
    if (!board) return;

    setConfig({
      currentSide: null,
      beat: {
        [SIDES.WHITE]: [],
        [SIDES.BLACK]: [],
      },
    });

    board.restart();
  };

  useEffect(() => {
    const boardCanvas = boardRef.current;

    if (boardCanvas) {
      setBoard(
        new ChessBoardGame(boardCanvas, {
          changeSide: changeSideHandler,
          onBeat: onBeatHandler,
          onEnd,
          onPawnChange,
        })
      );
    }
  }, []);

  return (
    <div className={classes.body}>
      {Modal}
      <div className={classes.left}>
        <div className={classes.header}>
          ХОД {config.currentSide === SIDES.WHITE ? "БЕЛЫХ" : "ЧЕРНЫХ"}
        </div>
        <div className={classes.board}>
          <canvas ref={boardRef} />
        </div>
        <div className={classes.restart}>
          <button onClick={restart}>РЕСТАРТ</button>
        </div>
      </div>
      <div className={classes.beat}>
        {getObjectKeys(config.beat).map((key) => {
          const current = config.beat[key];

          return (
            <div key={key} className={classes.beat__side}>
              {current.map((src, i) => (
                <img src={src} key={src + i} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
