import { createSlice } from "@reduxjs/toolkit";
import { PWAInstallState } from "../../shared/models";

export interface InstalState {
  installState: PWAInstallState;
  fakeDownloadProgress: string;
}

const initialState: InstalState = {
  installState: PWAInstallState.idle,
  fakeDownloadProgress: "Waiting...",
};

export const instalSlice = createSlice({
  name: "install",
  initialState,
  reducers: {
    setInstallState: (state, action) => {
      state.installState = action.payload;
    },
    setFakeDownloadProgress: (state, action) => {
      state.fakeDownloadProgress = action.payload + "% of 15 MB";
    },
  },
});

export const { setInstallState, setFakeDownloadProgress } = instalSlice.actions;

export const getInstallState = (state: InstalState) => state.installState;

export default instalSlice.reducer;
