import {loadImage} from "../helper";
import {Character} from "../types/crosscode";

export const isExtension = (characterId: string) => (
  ["manlea"].includes(characterId)
);

export const getResourceURI = (assetsPath: string, characterId: string, targetPath: string) => {
  const parts = [assetsPath];

  if (isExtension(characterId)) {
    parts.push(`extension/${characterId}`);
  }

  parts.push(targetPath);

  return parts.join("/");
};

export const loadCharacter = async (category: string, characterId: string, gamefilesPath: string): Promise<Character> => {
  const uri = getResourceURI(
    `${gamefilesPath}/assets`,
    characterId,
    `data/characters/${category}/${characterId}.json`
  );

  try {
    const response = await fetch(uri);
    return await response.json();
  } catch {
    throw new Error(`invalid character id or missing files for ${category}:${characterId}`);
  }
};

export const loadCharacterImage = async (
  characterId: string,
  src: string,
  gamefilesPath: string
): Promise<HTMLImageElement> => {
  const path = getResourceURI(
    `${gamefilesPath}/assets`,
    characterId,
    `media/face/${src}`
  );

  try {
    return await loadImage(path);
  } catch {
    throw new Error(`unable to load image: ${src}`);
  }
};
