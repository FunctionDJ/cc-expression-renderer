import {useEffect, useState} from 'react';
import {fetchJson} from '../helper';
import {Face} from '../types/crosscode';

export type AbstractFaces = Record<string, Face>;

export const useAbstractFaces = (): AbstractFaces|undefined => {
  const [abstractFaces, setAbstractFaces] = useState<AbstractFaces>();

  useEffect(() => {
    fetchJson('./abstract_faces.json')
      .then((object: {abstractFaces: AbstractFaces}) => {
        setAbstractFaces(object.abstractFaces);
      })
      .catch(error => {
        throw error;
      });
  }, []);

  return abstractFaces;
};
