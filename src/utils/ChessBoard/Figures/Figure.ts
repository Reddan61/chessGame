interface FigurePayload {
  image: string;
}

export class Figure {
  private image: string;

  constructor({ image }: FigurePayload) {
    this.image = image;
  }

  public getImageSrc() {
    return this.image;
  }
}
