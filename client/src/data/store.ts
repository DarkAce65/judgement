import { configureStore } from '@reduxjs/toolkit';

import player from './playerSlice';

const store = configureStore({ reducer: { player } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
