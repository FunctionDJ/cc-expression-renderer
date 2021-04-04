import { CharacterDataWrapper, clip, createEmptyDimensions, Dimensions, Expression, GetPreparedPartDataInput, getPreparedPartsData } from "./helper";

export interface PreparedPartData {
  name: string
  type: number
  source: [number, number]
  dest: [number, number]
  size: [number, number]
}

interface FrameConfig {
  debug: boolean
  faceOnly: boolean
  expandFrame: boolean
}

export class CanvasWrapper {
  public canvas = document.createElement("canvas");
  private context: CanvasRenderingContext2D;
  public pushInBoundaryX = 40;
  public pushInBoundaryY = 5;
  public transparentValue = 0.3;

  private bound?: {
    wrapper: MasterWrapper
    mouseenterListener: () => void
    mouseleaveListener: () => void
  }

  private lastConfig?: FrameConfig;

  constructor(
    private image: HTMLImageElement,
    width: number,
    height: number
  ) {
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
    if (!calibrate && this.getIfSameFrameAndSetLastFrame(config)) {
      return createEmptyDimensions();
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

    let {
      statelessPartsData: stateless,
      span
    } = getPreparedPartsData(completeInputs, config.faceOnly);

    if (config.faceOnly) {
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
      this.canvas.width = result.maxX - result.minX;
      this.canvas.height = result.maxY - result.minY;
      this.context.translate(-result.minX, -result.minY);
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
  
    this.context.drawImage(
      this.image,
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
    const centerY = (data.dest[1] / 2) + data.dest[1];
  
    const canvasWidth = this.context.canvas.width;
    const canvasHeight = this.context.canvas.height;
  
    const inboundX = clip(
      centerX,
      this.pushInBoundaryX,
      canvasWidth - this.pushInBoundaryX
    );
  
    const inboundY = clip(
      centerY,
      this.pushInBoundaryY,
      canvasHeight - this.pushInBoundaryY
    );
  
    this.context.fillStyle = "black";
  
    this.context.fillText(
      `${data.type}:${data.name}`,
      inboundX,
      inboundY
    );
  }

  public bindMasterWrapper(wrapper: MasterWrapper) {
    if (this.bound?.wrapper) {
      this.bound.wrapper.stopLoop();
    }

    this.bound = {
      wrapper,
      mouseenterListener: () => wrapper.playLoop(),
      mouseleaveListener: () => wrapper.stopLoop()
    };

    this.canvas.addEventListener(
      "mouseenter",
      this.bound.mouseenterListener
    );

    this.canvas.addEventListener(
      "mouseleave",
      this.bound.mouseleaveListener
    )
  }

  public unbindMasterWrapper() {
    if (!this.bound) {
      console.warn("called stopControl before startControl");
      return;
    }

    this.canvas.removeEventListener(
      "mouseenter",
      this.bound.mouseenterListener,
    );

    this.canvas.removeEventListener(
      "mouseleave",
      this.bound.mouseleaveListener
    );

    this.bound.wrapper.stopLoop();

    this.bound = undefined;
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

export class MasterWrapper {
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

  private getFrameDuration(): number {
    const seconds = this.expression.time;

    if (seconds === undefined) {
      throw new Error("requested frame duration, but no time");
    }

    return seconds * 1000;
  }

  private getLoopDuration(): number {
    const milliSeconds = this.getFrameDuration();

    const frames = this.expression.anim;

    if (!frames) {
      throw new Error("requested loop dureation, but no frames (anim)");
    }
    
    return milliSeconds * frames.length;
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
    }, this.getLoopDuration()));
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
    }, this.getFrameDuration()));
  }

  stopLoop() {
    this.loopWrapper.clear();
  }
}