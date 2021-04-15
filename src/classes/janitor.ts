import {getContextSafe} from '../safe-getters';

export class Janitor {
  private readonly context: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly initialWidth: number,
    private readonly initialHeight: number
  ) {
    this.context = getContextSafe(canvas);
  }

  public resizeCanvasToDefault() {
    this.canvas.width = this.initialWidth;
    this.canvas.height = this.initialHeight;
    this.context.translate(0, 0);
  }

  public resizeCanvasToFaceOnly() {}
}
