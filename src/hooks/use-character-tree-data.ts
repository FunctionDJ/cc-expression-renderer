import {DataNode} from 'rc-tree/lib/interface';
import {useMemo} from 'react';

function reduceCharListToDataNodes(
  previous: DataNode[],
  cur: string
): DataNode[] {
  const [category, name] = cur.split('.');

  let parentNode = previous.find(n => n.key === category);

  if (!parentNode) {
    parentNode = {
      key: category,
      title: category,
      children: []
    };

    previous.push(parentNode);
  }

  const entry: DataNode = {key: cur, title: name};
  parentNode.children!.push(entry);

  return previous;
}

function sortMainToFront(_a: DataNode, b: DataNode) {
  return b.key === 'main' ? 1 : 0;
}

export const useCharacterTreeData = (charactersList: string[]): DataNode[] => {
  const nodeFactory = () => (
    charactersList
      .reduce<DataNode[]>((previous, cur) => reduceCharListToDataNodes(previous, cur), [])
      .sort(sortMainToFront)
  );

  return useMemo(nodeFactory, [charactersList]);
};
