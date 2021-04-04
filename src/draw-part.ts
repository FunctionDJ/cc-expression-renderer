import { CharacterDataWrapper, clip, createEmptyDimensions, Dimensions, Expression, FrameType, GetPreparedPartDataInput, getPreparedPartsData } from "./helper";
import { SrcMap } from "./helper";


export interface PreparedPartData {
  name: string
  type: number
  source: [number, number]
  dest: [number, number]
  size: [number, number]
  img: string
}

interface FrameConfig {
  debug: boolean
  frameType: FrameType
}

export class CanvasWrapper {
  public canvas = document.createElement("canvas");
  private context: CanvasRenderingContext2D;
  public pushInBoundaryX = 40;
  public pushInBoundaryY = 5;
  public transparentValue = 0.2;

  private initialWidth: number;
  private initialHeight: number;

  private lastConfig?: FrameConfig;

  constructor(
    private imgMap: SrcMap,
    width: number,
    height: number
  ) {
    this.initialWidth = width;
    this.initialHeight = height;

    this.canvas.width = width;
    this.canvas.height = height;

    const maybeContext = this.canvas.getContext("2d");

    if (!maybeContext) {
      throw new Error("can't get context");
    }

    this.context = maybeContext;
  }

  private getIfSameFrameAndSetLastFrame(config: FrameConfig): boolean {
    if (!this.lastConfig) {
      this.lastConfig = config;
      return false;
    }

    const isSame = JSON.stringify(this.lastConfig) === JSON.stringify(config);

    if (!isSame) {
      this.lastConfig = config;
    }

    return isSame;
  }

  public drawStatic(
    bodyPartsList: string[],
    characterDataWrapper: CharacterDataWrapper,
    config: FrameConfig,
    calibrate?: true
  ): Dimensions {
    // if (!calibrate && this.getIfSameFrameAndSetLastFrame(config)) {
    //   return createEmptyDimensions(); // TODO fix this lmao
    // }

    this.context.clearRect(
      -this.context.getTransform().m41,
      -this.context.getTransform().m42,
      this.canvas.width,
      this.canvas.height
    );

    const maybeCompleteInputs = bodyPartsList.map((name, type) => (
      {
        name,
        type,
        data: characterDataWrapper.getPartData(name, type) // can be null!
      }
    ));

    if (maybeCompleteInputs.some(({ data }) => !data)) { // if any data is undefined
      throw new Error("some part data is undefined");
    }

    // TypeScript can't understand the type guard above, so we need to tell it
    const completeInputs = maybeCompleteInputs as GetPreparedPartDataInput[];

    const isFaceOnly = config.frameType === "face-only";

    let {
      statelessPartsData: stateless,
      span
    } = getPreparedPartsData(completeInputs, isFaceOnly);

    if (isFaceOnly) {
      const last = stateless[stateless.length - 1];
      stateless = [last]; // last only (face)
    }

    const result = {
      minX: span.minX,
      maxX: span.maxX,
      minY: span.minY,
      maxY: span.maxY,
    };

    if (calibrate) {
      if (config.frameType === "default") {
        this.canvas.width = this.initialWidth;
        this.canvas.height = this.initialHeight;
        this.context.translate(0, 0);
      } else {
        this.canvas.width = result.maxX - result.minX;
        this.canvas.height = result.maxY - result.minY;
        this.context.translate(-result.minX, -result.minY);
      }
    }

    stateless.forEach((prepared) => {
      this.drawPart(prepared, config.debug);

      if (config.debug) {
        requestAnimationFrame(() => {
          this.drawDebugPart(prepared);
        })
      }
    });

    return result;
  }

  private drawPart(
    data: PreparedPartData,
    transparent: boolean
  ) {
    if (transparent) {
      this.context.globalAlpha = this.transparentValue;
    }

    const srcObject = this.imgMap.find(i => i.name === data.img);

    if (!srcObject) {
      throw new Error(`couldn't find img ${data.img} in imgMap`);
    }
  
    this.context.drawImage(
      srcObject.src,
      data.source[0],
      data.source[1],
      data.size[0],
      data.size[1],
      data.dest[0],
      data.dest[1],
      data.size[0],
      data.size[1],
    );
  
    if (transparent) {
      this.context.globalAlpha = 1;
    }
  }

