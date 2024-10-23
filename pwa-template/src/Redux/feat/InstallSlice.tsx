import { createSlice } from "@reduxjs/toolkit";
import { BeforeInstallPromptEvent } from "../../App";

export interface InstalState {
  isInstalling: boolean;
  fakeDownload: boolean;
  isDownloaded: boolean;
  fakeDownloadProgress: string;
  installPrompt: BeforeInstallPromptEvent | null;
}

const initialState: InstalState = {
  isInstalling: false,
  fakeDownload: false,
  isDownloaded: false,
  fakeDownloadProgress: "Waiting...",
  installPrompt: null,
};

export const instalSlice = createSlice({
  name: "install",
  initialState,
  reducers: {
    install: (state) => {
      state.isInstalling = true;
    },
    startFakeDownload: (state) => {
      state.fakeDownload = true;
    },
    stopFakeFakeDownload: (state) => {
      state.fakeDownload = false;
    },
    stopInstalling: (state) => {
      state.isInstalling = false;
    },
    setIsDownloaded: (state) => {
      state.isDownloaded = true;
    },
    setFakeDownloadProgress: (state, action) => {
      state.fakeDownloadProgress = action.payload + "% of 15 MB";
    },
    setInstallPrompt: (state, action) => {
      state.installPrompt = action.payload;
    },
  },
});

export const {
  install,
  stopInstalling,
  startFakeDownload,
  stopFakeFakeDownload,
  setIsDownloaded,
  setFakeDownloadProgress,
  setInstallPrompt,
} = instalSlice.actions;

export default instalSlice.reducer;
