import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchAPI } from '../api/client';

import type { RootState } from './store';

interface PlayerState {
  playerName: string | null;
}

const initialState: PlayerState = {
  playerName: localStorage.getItem('playerName'),
};

export const setPlayerName = createAsyncThunk(
  'player/setPlayerName',
  async (playerName: string) => {
    await fetchAPI('/ensure-player', { method: 'POST', body: JSON.stringify({ playerName }) });
    localStorage.setItem('playerName', playerName);

    return playerName;
  }
);

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {},
  extraReducers: {
    [setPlayerName.fulfilled.type]: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
    },
  },
});

export const getPlayerName = (state: RootState): string | null => state.player.playerName;

export default playerSlice.reducer;
