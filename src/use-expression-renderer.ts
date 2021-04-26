import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { FileRepository } from "./classes/file-repository";
import { useAbstractFaces } from "./loader-hooks/use-abstract-faces";
import { Config } from "./components/configuration";
import { GamefilesLoader } from "./types/expression-renderer";

export interface AnimationState {
  anim: number[];
  position: number;
}

interface ReturnType {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  animationState: AnimationState|undefined;
}

export const useExpressionRenderer = (
  loader: GamefilesLoader,
  characterName: string|undefined,
  expression: string|undefined|false,
  config: Config,
  setIsAnimation: Dispatch<boolean>,
  setError: Dispatch<Error|undefined>
): ReturnType => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log("using");

  // const [animationState, setAnimationState] = useState<AnimationState>();

  const abstractFaces = useAbstractFaces();

  const repo = useMemo(() => new FileRepository(loader, abstractFaces), [abstractFaces, loader]);

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
        config,
        setIsAnimation,
        () => ({})
      );

      if (!individual) {
        return;
      }

      individual.render();

      return individual;
    }

    const indiPromise = main();

    return () => {
      indiPromise
        .then(indi => indi?.clean())
        .catch(setError);
    };
  }, [canvasRef, characterName, expression, abstractFaces, repo, config, setError, setIsAnimation]);

  return {
    canvasRef,
    animationState: undefined
  };
};
