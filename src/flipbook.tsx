// Hooks
import { useState } from "react";
import { useCharactersList } from "./loader-hooks/use-characters-list";
import { useExpression } from "./loader-hooks/use-expression";
import { useExpressionsList } from "./loader-hooks/use-expressions-list";

// Components
import { CCExpression } from "./components/cc-expression";
import { SelectList } from "./components/select-list";
import { Config, Configuration } from "./components/configuration";
import { CharacterSelection } from "./components/character-selection";
import { GamefilesLoader } from "./types/expression-renderer";
import Alert from "react-bootstrap/Alert";

interface Props {
  loader: GamefilesLoader;
}

export const Flipbook = ({ loader }: Props) => {
  const characterList = useCharactersList();
  const [character, setCharacter] = useState("main.lea");
  const expressionsList = useExpressionsList(character, loader);
  const [expression, setExpression] = useExpression(expressionsList);

  const [config, setConfig] = useState<Config>({
    debugMode: false,
    double: true,
    loop: false,
    frameType: "default"
  });

  const [isAnimation, setIsAnimation] = useState(false);
  const [error, setError] = useState<Error>();

  return (
    <>
      <div className="column">
        <CharacterSelection
          characterList={characterList}
          value={character}
          onChange={setCharacter}
        />
      </div>

      <div className="column">
        <Configuration
          config={config}
          setConfig={setConfig}
          isAnimation={isAnimation}
        />
        <SelectList
          /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
          items={expressionsList || []}
          value={expression || ""}
          /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
          onChange={setExpression}
        />
      </div>
      <div className="canvas-column bg-light">
        {(character && expression && !error) ?
          (
            <CCExpression
              character={character}
              loader={loader}
              expression={expression}
              double={config.double}
              loop={config.loop}
              frameType={config.frameType}
              setIsAnimation={setIsAnimation}
              setError={setError}
            />
          ) :
          (
            error ? (
              <Alert variant="danger">Error: {JSON.stringify(error)}</Alert>
            ) : (
              <span>({expression === null ? "no face data for this character" : "no char/expression"})</span>
            )
          )}
      </div>
    </>
  );
};
