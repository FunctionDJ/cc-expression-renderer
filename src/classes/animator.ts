import { Dispatch } from "react";
import { AnimatedExpression } from "../types/crosscode";
import { AnimationState } from "../use-expression-renderer";
import { Illustrator, FrameConfig } from "./illustrator";
import { TimeoutWrapper } from "./timeout-wrapper";

export class Animator {
  private readonly animationIntervalWrapper = new TimeoutWrapper();
  private readonly loopWrapper = new TimeoutWrapper();

  constructor(
    private readonly illustrator: Illustrator,
    private readonly expression: AnimatedExpression,
    private config: FrameConfig,
    private readonly setAnimationState: Dispatch<React.SetStateAction<AnimationState | undefined>>
  ) {
    this.renderFirstFrame(true);
    this.renderFirstFrame();

    this.setAnimationState({ anim: this.expression.anim, position: 0 });
  }

  public updateConfig(config: FrameConfig) {
    this.config = config;
    this.renderFirstFrame(true);
    this.refreshFirstIfStill();
  }

  public playLoop() {
    if (this.loopWrapper.has()) {
      return;
    }

    this.playOnce();

    const intervalFunction: TimerHandler = () => {
      this.playOnce();
    };

    this.loopWrapper.set(
      setInterval(intervalFunction, this.getLoopDurationMS())
    );
  }

  public playOnce() {
    if (this.animationIntervalWrapper.has()) {
      return;
    }

    const getNextBodyPartListIndex = this.nextBodyPartListGenerator();

    const intervalFunction: TimerHandler = () => {
      this.setAnimationState(prev => ({ anim: prev?.anim ?? [], position: 1 }));

      const iteratorResult = getNextBodyPartListIndex.next();

      if (iteratorResult.done) {
        this.animationIntervalWrapper.clear();
        this.renderLastFrame();
        return;
      }

      const bodyPartListIndex = iteratorResult.value;

      const bodyPartList = this.expression.faces[bodyPartListIndex];

      if (!bodyPartList) {
        throw new Error("problem: no body part list");
      }

      this.illustrator.drawStatic(
        bodyPartList,
        this.config
      );
    };

    this.animationIntervalWrapper.set(
      setInterval(intervalFunction, this.getFrameDurationMS())
    );
  }

  public stopAnim() {
    this.animationIntervalWrapper.clear();
    this.stopLoop();
  }

  public stopLoop() {
    this.loopWrapper.clear();
  }

  public getConfig() {
    return this.config;
  }

  private refreshFirstIfStill() {
    if (!this.animationIntervalWrapper.has()) {
      this.renderFirstFrame();
    }
  }

  private getFrameDurationMS(): number {
    const seconds = this.expression.time;

    if (seconds === undefined) {
      throw new Error("requested frame duration, but no time");
    }

    return seconds * 1000;
  }

  private getLoopDurationMS(): number {
    const frameDuration = this.getFrameDurationMS();

    const frames = this.expression.anim;

    if (!frames) {
      throw new Error("requested loop duration, but no frames (anim)");
    }

    const result = frameDuration * frames.length;
    return result;
  }

  private * nextBodyPartListGenerator() {
    const repetitions = this.expression.repeat ?? 1;
    const order = this.expression.anim;

    if (!order) {
      throw new Error("wanted to animate, but no anim");
    }

    for (let i = 0; i <= repetitions; i++) {
      yield * order;
    }
  }

  private renderFirstFrame(resizeCanvas?: true) {
    const faceIndex = this.expression.anim?.[0] ?? 0;

    const firstBodyPartsList = this.expression.faces[faceIndex];

    if (!firstBodyPartsList) {
      throw new Error("no firstbodypartslist");
    }

    this.illustrator.drawStatic(
      firstBodyPartsList,
      this.config,
      resizeCanvas
    );
  }

  private renderLastFrame() {
    let faceIndex = 0;

    if (this.expression.anim) {
      const maybeIndex = this.expression.anim[this.expression.anim.length - 1];

      if (!maybeIndex) {
        throw new Error("no index found");
      }

      faceIndex = maybeIndex;
    }

    const firstBodyPartsList = this.expression.faces[faceIndex];

    if (!firstBodyPartsList) {
      throw new Error("no firstbodypartslist");
    }

    this.illustrator.drawStatic(
      firstBodyPartsList,
      this.config
    );
  }
}
