import { Dispatch } from "react";
import { AnimatedExpression, Expression, Face, Part, StaticExpression } from "../types/crosscode";
import { ImageMap } from "../types/expression-renderer";
import { AnimationState } from "../use-expression-renderer";
import { Animator } from "./animator";
import { FrameConfig, Illustrator } from "./illustrator";
import { MouseBinder } from "./mouse-binder";

export class Individual {
  private readonly expression: Expression;
  private binder?: MouseBinder;
  private animator?: Animator;

  constructor(
    public readonly face: Readonly<Face>,
    public readonly canvas: HTMLCanvasElement,
    private expressionName: string,
    public readonly images: Readonly<ImageMap>,
    private frameConfig: FrameConfig,
    private readonly setIsAnimation: Dispatch<boolean>,
    private readonly setAnimationState: Dispatch<React.SetStateAction<AnimationState | undefined>>
  ) {
    this.expression = this.getExpression();
  }

  public getFrameConfig(): Readonly<FrameConfig> {
    return this.frameConfig;
  }

  public setFrameConfig(frameConfig: FrameConfig) {
    this.frameConfig = frameConfig;
  }

  public setExpression(expression: string) {
    this.expressionName = expression;
    this.render();
  }

  public render() {
    if (!this.images) {
      throw new Error("images not loaded or missing");
    }

    const illustrator = new Illustrator(this);

    const isAnimation = "anim" in this.expression;
    this.setIsAnimation(isAnimation);

    if ("anim" in this.expression) {
      this.renderAnimation(illustrator, this.expression);
    } else {
      this.renderStatic(illustrator, this.expression);
    }
  }

  public clean() {
    console.log("clean");

    this.animator?.stopAnim();
    this.binder?.unbind();
  }

  public getPart(partName: string, partTypeIndex: number): Part {
    const maybeCategory = this.face.parts[partTypeIndex];

    if (!maybeCategory) {
      throw new Error(`Could not find category ${partTypeIndex} in parts`);
    }

    const partConfig = maybeCategory[partName];

    if (!partConfig) {
      throw new Error(`Could not find partConfig ${partName} in category`);
    }

    return partConfig;
  }

  private renderStatic(
    illustrator: Illustrator,
    staticExpression: StaticExpression
  ) {
    const bodyPartList = staticExpression.faces[0];
    illustrator.drawStatic(bodyPartList, this.frameConfig);
  }

  private renderAnimation(
    illustrator: Illustrator,
    animExpression: AnimatedExpression
  ) {
    this.animator = new Animator(
      illustrator,
      animExpression,
      this.frameConfig,
      this.setAnimationState
    );

    this.animator.playOnce();

    this.binder = new MouseBinder(
      this.canvas,
      this.animator
    );

    this.binder.bind();
  }

  private getExpression(): Expression {
    // If (typeof this.faceObject === "string") {
    //   return this.repo.getAbstractFaceObject(this.faceObject);
    // }

    const expression = this.face.expressions[this.expressionName];

    if (!expression) {
      throw new Error(`expression not found: ${this.expressionName}`);
    }

    return expression;
  }
}
