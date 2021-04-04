import characterData from "./manlea.json";
import { MasterWrapper, CanvasWrapper } from "./draw-part";
import { CharacterDataWrapper, loadImage } from "./helper";

console.clear();

const app = document.getElementById("app")!;

const debugInput = document.querySelector<HTMLInputElement>("#debug")!;
const loopInput = document.querySelector<HTMLInputElement>("#loop")!;
const faceOnlyInput = document.querySelector<HTMLInputElement>("#face-only")!;
const expandFrameInput = document.querySelector<HTMLInputElement>("#expand-frame")!;
const posOutput = document.getElementById("pos")!;

async function main() {
  const characterDataWrapper = new CharacterDataWrapper(characterData as CharacterData);

  const img = await loadImage(`./${characterDataWrapper.getSrc()}`);

  console.log("hi");

  const canvasWrapper = new CanvasWrapper(
    img,
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

  const expression = characterDataWrapper.getExpression("NOD");

  if (!expression) {
    throw new Error("expression not found");
  }

  const masterWrapper = new MasterWrapper(
    canvasWrapper,
    characterDataWrapper,
    expression,
    {
      debug: debugInput.checked,
      expandFrame: expandFrameInput.checked,
      faceOnly: faceOnlyInput.checked
    }
  );

  function updateConfig() {
    masterWrapper.updateConfig({
      debug: debugInput.checked,
      expandFrame: expandFrameInput.checked,
      faceOnly: faceOnlyInput.checked
    })
  }

  masterWrapper.playLoop();

  debugInput.addEventListener("change", () => {
    updateConfig();
    canvasWrapper.canvas.style.border = debugInput.checked ? "2px dashed green" : "";
  });

  loopInput.addEventListener("change", () => {
    if (loopInput.checked) {
      canvasWrapper.bindMasterWrapper(masterWrapper);
    } else {
      canvasWrapper.unbindMasterWrapper();
    }
  })

  faceOnlyInput.addEventListener("change", updateConfig);
  expandFrameInput.addEventListener("change", updateConfig);
}

debugger;
main();