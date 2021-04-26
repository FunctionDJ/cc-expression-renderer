/**
 * Types for character / expression rendering by https://github.com/FunctionDJ
 *
 * Credit goes to https://github.com/ac2pic and https://github.com/AndrielChaoti
 * for initial types at https://github.com/CCDirectLink/crosscode-re-docs/blob/master/gui/faces.md
 */

export interface Part {
  /** In-game destination X-coordinate */
  destX: number;

  /** In-game destination Y-coordinate */
  destY: number;

  /** Width of body part in the image file */
  width: number;

  /** Height of the body part in the image file */
  height: number;

  /** X-coodinate (start) of the part location in the image file */
  srcX: number;

  /** Y-coodinate (start) of the part location in the image file */
  srcY: number;

  /**
   * Adjustment carry-over value for `destX`, only applies to the next part in the chain, not the current one.
   *
   * Also **accumulates**, so every subsequent part can be affected by all prior parts together.
   */
  subX?: number;

  /**
   * Adjustment carry-over value for `destY`, only applies to the next part in the chain, not the current one.
   *
   * Also **accumulates**, so every subsequent part can be affected by all prior parts together.
   */
  subY?: number;

  /** Key of `SubImage` to use (see {@link Face.subImages}) */
  img?: string;
}

/**
 * A static expression that doesn't contain any animation.
 */
export interface StaticExpression {
  /**
   * An array of string arrays.
   *
   * Only contains one item because this is a static expression, so no animation.
   *
   * Every string in the inner array references a {@link Part} with it's index being the type.
   * (See {@link Face.parts} for explanation)
   */
  faces: [string[]];
}

export interface AnimatedExpression {
  /**
   * Every number represent the index of a value of {@link faces},
   * so every number resolves to a string array (an array of parts).
   */
  anim: number[];

  /**
   * Duration of one rendered "frame" in seconds.
   *
   * Multiply with {@link anim}`.length` to get animation duration.
   */
  time: number;

  /**
   * Times of repetitions of {@link anim}. Don't repeat if `undefined`.
   */
  repeat?: number;

  /**
   * An array of string arrays.
   *
   * The first index is the frame number referenced by {@link anim}.
   *
   * The second index is the body part type.
   */
  faces: string[][];
}

/**
 * Might be static or have additional props for animation.
 *
 * Check for truthiness of the {@link AnimatedExpression.anim} prop.
 */
export type Expression = StaticExpression | AnimatedExpression;

export type FaceMap = Record<string, string>; // Unexpected, CC do be like that

export type SubImageMap = Record<string, string>;

export type ExpressionMap = Record<string, Expression>;

/** See {@link Face.parts} for details */
export type PartMap = Record<string, Part>;

export interface Face {
  /** Reference width. Some expressions like Apollo pointing and all of Manlea are larger than this field. */
  width: number;

  /** Reference height. Some expressios like Apollo pointing and all of Manlea are larger than this field. */
  height: number;

  /** Center of the faces X-coordinate. Usage unknown. */
  centerX: number;

  /** Center of the faces Y-coordinate. Usage unknown. */
  centerY: number;

  /** Image path for the default source image to use. */
  src: string;

  /**
   * Map (object) from subImage names (strings) to src image paths (strings).
   *
   * These are referenced by {@link Part.img}.
   *
   * Location: `assets/media/face/[character].png`
   */
  subImages?: SubImageMap;

  /**
   * An array of body part maps (objects).
   *
   * The array index determines the body part type, which is typically `0`: body, `1`: top of head, `2: face`.
   *
   * Sometimes characters have additional "body part types", like Sergey (`0`: his background frame thing).
   *
   * The face is *always* the last body part type, i.e. the last object in this array.
   */
  parts: PartMap[];

  expressions: ExpressionMap;
}

export interface Character {
  /**
   * Can either be
   *
   * • `undefined` (no face)
   *
   * • a {@link Face} object
   *
   * • a string pointing to `AbstractFaces`
   *
   * • a map (object) of strings pointing to `AbstractFaces`
   *
   * (so far i've only ever seen `{ ABSTRACT: string }`)
   */
  face?: Face | string | FaceMap;
}
