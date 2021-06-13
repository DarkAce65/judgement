import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import { EnsurePlayerRequest } from '../../generated_types/requests';
import { FetchStatus } from '../api/FetchStatus';
import { fetchAPI, makeJSONBodyWithContentType } from '../api/client';

import type { RootState } from './store';

interface PlayerState {
  ensurePlayerStatus: FetchStatus;
  playerName: string | null;
}

const initialState: PlayerState = {
  ensurePlayerStatus: 'uninitialized',
  playerName: localStorage.getItem('playerName'),
};

const getPlayerState = (state: RootState): PlayerState => state.player;

export const getEnsurePlayerFetchStatus = createSelector(
  [getPlayerState],
  (state): FetchStatus => state.ensurePlayerStatus
);

export const getPlayerName = createSelector(
  [getPlayerState],
  (state): string | null => state.playerName
);

export const ensurePlayer = createAsyncThunk<string, string, { state: RootState }>(
  'player/ensurePlayer',
  async (playerName) => {
    const body: EnsurePlayerRequest = { playerName: playerName || undefined };
    await fetchAPI('/player', { method: 'PUT', ...makeJSONBodyWithContentType(body) });

    return playerName;
  },
  { condition: (_, { getState }) => getEnsurePlayerFetchStatus(getState()) !== 'pending' }
);

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(ensurePlayer.pending, (state) => {
        state.ensurePlayerStatus = 'pending';
      })
      .addCase(
        ensurePlayer.fulfilled,
        (state, { payload: playerName }: PayloadAction<string | null>) => {
          if (playerName) {
            localStorage.setItem('playerName', playerName);
          } else {
            localStorage.removeItem('playerName');
          }

          state.playerName = playerName;
          state.ensurePlayerStatus = 'succeeded';
        }
      )
      .addCase(ensurePlayer.rejected, (state) => {
        state.ensurePlayerStatus = 'failed';
      });
  },
});

export default playerSlice.reducer;
