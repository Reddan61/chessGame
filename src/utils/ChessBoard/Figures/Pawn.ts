import PawnSVG from "@svg/Pawn.svg";
import { Figure } from "./Figure";

type Payload = Omit<ConstructorParameters<typeof Figure>["0"], 'image'>;

export class Pawn extends Figure {
  constructor(payload: Payload) {
    super({
        ...payload,
        image: PawnSVG
    });
  }
}
