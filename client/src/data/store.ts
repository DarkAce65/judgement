import { configureStore } from '@reduxjs/toolkit';

import game from './gameSlice';
import player from './playerSlice';
import room from './roomSlice';

const store = configureStore({ reducer: { player, room, game } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
