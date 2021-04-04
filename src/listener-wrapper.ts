import { AnimationWrapper } from "./draw-part";

export class ListenerWrapper {
  private mouseenterListener = () => {
    this.animationWrapper.playLoop()
  };

  private mouseleaveListener = () => {
    this.animationWrapper.stopLoop()
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private animationWrapper: AnimationWrapper
  ) {}

  bind() {
    this.canvas.addEventListener(
      "mouseenter",
      this.mouseenterListener
    );

    this.canvas.addEventListener(
      "mouseleave",
      this.mouseleaveListener
    );
  }

  unbind() {
    this.canvas.removeEventListener(
      "mouseenter",
      this.mouseenterListener,
    );

    this.canvas.removeEventListener(
      "mouseleave",
      this.mouseleaveListener
    );

    this.animationWrapper.stopLoop();
  }
}