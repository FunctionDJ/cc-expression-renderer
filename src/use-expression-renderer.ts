import { useEffect, useMemo, useRef, useState } from "react";
import { Individual } from "./classes/individual";
import { FileRepository } from "./classes/file-repository";
import { FrameConfig } from "./classes/illustrator";
import { useAbstractFaces } from "./loader-hooks/use-abstract-faces";

export const useExpressionRenderer = (
  characterName: string|undefined,
  expression: string|undefined|false,
  frameConfig: FrameConfig
): React.RefObject<HTMLCanvasElement> => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const abstractFaces = useAbstractFaces();

  const repo = useMemo(() => new FileRepository("/gamefiles", abstractFaces), [abstractFaces]);

  const [characterState, setCharacterState] = useState<Individual>();

  useEffect(() => {
    characterState?.clean();
    characterState?.render();
  }, [characterName, expression, characterState]);

  useEffect(() => {
    async function main() {
      if (!canvasRef.current) {
        throw new Error("no canvas");
      }

      if (!characterName || expression === undefined || !abstractFaces) {
        return;
      }

      const individual = await repo.getIndividual(
        characterName,
        expression || "DEFAULT",
        canvasRef.current,
        frameConfig
      );

      if (!individual) {
        return;
      }

      setCharacterState(individual);

      individual.render();

      // Const canvasWrapper = new Illustrator(
      //   imgMap,
      //   characterData.face.width,
      //   characterData.face.height,
      //   canvasRef.current
      // );

      // const expression = characterWrapper.getExpression("NOD");

      // if (!expression) {
      //   throw new Error("expression not found");
      // }

      // const animationWrapper = new Animator(canvasWrapper, characterWrapper, expression, {
      //   debug: false,
      //   frameType: "expand"
      // });

      // animationWrapper.playOnce();
    }

    main().catch(() => null);
  }, [canvasRef, characterName, expression, abstractFaces, repo]);

  return canvasRef;
};
