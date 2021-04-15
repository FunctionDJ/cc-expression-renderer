export const getContextSafe = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get 2D context of canvas');
  }

  return context;
};
