// @ts-expect-error
import path from "path-browserify";
import { GamefilesLoader } from "./types/expression-renderer";

interface Parsed {
  dir: string;
  base: string;
}

async function getArrayFromAsyncIterator<T>(iterator: AsyncIterableIterator<T>): Promise<T[]> {
  const result: T[] = [];

  for await (const item of iterator) {
    result.push(item);
  }

  return result;
}

export const getFileFromRoot = async (
  root: FileSystemDirectoryHandle,
  filePath: string
): Promise<File> => {
  const parsed: Parsed = path.parse(filePath);

  const bits: string[] = parsed.dir.split("/");

  let folder: FileSystemDirectoryHandle = root;

  for (const bit of bits) {
    // eslint-disable-next-line no-await-in-loop
    const all = await getArrayFromAsyncIterator(folder.values());
    const newFolder = all.find((entry): entry is FileSystemDirectoryHandle => (
      entry.kind === "directory" && entry.name === bit
    ));

    if (!newFolder) {
      throw new Error(`Could not find folder ${bit} in ${folder.name}`);
    }

    folder = newFolder;
  }

  const all = await getArrayFromAsyncIterator(folder.values());

  const file = all.find(
    (entry): entry is FileSystemFileHandle => (
      entry.kind === "file" && entry.name === parsed.base
    )
  );

  if (!file) {
    throw new Error(`Could not find file ${parsed.base} in folder ${folder.name}`);
  }

  return file.getFile();
};

export const getJsonFromRoot = async (
  root: FileSystemDirectoryHandle,
  filePath: string
): Promise<any> => {
  const file = await getFileFromRoot(root, filePath);
  const text = await file.text();
  return JSON.parse(text);
};

export const getImageFromRoot = async (
  root: FileSystemDirectoryHandle,
  filePath: string
): Promise<HTMLImageElement> => {
  const file = await getFileFromRoot(root, filePath);
  const objURL = URL.createObjectURL(file);

  const image = new Image();
  image.src = objURL;

  return image;
};

export class FileSystemLoader implements GamefilesLoader {
  constructor(
    private readonly gamefilesRoot: FileSystemDirectoryHandle
  ) {}

  async getJson(filePath: string) {
    return getJsonFromRoot(this.gamefilesRoot, filePath);
  }

  async getImage(filePath: string) {
    return getImageFromRoot(this.gamefilesRoot, filePath);
  }
}
