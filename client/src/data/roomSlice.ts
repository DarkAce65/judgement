import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';

import { RoomIdResponse } from '../../generated_types/responses';
import { RoomMessage } from '../../generated_types/websocket';
import { fetchAPI } from '../api/client';

import { getPlayerNames } from './playerSlice';
import { RootState } from './store';

interface RoomState {
  roomId: string | null;
  roomStatus: RoomMessage['status'];
  orderedPlayerIds: number[];
  gameName: RoomMessage['gameName'];
}

const initialState: RoomState = {
  roomId: null,
  roomStatus: 'LOBBY',
  orderedPlayerIds: [],
  gameName: undefined,
};

const getRoomState = (state: RootState): RoomState => state.room;

export const getRoomId = createSelector([getRoomState], (state) => state.roomId);
export const getRoomStatus = createSelector([getRoomState], (state) => state.roomStatus);
export const getOrderedPlayerNames = createSelector(
  [getRoomState, getPlayerNames],
  (state, playerNames): (string | null)[] =>
    state.orderedPlayerIds.map((playerId) => playerNames[playerId] || null)
);
export const getGameName = createSelector([getRoomState], (state) => state.gameName);

export const createRoom = createAsyncThunk<string, void, { state: RootState }>(
  'room/createRoom',
  async () => {
    const response = await fetchAPI('/rooms/create', { method: 'POST' });
    const { roomId }: RoomIdResponse = await response.json();

    return roomId;
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    loadRoomState(state, { payload }: PayloadAction<RoomMessage>) {
      state.roomId = payload.roomId;
      state.roomStatus = payload.status;
      state.orderedPlayerIds = payload.orderedPlayerIds;
      state.gameName = payload.gameName;
    },
    resetRoomState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createRoom.fulfilled, (state, { payload }) => {
      state.roomId = payload;
    });
    builder.addMatcher(isAnyOf(createRoom.pending), () => initialState);
  },
});

export const { loadRoomState, resetRoomState } = roomSlice.actions;

export default roomSlice.reducer;
