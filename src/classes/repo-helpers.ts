import { Character } from "../types/crosscode";
import { GamefilesLoader } from "../types/expression-renderer";

export const isExtension = (characterId: string) => (
  ["manlea"].includes(characterId)
);

export const getResourceURI = (characterId: string, targetPath: string) => {
  const parts = [];

  if (isExtension(characterId)) {
    parts.push(`extension/${characterId}`);
  }

  parts.push(targetPath);

  return parts.join("/");
};

export const loadCharacter = async (
  loader: GamefilesLoader,
  category: string,
  characterId: string
): Promise<Character> => {
  const uri = getResourceURI(
    characterId,
    `data/characters/${category}/${characterId}.json`
  );

  try {
    return await loader.getJson(uri);
  } catch {
    throw new Error(`invalid character id or missing files for ${category}:${characterId}`);
  }
};

export const loadCharacterImage = async (
  loader: GamefilesLoader,
  characterId: string,
  src: string
): Promise<HTMLImageElement> => {
  const path = getResourceURI(
    characterId,
    `media/face/${src}`
  );

  try {
    return await loader.getImage(path);
  } catch {
    throw new Error(`unable to load image: ${src}`);
  }
};
