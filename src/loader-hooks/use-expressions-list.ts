import { useEffect, useState } from "react";
import { loadCharacter } from "../classes/repo-helpers";
import { GamefilesLoader } from "../types/expression-renderer";
import { useAbstractFaces } from "./use-abstract-faces";

export const useExpressionsList = (character: string|undefined|null, loader: GamefilesLoader): false|string[]|null => {
  const [expressionsList, setExpressionsList] = useState<string[]|false|null>([]);

  const abstractFaces = useAbstractFaces();

  useEffect(() => {
    if (!character || !abstractFaces) {
      return;
    }

    const [category, name] = character.split(".");

    if (!category || !name) {
      throw new Error(`invalid character name: ${character}`);
    }

    loadCharacter(loader, category, name)
      .then(characterData => {
        if (characterData.face === undefined) {
          setExpressionsList(null);
        } else if (typeof characterData.face === "string") {
          setExpressionsList(false);
        } else if (characterData.face.src) {
          setExpressionsList(
            Object.keys(characterData.face.expressions)
          );
        } else {
          setExpressionsList(
            Object.keys(characterData.face)
          );
        }
      }).catch(console.error);
  }, [character, abstractFaces, loader]);

  return expressionsList;
};
