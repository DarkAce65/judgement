import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';

import { EnsurePlayerRequest } from '../../generated_types/requests';
import { RoomIdResponse } from '../../generated_types/responses';
import { PlayersMessage, RoomMessage } from '../../generated_types/websocket';
import { fetchAPI, makeJSONBodyWithContentType } from '../api/client';

import { getPlayerName } from './playerSlice';
import type { RootState } from './store';

interface RoomState {
  roomId: string | null;
  roomStatus: RoomMessage['status'];
  players: string[];
  gameName: RoomMessage['gameName'];
}

const initialState: RoomState = {
  roomId: null,
  roomStatus: 'LOBBY',
  players: [],
  gameName: undefined,
};

const getRoomState = (state: RootState): RoomState => state.room;

export const getRoomId = createSelector([getRoomState], (state) => state.roomId);
export const getPlayers = createSelector([getRoomState], (state) => state.players);
export const getGameName = createSelector([getRoomState], (state) => state.gameName);

export const createRoom = createAsyncThunk<string, void, { state: RootState }>(
  'room/createRoom',
  async () => {
    const response = await fetchAPI('/rooms/create', { method: 'POST' });
    const { roomId }: RoomIdResponse = await response.json();

    return roomId;
  }
);

export const joinRoom = createAsyncThunk<string, string, { state: RootState }>(
  'room/joinRoom',
  async (roomId, { getState }) => {
    const playerName = getPlayerName(getState());

    const body: EnsurePlayerRequest = { playerName: playerName || undefined };
    await fetchAPI(`/rooms/${roomId}/join`, {
      method: 'POST',
      ...makeJSONBodyWithContentType(body),
    });

    return roomId;
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    loadRoomState(state, { payload }: PayloadAction<RoomMessage>) {
      state.roomStatus = payload.status;
      state.players = payload.players;
      state.gameName = payload.gameName;
    },
    loadPlayers(state, { payload }: PayloadAction<PlayersMessage>) {
      state.players = payload.players;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createRoom.fulfilled, (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    });
    builder.addCase(joinRoom.fulfilled, (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    });
    builder.addMatcher(isAnyOf(createRoom.pending, joinRoom.pending), () => initialState);
  },
});

export const { loadRoomState, loadPlayers } = roomSlice.actions;

export default roomSlice.reducer;
