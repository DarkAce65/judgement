import { configureStore } from '@reduxjs/toolkit';

import lobby from './lobbySlice';
import player from './playerSlice';

const store = configureStore({ reducer: { lobby, player } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
