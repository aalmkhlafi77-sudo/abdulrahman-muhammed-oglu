import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialAttributes, initialLanguages, initialPlayerInfo } from '../data/initialData';
import type { PersonalAttribute, PlayerInfo, PlayerLanguage } from '../types/player';

interface PlayerInfoContextValue {
  player: PlayerInfo;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerInfo>>;
  languages: PlayerLanguage[];
  attributes: PersonalAttribute[];
}

const PlayerInfoContext = createContext<PlayerInfoContextValue | null>(null);

export const PlayerInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerInfo>(initialPlayerInfo);
  const [languages, setLanguages] = useState<PlayerLanguage[]>(initialLanguages);
  const [attributes, setAttributes] = useState<PersonalAttribute[]>(initialAttributes);

  useEffect(() => {
    fetch('/api/player')
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as PlayerInfo;
      })
      .then((value) => {
        if (value) {
          setPlayer(value);
          if (Array.isArray(value.languages)) setLanguages(value.languages);
          if (Array.isArray(value.attributes)) setAttributes(value.attributes);
        }
      })
      .catch((error) => console.warn('Could not load player profile from server:', error));
  }, []);

  return <PlayerInfoContext.Provider value={{ player, setPlayer, languages, attributes }}>{children}</PlayerInfoContext.Provider>;
};

export const usePlayerInfo = (): PlayerInfoContextValue => {
  const value = useContext(PlayerInfoContext);
  if (!value) throw new Error('usePlayerInfo must be used within PlayerInfoProvider');
  return value;
};
