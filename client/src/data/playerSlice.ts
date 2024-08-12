import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

import { PlayerNameModel } from '../../generated_types/api';
import { PlayersMessage } from '../../generated_types/websocket';
import { FetchStatus } from '../api/FetchStatus';
import { fetchAPI } from '../api/client';
import { PLAYER_AUTH_ID_COOKIE, PLAYER_NAME_COOKIE } from '../constants';

import { RootState } from './store';

interface PlayerState {
  playerNames: { [playerId: string]: string };
}

const initialState: PlayerState = {
  playerNames: {},
};

const getPlayerState = (state: RootState): PlayerState => state.player;

export const getPlayerNames = createSelector([getPlayerState], (state) => state.playerNames);

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    loadPlayers(state, { payload }: PayloadAction<PlayersMessage>) {
      state.playerNames = { ...state.playerNames, ...payload.playerNames };
    },
  },
});

export const { loadPlayers } = playerSlice.actions;

export default playerSlice.reducer;
