import { FC } from "react";
import classes from "./index.modules.scss";

interface Props {
  options: {
    x: number;
    y: number;
  };
  images: string[];
  onChange: (index: number) => void;
}

export const ChangePawnModal: FC<Props> = ({ options, images, onChange }) => {
  return (
    <div className={classes.body} style={{
      top: options.y,
      left: options.x
    }}>
      {images.map((src, index) => {
        return <img key={src} src={src} onClick={() => onChange(index)} />;
      })}
    </div>
  );
};
