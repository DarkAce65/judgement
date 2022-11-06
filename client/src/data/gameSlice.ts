import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { JudgementGameState, JudgementSpectatorGameState } from '../../generated_types/judgement';
import { GameStateMessage } from '../../generated_types/websocket';

import { loadRoomState } from './roomSlice';
import { RootState } from './store';

type GameState = JudgementGameState | JudgementSpectatorGameState | null;

const initialState = null as GameState;

export const getGame = (state: RootState): GameState => state.game;

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    loadGameState(_, { payload }: PayloadAction<GameStateMessage>) {
      return payload.state ?? null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadRoomState, (state, { payload }) => {
      return payload.game ?? null;
    });
  },
});

export const { loadGameState } = gameSlice.actions;

export default gameSlice.reducer;
