import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { store } from "./Redux/store/store.tsx";
import { Provider } from "react-redux";
import { MixpanelProvider } from "react-mixpanel-browser";
import "normalize.css";
import LocaleProvider from "./LocaleProvider.tsx";
import { requestPermission } from "./pushNotificationService.ts";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    requestPermission();
    console.log(1);
  });
}

const MIXPANEL_TOKEN = "170848cefeef5a5cf7d5e112ba893ee2";

const MIXPANEL_CONFIG = {
  debug: true,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MixpanelProvider config={MIXPANEL_CONFIG} token={MIXPANEL_TOKEN}>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </MixpanelProvider>
    </Provider>
  </React.StrictMode>
);
