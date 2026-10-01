import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialPlayerInfo } from '../data/initialData';
import type { PlayerInfo } from '../types/player';

interface PlayerInfoContextValue {
  player: PlayerInfo;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerInfo>>;
}

const PlayerInfoContext = createContext<PlayerInfoContextValue | null>(null);

export const PlayerInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerInfo>(initialPlayerInfo);

  useEffect(() => {
    fetch('/api/player')
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as PlayerInfo;
      })
      .then((value) => {
        if (value) setPlayer(value);
      })
      .catch((error) => console.warn('Could not load player profile from server:', error));
  }, []);

  return <PlayerInfoContext.Provider value={{ player, setPlayer }}>{children}</PlayerInfoContext.Provider>;
};

export const usePlayerInfo = (): PlayerInfoContextValue => {
  const value = useContext(PlayerInfoContext);
  if (!value) throw new Error('usePlayerInfo must be used within PlayerInfoProvider');
  return value;
};
