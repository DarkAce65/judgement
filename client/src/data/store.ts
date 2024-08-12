import { configureStore } from '@reduxjs/toolkit';

import game from './gameSlice';
import player from './playerSlice';

const store = configureStore({ reducer: { game, player } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
