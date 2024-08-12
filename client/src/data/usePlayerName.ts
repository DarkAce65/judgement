import Cookies from 'js-cookie';
import { useSyncExternalStore } from 'react';
import { PLAYER_NAME_COOKIE } from '../constants';

const listeners = new Set<() => void>();
function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}
function getSnapshot(): string | null {
  return Cookies.get(PLAYER_NAME_COOKIE) ?? null;
}

export function updatePlayerNameStore(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setPlayerName(playerName: string): void {
  Cookies.set(PLAYER_NAME_COOKIE, playerName);
  updatePlayerNameStore();
}

function usePlayerName(): [string | null, (playerName: string) => void] {
  return [useSyncExternalStore(subscribe, getSnapshot), setPlayerName];
}

export default usePlayerName;
