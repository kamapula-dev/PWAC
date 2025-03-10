import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { store } from './Redux/store/store.tsx';
import { Provider } from 'react-redux';
import './index.css';
import LocaleProvider from './LocaleProvider.tsx';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <LocaleProvider>
        <div className="max-w-[650px] mx-auto">
          <App />
        </div>
      </LocaleProvider>
    </Provider>
  </React.StrictMode>,
);
