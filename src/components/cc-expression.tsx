import { FrameType } from "../types/expression-renderer";
import { useExpressionRenderer } from "../use-expression-renderer";

interface Props {
  character: string;
  expression: string;
  loop: boolean;
  double: boolean;
  frameType: FrameType;
}

export const CCExpression = ({
  character, expression, double, loop, frameType
}: Props): React.ReactElement => {
  const canvasRef = useExpressionRenderer(character, expression, loop, frameType);

  return (
    <canvas
      ref={canvasRef}
      style={{
        transform: `scale(${double ? 200 : 100}%)`,
        border: `${double ? 1 : 2}px dashed hsl(0, 0%, 0%, 0.2)`
      }}
    />
  );
};
