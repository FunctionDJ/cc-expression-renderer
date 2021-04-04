import { PreparedPartData as StatelessPartData } from "./draw-part";

export interface Expression {
  anim?: number[]
  time?: number
  repeat?: number
  faces: string[][]
}

export type FrameType = "default" | "face-only" | "expand";

export interface PartType {
  [key: string]: RawPartData
}

export interface CharacterData {
  face: {
    width: number
    height: number
    centerX: number
    centerY: number
    src: string
    subImages?: {
      [key: string]: string
    }
    parts: PartType[]
    expressions: {
      [key: string]: Expression
    }
  }
}

export const clip = (a: number, min: number, max: number) => {

  if (min > max) {
    return max / 2;
  }

  return (
    Math.min(
      Math.max(a, min),
      max
    )
  )
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  
  return new Promise(res => {
    img.addEventListener("load", () => {
      res(img);
    });
  })
}

export interface RawPartData {
  srcX: number, srcY: number
  width: number, height: number
  destX: number, destY: number
  subX?: number, subY?: number
  img?: string
}

export interface GetPreparedPartDataInput {
  name: string,
  type: number,
  data: RawPartData
}

interface GetStatelessPartsDataResult {
  statelessPartsData: StatelessPartData[]
  span: Dimensions
}

export interface Dimensions {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export const createEmptyDimensions = (): Dimensions => ({
  minX: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY
})

const widenDimensions = (
  targetDimensions: Dimensions,
  wideningDimensions: Dimensions
): void => {
  targetDimensions.minX = Math.min(targetDimensions.minX, wideningDimensions.minX);
  targetDimensions.maxX = Math.max(targetDimensions.maxX, wideningDimensions.maxX);
  targetDimensions.minY = Math.min(targetDimensions.minY, wideningDimensions.minY);
  targetDimensions.maxY = Math.max(targetDimensions.maxY, wideningDimensions.maxY);
}

export const getPreparedPartsData = (
  inputs: GetPreparedPartDataInput[],
  faceOnly: boolean
): GetStatelessPartsDataResult => {
  const statelessPartsData: StatelessPartData[] = [];

  const span = createEmptyDimensions();

  let prevX = 0;
  let prevY = 0;

  inputs = faceOnly ? inputs.slice(-1) : inputs;

  for (const { name, type, data } of inputs) {
    const actualDestX = data.destX + prevX;
    const actualDestY = data.destY + prevY;

    prevX += data.subX === undefined ? 0 : data.subX;
    prevY += data.subY === undefined ? 0 : data.subY;

    const partDimensions: Dimensions = {
      minX: actualDestX,
      maxX: actualDestX + data.width,
      minY: actualDestY,
      maxY: actualDestY + data.height,
    }

    widenDimensions(span, partDimensions);

    statelessPartsData.push({
      name,
      type,
      source: [data.srcX, data.srcY],
      size: [data.width, data.height],
      dest: [actualDestX, actualDestY],
      img: data.img || ""
    });
  }
  
  return {
    statelessPartsData,
    span
  };
}

export type SrcMap = {
  name: string
  src: HTMLImageElement
}[];

export class CharacterDataWrapper {
  constructor(private characterData: CharacterData) {}

  async loadSrcMap(): Promise<SrcMap> {
    const defaultPair: [string, string] = ["", this.characterData.face.src];

    const subImagesPairs: [string, string][] = this.characterData.face.subImages
      ? Object.entries(this.characterData.face.subImages)
      : [];

    const inputPairs: [string, string][] = [
      defaultPair,
      ...subImagesPairs
    ];

    return await Promise.all(inputPairs.map(async (pair) => ({
      name: pair[0],
      src: await loadImage(`./${pair[1]}`)
    })));
  }

  getExpression(expression: string): Expression|null {
    const maybeExpression = this.characterData.face.expressions[expression];
    return maybeExpression ? maybeExpression : null;
  }

  getPartData(partName: string, partTypeIndex: number): RawPartData|null {
    const maybeCategory = this.characterData.face.parts[partTypeIndex];

    if (!maybeCategory) {
      return null;
    }

    const maybePartData = maybeCategory[partName];

    if (!maybePartData) {
      return null;
    }

    return maybePartData;
  }
}