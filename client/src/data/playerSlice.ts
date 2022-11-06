import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

import { EnsurePlayerRequest } from '../../generated_types/requests';
import { PlayersMessage } from '../../generated_types/websocket';
import { FetchStatus } from '../api/FetchStatus';
import { fetchAPI, makeJSONBodyWithContentType } from '../api/client';
import { PLAYER_ID_COOKIE } from '../constants';

import { RootState } from './store';

interface PlayerState {
  ensurePlayerStatus: FetchStatus;
  playerId: string | null;
  playerName: string | null;

  playerNames: { [playerId: string]: string };
}

const initialState: PlayerState = {
  ensurePlayerStatus: 'uninitialized',
  playerId: Cookies.get(PLAYER_ID_COOKIE) ?? null,
  playerName: localStorage.getItem('playerName'),

  playerNames: {},
};

const getPlayerState = (state: RootState): PlayerState => state.player;

export const getEnsurePlayerFetchStatus = createSelector(
  [getPlayerState],
  (state) => state.ensurePlayerStatus
);

export const getPlayerId = createSelector(
  [getPlayerState],
  (state): string | null => state.playerId ?? Cookies.get(PLAYER_ID_COOKIE) ?? null
);

export const getPlayerName = createSelector([getPlayerState], (state) => state.playerName);

export const getPlayerNames = createSelector([getPlayerState], (state) => state.playerNames);

export const ensurePlayer = createAsyncThunk<string, string, { state: RootState }>(
  'player/ensurePlayer',
  async (playerName) => {
    const body: EnsurePlayerRequest = { playerName: playerName || undefined };
    await fetchAPI('/player', { method: 'PUT', ...makeJSONBodyWithContentType(body) });

    return playerName;
  },
  { condition: (_, { getState }) => getEnsurePlayerFetchStatus(getState()) !== 'pending' }
);

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    loadPlayers(state, { payload }: PayloadAction<PlayersMessage>) {
      state.playerNames = { ...state.playerNames, ...payload.playerNames };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(ensurePlayer.pending, (state) => {
      state.ensurePlayerStatus = 'pending';
    });
    builder.addCase(
      ensurePlayer.fulfilled,
      (state, { payload: playerName }: PayloadAction<string | null>) => {
        if (playerName) {
          localStorage.setItem('playerName', playerName);
        } else {
          localStorage.removeItem('playerName');
        }

        state.playerId = Cookies.get(PLAYER_ID_COOKIE) ?? null;
        state.playerName = playerName;
        state.ensurePlayerStatus = 'succeeded';
      }
    );
    builder.addCase(ensurePlayer.rejected, (state) => {
      state.ensurePlayerStatus = 'failed';
    });
  },
});

export const { loadPlayers } = playerSlice.actions;

export default playerSlice.reducer;
