import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

import { EnsurePlayerRequest } from '../../generated_types/requests';
import { RoomResponse } from '../../generated_types/responses';
import { fetchAPI } from '../api/client';

import { getPlayerName } from './playerSlice';
import type { RootState } from './store';

interface RoomState {
  roomId: string | null;
}

const initialState: RoomState = {
  roomId: null,
};

const getRoomState = (state: RootState): RoomState => state.room;

export const getRoomId = createSelector([getRoomState], (state): string | null => state.roomId);

export const createRoom = createAsyncThunk<string, void, { state: RootState }>(
  'room/createRoom',
  async () => {
    const response = await fetchAPI('/rooms/create', { method: 'POST' });
    const { roomId }: RoomResponse = await response.json();

    return roomId;
  }
);

export const joinRoom = createAsyncThunk<string, string, { state: RootState }>(
  'room/joinRoom',
  async (roomId, { getState }) => {
    const playerName = getPlayerName(getState());

    const body: EnsurePlayerRequest = { playerName: playerName || undefined };
    await fetchAPI(`/rooms/${roomId}/join`, { method: 'POST', body: JSON.stringify(body) });

    return roomId;
  }
);

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createRoom.fulfilled, (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    });
    builder.addCase(joinRoom.fulfilled, (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    });
  },
});

export default roomSlice.reducer;
