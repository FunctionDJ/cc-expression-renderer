import {createEmptyDimensions} from './helper';
import {Dimensions, PreparedDataInput, StatelessPart} from './types/expression-renderer';

interface GetStatelessPartsDataResult {
  statelessPartsData: StatelessPart[];
  span: Dimensions;
}

const widenDimensions = (
  targetDimensions: Dimensions,
  wideningDimensions: Dimensions
): void => {
  targetDimensions.minX = Math.min(targetDimensions.minX, wideningDimensions.minX);
  targetDimensions.maxX = Math.max(targetDimensions.maxX, wideningDimensions.maxX);
  targetDimensions.minY = Math.min(targetDimensions.minY, wideningDimensions.minY);
  targetDimensions.maxY = Math.max(targetDimensions.maxY, wideningDimensions.maxY);
};

export const getStatelessPartsData = (
  inputs: PreparedDataInput[],
  faceOnly: boolean
): GetStatelessPartsDataResult => {
  const statelessPartsData: StatelessPart[] = [];

  const span = createEmptyDimensions();

  let previousX = 0;
  let previousY = 0;

  inputs = faceOnly ? inputs.slice(-1) : inputs;

  for (const {name, type, data} of inputs) {
    const actualDestX = data.destX + previousX;
    const actualDestY = data.destY + previousY;

    previousX += data.subX === undefined ? 0 : data.subX;
    previousY += data.subY === undefined ? 0 : data.subY;

    const partDimensions: Dimensions = {
      minX: actualDestX,
      maxX: actualDestX + data.width,
      minY: actualDestY,
      maxY: actualDestY + data.height
    };

    widenDimensions(span, partDimensions);

    statelessPartsData.push({
      name,
      type,
      source: [data.srcX, data.srcY],
      size: [data.width, data.height],
      dest: [actualDestX, actualDestY],
      img: data.img ?? ''
    });
  }

  return {
    statelessPartsData,
    span
  };
};
