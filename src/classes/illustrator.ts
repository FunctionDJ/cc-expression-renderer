import { getStatelessPartsData } from "../get-stateless-parts-data";
import { clip } from "../helper";
import { Dimensions, FrameType, PreparedDataInput, StatelessPart } from "../types/expression-renderer";
import { Individual } from "./individual";

export interface FrameConfig {
  debugMode: boolean;
  frameType: FrameType;
}

export class Illustrator {
  public pushInBoundaryX = 40;
  public pushInBoundaryY = 5;
  public transparentValue = 0.2;

  private context: CanvasRenderingContext2D;

  private readonly initialWidth: number;
  private readonly initialHeight: number;

  private lastConfig?: FrameConfig;

  constructor(private readonly character: Individual) {
    const { width, height } = character.face;

    this.initialWidth = width;
    this.initialHeight = height;

    character.canvas.width = width;
    character.canvas.height = height;

    const maybeContext = character.canvas.getContext("2d");

    if (!maybeContext) {
      throw new Error("can't get context");
    }

    this.context = maybeContext;
  }

  public drawStatic(
    bodyPartsList: string[],
    config: FrameConfig,
    calibrate?: true
  ): Dimensions {
    // If (!calibrate && this.getIfSameFrameAndSetLastFrame(config)) {
    //   return createEmptyDimensions(); // TODO fix this lmao
    // }

    this.context.clearRect(
      -this.context.getTransform().m41,
      -this.context.getTransform().m42,
      this.character.canvas.width,
      this.character.canvas.height
    );

    console.log("paint");

    const inputs = this.getPreparedPartDataInputs(bodyPartsList);

    const isFaceOnly = config.frameType === "face-only";

    let { statelessPartsData, span } = getStatelessPartsData(inputs, isFaceOnly);

    if (isFaceOnly) {
      const last = statelessPartsData[statelessPartsData.length - 1];

      if (!last) {
        throw new Error("no last");
      }

      statelessPartsData = [last]; // Last only (face)
    }

    const result = {
      minX: span.minX,
      maxX: span.maxX,
      minY: span.minY,
      maxY: span.maxY
    };

    if (calibrate) {
      if (config.frameType === "default") {
        this.character.canvas.width = this.initialWidth;
        this.character.canvas.height = this.initialHeight;
        this.context.translate(0, 0);
      } else {
        this.character.canvas.width = result.maxX - result.minX;
        this.character.canvas.height = result.maxY - result.minY;
        this.context.translate(-result.minX, -result.minY);
      }
    }

    for (const prepared of statelessPartsData) {
      this.drawPart(prepared, config.debugMode);

      if (config.debugMode) {
        requestAnimationFrame(() => {
          this.drawDebugPart(prepared);
        });
      }
    }

    return result;
  }

  public getExpandedDimensions(bodyPartsList: string[]): Dimensions {
    const inputs = this.getPreparedPartDataInputs(bodyPartsList);
    return getStatelessPartsData(inputs, false).span;
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

  private getPreparedPartDataInputs(bodyPartsList: string[]): PreparedDataInput[] {
    return bodyPartsList.map((name, type) => {
      const data = this.character.getPart(name, type);
      return { name, type, data };
    });
  }

  private drawPart(
    data: StatelessPart,
    transparent: boolean
  ) {
    if (transparent) {
      this.context.globalAlpha = this.transparentValue;
    }

    const srcObject = this.character.images.find(i => i.name === data.img);

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
      data.size[1]
    );

    if (transparent) {
      this.context.globalAlpha = 1;
    }
  }

  private drawDebugPart(data: StatelessPart) {
    this.context.strokeStyle = "grey";

    this.context.strokeRect(
      data.dest[0],
      data.dest[1],
      data.size[0],
      data.size[1]
    );

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
      inboundY
    );
  }
}
