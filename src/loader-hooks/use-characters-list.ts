import { useEffect, useState } from "react";
import { fetchJson } from "../helper";

export const useCharactersList = (): string[] => {
  const [charactersList, setCharactersList] = useState<string[]>([]);

  useEffect(() => {
    fetchJson("./index.json")
      .then((characters: string[]) => {
        setCharactersList(
          characters.map(c => c.slice(0, Math.max(0, c.length - 5)))
        );
      })
      .catch(error => {
        throw error;
      });
  }, []);

  return charactersList;
};
