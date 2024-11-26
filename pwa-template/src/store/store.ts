import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authApi";
import { filesSlice } from "./slices/filesApi";
import { pwaSlice } from "./slices/pwaApi";

const store = configureStore({
  reducer: {
    [authSlice.reducerPath]: authSlice.reducer,
    [filesSlice.reducerPath]: filesSlice.reducer,
    [pwaSlice.reducerPath]: pwaSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
          .concat(authSlice.middleware)
          .concat(filesSlice.middleware)
          .concat(pwaSlice.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;