import { useMemo, useState } from "react";
import FuzzySearch from "react-fuzzy";
import { SelectList } from "./select-list";

interface Props {
  characterList: string[];
  value: string;
  onChange: (character: string) => void;
}

export const CharacterSelection = ({ characterList, value, onChange }: Props) => {
  const categoryList = useMemo(() => {
    const categoriesWithDupes = characterList
      .map(c => c.split(".")[0]!)
      .sort((_, b) => b === "main" ? 1 : 0); // Sort main to front
    const uniqueCategories = new Set(categoriesWithDupes);
    return Array.from(uniqueCategories);
  }, [characterList]);

  const [category, setCategory] = useState<string>("main");

  const currentCharacterslist = category ? (
    characterList
      .filter(c => c.startsWith(category))
  ) : [];

  return (
    <>
      {characterList.length > 0 && (
        <FuzzySearch
          width="100%"
          list={characterList.map(c => ({
            id: c,
            title: c,
            category: c.split(".")[0],
            name: c.split(".")[1]
          }))}
          keys={["category", "name"]}
          maxResults={5}
          placeholder="Search character"
          onSelect={(object: { id: string }) => {
            onChange(object.id);
          }}
        />
      )}
      <div className="d-flex overflow-hidden">
        <SelectList
          items={categoryList}
          value={category}
          onChange={setCategory}
        />
        <SelectList
          items={currentCharacterslist}
          value={value}
          labelTransform={(c => c.split(".")[1]!)}
          onChange={onChange}
        />
      </div>
    </>
  );
};
