import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { store } from './Redux/store/store.tsx';
import { Provider } from 'react-redux';
import './index.css';
import LocaleProvider from './LocaleProvider.tsx';
import { UAParser } from 'ua-parser-js';

const parser = new UAParser();
const browser = parser.getBrowser();
const browserName = (browser.name || '').toLowerCase();

const url = new URL(window.location.href);
const searchParams = url.searchParams;

if (!browserName.includes('chrome') && !browserName.includes('yandex')) {
  searchParams.set('wasRedirected', '1');

  const fallbackUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}#__intentRedirected`;

  const intentUrl = `intent://${window.location.hostname}/?${searchParams.toString()}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
    fallbackUrl,
  )};end`;

  window.location.href = intentUrl;
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
