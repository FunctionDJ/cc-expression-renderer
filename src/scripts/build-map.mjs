import {promises as fs} from "fs";
import path from "path";

async function main() {
  const mainAssetRoot = "public/gamefiles/assets";

  const readFolders = async dir => {
    const children = await fs.readdir(dir, {withFileTypes: true})
      .catch(() => {});

    if (!children) {
      return [];
    }

    return children
      .filter(c => c.isDirectory())
      .map(c => ({name: c.name, joined: path.join(dir, c.name)}));
  };

  const extensionFolders = await readFolders(path.join(mainAssetRoot, "extension"));

  const assetRoots = [
    {name: "assets", joined: mainAssetRoot},
    ...extensionFolders
  ];

  const allThings = await Promise.all(
    assetRoots.map(async r => (
      readFolders(path.join(r.joined, "data/characters"))
    ))
  );

  const allCharDataFolders = allThings
    .flat()
    .filter(entry => entry.name !== "objects");

  const allCharDataThings = await Promise.all(
    allCharDataFolders.map(async p => (
      fs.readdir(p.joined)
        .then(r =>
          r
            .filter(name => name.endsWith(".json"))
            .map(name => `${p.name}.${name}`)
        )
    ))
  );

  const allCharData = allCharDataThings.flat();

  const prettyJSON = JSON.stringify(allCharData, null, 2);

  await fs.writeFile("./public/index.json", prettyJSON);
  console.log(`Written ${allCharData.length} entries to ./public/index.json`);
}

main();
