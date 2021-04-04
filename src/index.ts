import characterData from "./manlea.json";
import { AnimationWrapper, CanvasWrapper } from "./draw-part";
import { CharacterDataWrapper, FrameType } from "./helper";
import { ListenerWrapper } from "./listener-wrapper";

console.clear();

const app = document.getElementById("app")!;

const debugInput = document.querySelector<HTMLInputElement>("#debug")!;
const loopInput = document.querySelector<HTMLInputElement>("#loop")!;
const posOutput = document.getElementById("pos")!;

const frameTypeInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>(".frame-type")!
);

async function main() {
  const characterDataWrapper = new CharacterDataWrapper(characterData);

  const srcMap = await characterDataWrapper.loadSrcMap();

  const canvasWrapper = new CanvasWrapper(
    srcMap,
    characterData.face.width,
    characterData.face.height
  );

  canvasWrapper.canvas.addEventListener("mousemove", (e) => {
    const rect = canvasWrapper.canvas.getBoundingClientRect();

    const x = e.clientX - Math.floor(rect.left);
    const y = e.clientY - Math.floor(rect.top);

    posOutput.innerText = String(
      `x: ${x}, y: ${y}`
    );
  })

  app.appendChild(canvasWrapper.canvas);

  const expression = characterDataWrapper.getExpression("PANIC");

  if (!expression) {
    throw new Error("expression not found");
  }

  const frameType = frameTypeInputs.find(i => i.checked)!.value as FrameType

  const animationWrapper = new AnimationWrapper(
    canvasWrapper,
    characterDataWrapper,
    expression,
    {
      debug: debugInput.checked,
      frameType
    }
  );

  function updateConfig() {
    animationWrapper.updateConfig({
      debug: debugInput.checked,
      frameType: frameTypeInputs.find(i => i.checked)!.value as FrameType
    })
  }

  debugInput.addEventListener("change", () => {
    updateConfig();
    canvasWrapper.canvas.style.border = debugInput.checked ? "2px dashed green" : "";
  });

  const listenerWrapper = new ListenerWrapper(
    canvasWrapper.canvas,
    animationWrapper
  );

  listenerWrapper.bind();

  loopInput.addEventListener("change", () => {
    if (loopInput.checked) {
      listenerWrapper.unbind();
      animationWrapper.playLoop();
    } else {
      animationWrapper.stopLoop();
      listenerWrapper.bind();
    }
  });

  frameTypeInputs.forEach(i => i.addEventListener("change", updateConfig));
}

main();