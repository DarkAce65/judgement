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

export const setPlayerName = createAsyncThunk<string, string, { state: RootState }>(
  'player/setPlayerName',
  async (playerName) => {
    const body: EnsurePlayerRequest = { playerName };
    await fetchAPI('/player', { method: 'PUT', body: JSON.stringify(body) });
    localStorage.setItem('playerName', playerName);

    return playerName;
  }
);

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setPlayerName.fulfilled, (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
    });
  },
});

export const getPlayerName = (state: RootState): string | null => state.player.playerName;

export default playerSlice.reducer;
