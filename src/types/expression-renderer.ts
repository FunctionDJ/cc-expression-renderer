import { Part } from "./crosscode";

export interface GamefilesLoader {
  getJson(filePath: string): Promise<any>;
  getImage(filePath: string): Promise<HTMLImageElement>;
}

export interface PreparedDataInput {
  name: string;
  type: number;
  data: Part;
}

export interface Dimensions {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface StatelessPart {
  name: string;
  type: number;
  source: [number, number];
  dest: [number, number];
  size: [number, number];
  img: string;
}

export type FrameType = "default" | "face-only" | "expand";

export type ImageMap = Array<{
  name: string;
  src: HTMLImageElement;
}>;
