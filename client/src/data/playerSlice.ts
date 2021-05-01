import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { EnsurePlayerRequest } from '../../generated_types/requests';
import { fetchAPI } from '../api/client';

import type { RootState } from './store';

interface PlayerState {
  playerName: string | null;
}

const initialState: PlayerState = {
  playerName: localStorage.getItem('playerName'),
};

export const setPlayerName = createAsyncThunk<string | null, string | null, { state: RootState }>(
  'player/setPlayerName',
  async (playerName) => {
    const body: EnsurePlayerRequest = { playerName: playerName || undefined };
    await fetchAPI('/player', { method: 'PUT', body: JSON.stringify(body) });

    return playerName;
  }
);

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      setPlayerName.fulfilled,
      (state, { payload: playerName }: PayloadAction<string | null>) => {
        if (playerName) {
          localStorage.setItem('playerName', playerName);
        } else {
          localStorage.removeItem('playerName');
        }

        state.playerName = playerName;
      }
    );
  },
});

export const getPlayerName = (state: RootState): string | null => state.player.playerName;

export default playerSlice.reducer;
