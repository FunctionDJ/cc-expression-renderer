import { useEffect, useState } from "react";
import { StateWrapperReturn } from "./state-wrapper-return";

export const useExpression = (
  expressionsList: string[]|false|null
): StateWrapperReturn<string|false|null|undefined> => {
  const [expression, setExpression] = useState<string|false|null|undefined>(undefined);

  useEffect(() => {
    if (expressionsList === false) {
      setExpression(false);
      return;
    }

    if (expressionsList === null) {
      setExpression(null);
      return;
    }

    if (expressionsList.length === 0) {
      setExpression(undefined);
    } else {
      if (expressionsList.includes("SHAKE")) {
        setExpression("SHAKE");
        return;
      }

      setExpression(expressionsList[0]);
    }
  }, [expressionsList]);

  return [expression, setExpression];
};
