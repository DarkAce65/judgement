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
    optimisticallyReorderCards(
      state,
      { payload: { fromIndex, toIndex } }: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      if (fromIndex === toIndex || state === null || state.playerType === 'SPECTATOR') {
        return;
      }

      const movedCard = state.playerState.hand.splice(fromIndex, 1)[0];
      state.playerState.hand.splice(toIndex, 0, movedCard);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadRoomState, (_, { payload }) => {
      return payload.game ?? null;
    });
  },
});

export const { loadGameState, optimisticallyReorderCards } = gameSlice.actions;

export default gameSlice.reducer;
