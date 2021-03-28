import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchAPI } from '../api/client';

import { getPlayerName } from './playerSlice';
import type { RootState } from './store';

interface RoomState {
  roomId: string | null;
}

const initialState: RoomState = {
  roomId: null,
};

export const createRoom = createAsyncThunk<string, void, { state: RootState }>(
  'room/createRoom',
  async (_, { getState }) => {
    const playerName = getPlayerName(getState());

    const response = await fetchAPI('/room/create', {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
    const { roomId } = await response.json();

    return roomId;
  }
);

export const joinRoom = createAsyncThunk<string, string, { state: RootState }>(
  'room/joinRoom',
  async (roomId, { getState }) => {
    const playerName = getPlayerName(getState());

    await fetchAPI(`/room/join/${roomId}`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });

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

export const getRoomId = (state: RootState): string | null => state.room.roomId;

export default roomSlice.reducer;
