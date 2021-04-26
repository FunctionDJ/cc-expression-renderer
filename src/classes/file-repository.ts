import { Individual } from "./individual";
import { AbstractFaces } from "../loader-hooks/use-abstract-faces";
import { loadCharacter, loadCharacterImage } from "./repo-helpers";
import { Character, Face } from "../types/crosscode";
import { GamefilesLoader, ImageMap } from "../types/expression-renderer";
import { FrameConfig } from "./illustrator";
import { Dispatch } from "react";

import { AnimationState } from "../use-expression-renderer";

export class FileRepository {
  private readonly allImages = new Map<string, HTMLImageElement>();
  private readonly json = new Map<string, Character>();

  constructor(
    private readonly loader: GamefilesLoader,
    private readonly abstractFaces?: AbstractFaces
  ) {}

  public getAbstractFaceObject(face: string): Face {
    if (!this.abstractFaces) {
      throw new Error("not ready yet!");
    }

    const faceObject = this.abstractFaces[face];

    if (!faceObject) {
      throw new Error(`could not find abstract face: ${face}`);
    }

    return faceObject;
  }

  public async getIndividual(
    id: string,
    expression: string,
    canvas: HTMLCanvasElement,
    frameConfig: FrameConfig,
    setIsAnimation: Dispatch<boolean>,
    setAnimationState: Dispatch<React.SetStateAction<AnimationState | undefined>>
  ): Promise<Individual|null> {
    let data = this.json.get(id);

    const [category, characterName] = id.split(".");

    if (!category || !characterName) {
      throw new Error(`invalid id format for ${id}`);
    }

    if (!data) {
      data = await loadCharacter(this.loader, category, characterName);
      this.json.set(id, data);
    }

    let faceObject: Face;

    if (data.face === undefined) {
      return null;
    }

    if (typeof data.face === "string") {
      faceObject = this.getAbstractFaceObject(data.face);
    } else if (data.face.src) {
      faceObject = data.face as Face;
    } else {
      throw new Error(`can't handle this yet: ${id}, ${expression}`);
    }

    const characterImages = await this.getImages(faceObject, characterName);

    return new Individual(
      faceObject,
      canvas,
      expression,
      characterImages,
      frameConfig,
      setIsAnimation,
      setAnimationState
    );
  }

  private async getImages(faceObject: Face, characterName: string): Promise<ImageMap> {
    const srcMap = [
      { name: "", src: faceObject.src }
    ];

    if (faceObject.subImages) {
      for (const [name, src] of Object.entries(faceObject.subImages)) {
        srcMap.push({ name, src });
      }
    }

    const promises = srcMap.map(async ({ name, src }) => (
      {
        name,
        src: await this.getImage(characterName, src)
      }
    ));

    return Promise.all(promises);
  }

  private async getImage(characterName: string, src: string): Promise<HTMLImageElement> {
    let image = this.allImages.get(src);

    if (!image) {
      image = await loadCharacterImage(this.loader, characterName, src);
      this.allImages.set(src, image);
    }

    return image;
  }
}
