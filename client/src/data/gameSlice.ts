import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import { JudgementGameState, JudgementSpectatorGameState } from '../../generated_types/judgement';
import { CreateGameRequest } from '../../generated_types/api';
import { GameIdResponse } from '../../generated_types/api';
import { ConcreteGameState, GameStateMessage } from '../../generated_types/websocket';
import { fetchAPI } from '../api/client';

import { RootState } from './store';
import { GameName } from '../../generated_types/api';

type GameState = ConcreteGameState | null;

const initialState = null as GameState;

export const getGame = (state: RootState): GameState => state.game;

export const createGame = createAsyncThunk<string, { gameName: GameName }, { state: RootState }>(
  'game/createGame',
  async ({ gameName }) => {
    const data: CreateGameRequest = { gameName };
    const response = await fetchAPI('/games/create', { method: 'POST', data });
    const { gameId }: GameIdResponse = await response.json();

    return gameId;
  },
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    loadGameState(_, { payload }: PayloadAction<GameStateMessage>) {
      return payload.state ?? null;
    },
    optimisticallyReorderCards(
      state,
      { payload: { fromIndex, toIndex } }: PayloadAction<{ fromIndex: number; toIndex: number }>,
    ) {
      if (fromIndex === toIndex || state === null || state.playerType === 'SPECTATOR') {
        return;
      }

      const movedCard = state.playerState.hand.splice(fromIndex, 1)[0];
      state.playerState.hand.splice(toIndex, 0, movedCard);
    },
    resetGameState() {
      return null;
    },
  },
});

export const { loadGameState, optimisticallyReorderCards, resetGameState } = gameSlice.actions;

export default gameSlice.reducer;
