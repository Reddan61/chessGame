type Vertex = [x: number, y: number];
interface TriangleOptions {
  ctx: CanvasRenderingContext2D;
  color: string;
}

export const drawTriangle = (
  { ctx, color }: TriangleOptions,
  vertex1: Vertex,
  vertex2: Vertex,
  vertex3: Vertex
) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(vertex1[0], vertex1[1]);
  ctx.lineTo(vertex2[0], vertex2[1]);
  ctx.lineTo(vertex3[0], vertex3[1]);
  ctx.closePath();
  ctx.fill();
};
