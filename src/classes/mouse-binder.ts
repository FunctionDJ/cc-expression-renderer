import { Animator } from "./animator";

export class MouseBinder {
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly animationWrapper: Animator
  ) {}

  public bind() {
    this.canvas.addEventListener(
      "mouseenter",
      this.mouseenterListener
    );

    this.canvas.addEventListener(
      "mouseleave",
      this.mouseleaveListener
    );
  }

  public unbind() {
    this.canvas.removeEventListener(
      "mouseenter",
      this.mouseenterListener
    );

    this.canvas.removeEventListener(
      "mouseleave",
      this.mouseleaveListener
    );

    this.animationWrapper.stopLoop();
  }

  private readonly mouseenterListener = () => {
    this.animationWrapper.playLoop();
  };

  private readonly mouseleaveListener = () => {
    this.animationWrapper.stopLoop();
  };
}
