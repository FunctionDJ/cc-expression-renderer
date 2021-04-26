import { loadImage } from "../helper";
import { GamefilesLoader } from "../types/expression-renderer";

export class WebLoader implements GamefilesLoader {
  constructor(
    private readonly gamefilesRoot: string
  ) {}

  async getJson(filePath: string) {
    const uri = `${this.gamefilesRoot}/${filePath}`;

    try {
      const response = await fetch(uri);

      try {
        return await response.json();
      } catch {
        throw new Error(`Could not parse JSON for ${filePath}`);
      }
    } catch {
      throw new Error(`Could not load ${filePath}`);
    }
  }

  async getImage(filePath: string) {
    const uri = `${this.gamefilesRoot}/${filePath}`;

    try {
      return await loadImage(uri);
    } catch {
      throw new Error(`Unable to load image ${filePath}`);
    }
  }
}
