import PawnSVG from "@svg/Pawn.svg";
import { Figure } from "./Figure";

// type Payload = Omit<ConstructorParameters<typeof Figure>["0"], 'image'>;
export class Pawn extends Figure {
  constructor() {
    super({
      image: PawnSVG,
    });
  }

  public getDirections: Figure["getDirections"] = function () {
    // TODO: сделать логику для первого хода
    return [
      [0, -1],
      [0, -2],
    ];
  };
}
