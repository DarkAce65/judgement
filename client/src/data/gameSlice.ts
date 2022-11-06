import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import { JudgementGameState, JudgementSpectatorGameState } from '../../generated_types/judgement';
import { GameStateMessage } from '../../generated_types/websocket';

import { loadRoomState } from './roomSlice';
import { RootState } from './store';

interface GameState {
  state: JudgementGameState | JudgementSpectatorGameState | null;
}

const initialState: GameState = { state: null };

const getGameState = (state: RootState): GameState => state.game;

export const getGame = createSelector([getGameState], (state) => state.state);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    loadGameState(state, { payload }: PayloadAction<GameStateMessage>) {
      state.state = payload.state ?? null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadRoomState, (state, { payload }) => {
      state.state = payload.game ?? null;
    });
  },
});

export const { loadGameState } = gameSlice.actions;

export default gameSlice.reducer;
