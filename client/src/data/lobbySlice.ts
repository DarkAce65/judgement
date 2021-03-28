import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchAPI } from '../api/client';

import { getPlayerName } from './playerSlice';
import type { RootState } from './store';

interface LobbyState {
  roomId: string | null;
}

const initialState: LobbyState = {
  roomId: null,
};

export const createLobby = createAsyncThunk<string, void, { state: RootState }>(
  'lobby/createLobby',
  async (_, { getState }) => {
    const playerName = getPlayerName(getState());

    const response = await fetchAPI('/create-game', {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
    const { roomId } = await response.json();

    return roomId;
  }
);

export const joinLobby = createAsyncThunk<string, string, { state: RootState }>(
  'lobby/joinLobby',
  async (roomId, { getState }) => {
    const playerName = getPlayerName(getState());

    await fetchAPI(`/join-game/${roomId}`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });

    return roomId;
  }
);

export const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createLobby.fulfilled, (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    });
    builder.addCase(joinLobby.fulfilled, (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    });
  },
});

export const getRoomId = (state: RootState): string | null => state.lobby.roomId;

export default lobbySlice.reducer;
