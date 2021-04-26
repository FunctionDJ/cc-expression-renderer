import { loadCharacter } from "./classes/repo-helpers";
import { Dimensions, GamefilesLoader } from "./types/expression-renderer";

export const clip = (a: number, min: number, max: number) => {
  if (min > max) {
    return max / 2;
  }

  return (
    Math.min(
      Math.max(a, min),
      max
    )
  );
};

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;

  return new Promise((resolve, reject) => {
    img.addEventListener("load", () => {
      resolve(img);
    }, { once: true });

    img.addEventListener("error", () => {
      reject(new Error(`could not load image ${src}`));
    }, { once: true });
  });
}

export const createEmptyDimensions = (): Dimensions => ({
  minX: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY
});

export const fetchJson = async (url: string) => (
  fetch(url).then(async r => r.json())
);

export function browserHasFSASupport() {
  return "showDirectoryPicker" in window;
}
