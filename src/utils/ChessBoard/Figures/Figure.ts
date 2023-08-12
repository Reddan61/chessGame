interface FigurePayload {
  image: string;
}

type Directions = [x: number, y: number][];

export class Figure {
  private image: HTMLImageElement;

  constructor({ image }: FigurePayload) {
    const img = new Image()
    img.src = image

    this.image = img
  }

  public getImage() {
    return this.image;
  }

  public getDirections(): Directions {
    return [];
  }
}
