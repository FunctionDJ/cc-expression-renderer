import { Dispatch } from "react";
import { FrameType, GamefilesLoader } from "../types/expression-renderer";
import { useExpressionRenderer } from "../use-expression-renderer";

interface Props {
  character: string;
  expression: string;
  loop: boolean;
  double: boolean;
  frameType: FrameType;
  setIsAnimation: Dispatch<boolean>;
  loader: GamefilesLoader;
  setError: Dispatch<Error|undefined>;
}

export const CCExpression = ({
  character, expression, double,
  loop, frameType, setIsAnimation,
  loader, setError
}: Props): React.ReactElement => {
  const { canvasRef, animationState } = useExpressionRenderer(
    loader,
    character,
    expression,
    { debugMode: false, frameType, loop, double: false },
    setIsAnimation,
    setError
  );

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          transform: `scale(${double ? 2 : 1})`,
          border: `${double ? 1 : 2}px dashed hsl(0, 0%, 0%, 0.2)`
        }}
      />
      {/* {true && animationState && (
        <div>
          {animationState.anim.map((slot, i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              type="button"
              className={i === animationState.position ? "active" : ""}
            >
              {slot}
            </button>
          ))}
        </div>
      )} */}
    </div>
  );
};