  private drawDebugPart(data: PreparedPartData) {
    this.context.strokeStyle = "grey";

    this.context.strokeRect(
      data.dest[0],
      data.dest[1],
      data.size[0],
      data.size[1]
    )

    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
  
    const centerX = (data.size[0] / 2) + data.dest[0];
    const centerY = (data.size[1] / 2) + data.dest[1];

    const x1 = data.dest[0];
    const x2 = data.dest[0] + data.size[0];

    const inboundX = clip(
      centerX,
      x1 + this.pushInBoundaryX,
      x2 - this.pushInBoundaryX
    );

    const y1 = data.dest[1];
    const y2 = data.dest[1] + data.size[1];
    
    const inboundY = clip(
      centerY,
      y1 + this.pushInBoundaryY,
      y2 - this.pushInBoundaryY
    );

    this.context.fillStyle = "black";
  
    this.context.fillText(
      `${data.type}:${data.name}`,
      inboundX,
      inboundY,
    );
  }
}

class TimeoutWrapper {
  private handler?: number;

  constructor(private debugName?: string) {}

  private debug(...msg: any[]) {
    if (this.debugName !== undefined) {
      console.log(`${this.debugName}:`, ...msg)
    }
  }

  has() {
    this.debug("has", this.handler);
    return this.handler !== undefined;
  }

  set(handler: number) {
    this.debug("set", handler);
    this.handler = handler;
  }

  clear() {
    this.debug("clear", this.handler);
    clearInterval(this.handler);
    this.handler = undefined;
  }
}

export class AnimationWrapper {
  private expression: Expression;
  private animationIntervalWrapper = new TimeoutWrapper();
  private loopWrapper = new TimeoutWrapper();

  constructor(
    private canvasWrapper: CanvasWrapper,
    private characterDataWrapper: CharacterDataWrapper,
    initialExpression: Expression,
    private config: FrameConfig
  ) {
    this.expression = initialExpression;
    this.renderFirstFrame(true);
    this.renderFirstFrame();
  }

  public getConfig() {
    return this.config;
  }

  private refreshFirstIfStill() {
    if (!this.animationIntervalWrapper.has()) {
      this.renderFirstFrame();
    }
  }

  public updateConfig(config: FrameConfig) {
    this.config = config;
    this.renderFirstFrame(true);
    this.refreshFirstIfStill();
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

  private *nextBodyPartListGenerator() {
    const repetitions = this.expression.repeat || 1;
    const order = this.expression.anim;

    if (!order) {
      throw new Error("wanted to animate, but no anim");
    }

    for (let i = 0; i <= repetitions; i++) {
      yield* order;
    }
  }

  private renderFirstFrame(resizeCanvas?: true) {
    if (!this.expression.anim) {
      throw new Error("wanted to render first frame, but no anim")
    }

    const firstBodyPartsList = this.expression.faces[
      this.expression.anim[0]
    ];

    this.canvasWrapper.drawStatic(
      firstBodyPartsList,
      this.characterDataWrapper,
      this.config,
      resizeCanvas
    );
  }

  playLoop() {
    if (this.loopWrapper.has()) {
      return;
    }
    
    this.playOnce();

    this.loopWrapper.set(setInterval(() => {
      this.playOnce();
    }, this.getLoopDurationMS()));
  }

  playOnce() {
    if (this.animationIntervalWrapper.has()) {
      return;
    }

    const getNextBodyPartListIndex = this.nextBodyPartListGenerator();

    this.animationIntervalWrapper.set(setInterval(() => {
      const iteratorResult = getNextBodyPartListIndex.next();
  
      if (iteratorResult.done) {
        this.animationIntervalWrapper.clear();
        this.renderFirstFrame();
        return;
      }
      
      const bodyPartListIndex = iteratorResult.value;
      
      const bodyPartList: string[] = this.expression.faces[bodyPartListIndex];

      this.canvasWrapper.drawStatic(
        bodyPartList,
        this.characterDataWrapper,
        this.config
      );
    }, this.getFrameDurationMS()));
  }

  stopLoop() {
    this.loopWrapper.clear();
    console.log("tryna stop");
  }
}