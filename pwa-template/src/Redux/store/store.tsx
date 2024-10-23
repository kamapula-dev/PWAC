import { configureStore } from "@reduxjs/toolkit";
import installSlice from "../feat/InstallSlice";

export const store = configureStore({
  reducer: {
    install: installSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
