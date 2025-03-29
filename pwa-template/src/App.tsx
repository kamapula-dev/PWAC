/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import MainView from './components/MainView';
import AboutView from './components/AboutView';
import PwaView from './components/PwaView';
import ReviewsView from './components/ReviewsView';
import axios from 'axios';
import { PwaContent, PWAInstallState } from './shared/models';
import playMarket from './shared/icons/playMarketIcon.svg';
import Menu from './components/Menu/Menu';
import {
  buildAppLink,
  getExternalId,
  logEvent,
  sendEventWithCAPI,
  trackExternalId,
} from './shared/helpers/analytics.ts';
import ModalMenu from './components/ModalMenu/ModalMenu.tsx';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setInstallState } from './Redux/feat/InstallSlice.tsx';
import { UAParser } from 'ua-parser-js';
import useInstallPwaInstall from './shared/useInstallPwa.ts';

const parser = new UAParser();
const ua = parser.getResult();

declare const window: any;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const shouldRedirectToApp =
  ua.os.name === 'Android' &&
  (ua.browser.name === 'Facebook' || /FBAN|FBAV/i.test(navigator.userAgent));

export default function App() {
  const [view, setView] = useState('main');
  const [isPWAActive, setIsPWAActive] = useState(false);
  const [pwaContent, setPwaContent] = useState<PwaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const { installPWA } = useInstallPwaInstall(
    installPrompt,
    pwaContent?.pixel,
    pwaContent?._id,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!pwaContent) return;
    const interval = setInterval(() => {
      const pwaLink = localStorage.getItem('pwaLink');
      if (!pwaLink) {
        dispatch(setInstallState(PWAInstallState.waitingForRedirect));
      } else {
        dispatch(setInstallState(PWAInstallState.idle));
        clearInterval(interval);
      }
    }, 1000);
  }, [pwaContent]);

  useEffect(() => {
    window.addEventListener(
      'beforeinstallprompt',
      (e: BeforeInstallPromptEvent) => {
        e.preventDefault();
        console.log('beforeinstallprompt fired');
        setInstallPrompt(e);
      },
    );

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {
        setInstallPrompt(null);
      });
    };
  }, []);

  const pwaLink = localStorage.getItem('pwaLink');

  useEffect(() => {
    if (pwaLink || isPWAActive) return;
    if (!isPWAActive && pwaContent?.pwaLink) {
      setTimeout(() => {
        const fbc = Cookies.get('_fbc');
        const fbp = Cookies.get('_fbp');
        const generatedPwaLink = buildAppLink(pwaContent?.pwaLink, fbc, fbp);
        localStorage.setItem('pwaLink', generatedPwaLink);
      }, 3000);
    }
  }, [isPWAActive, pwaContent]);

  useEffect(() => {
    if (isPWAActive) return;
    const getPwaContent = async () => {
      try {
        const response = await axios.get(
          `https://pwac.world/pwa-content/${
            import.meta.env.VITE_PWA_CONTENT_ID
          }/trusted`,
        );

        const language =
          Intl.DateTimeFormat().resolvedOptions().locale?.split('-')[0] ??
          window.navigator.language ??
          navigator.language ??
          'en';

        const pwaContent = {
          ...response.data,
          ...(response.data.customModal &&
            response.data.customModal.title && {
              customModal: {
                title:
                  response.data.customModal.title[language] ??
                  Object.values(response.data.customModal.title)[0] ??
                  undefined,
                content:
                  response.data.customModal.content[language] ??
                  Object.values(response.data.customModal.content)[0] ??
                  undefined,
                buttonText:
                  response.data.customModal.buttonText[language] ??
                  Object.values(response.data.customModal?.buttonText)[0] ??
                  undefined,
                showAppHeader: response.data.customModal.showAppHeader ?? false,
              },
            }),
          shortDescription:
            response.data.shortDescription[language] ??
            Object.values(response.data.shortDescription)[0],
          fullDescription:
            response.data.fullDescription[language] ??
            Object.values(response.data.fullDescription)[0],
          countOfDownloads:
            response.data.countOfDownloads[language] ??
            Object.values(response.data.countOfDownloads)[0],
          reviews: response.data.reviews.map((review: any) => {
            return {
              ...review,
              reviewText:
                review.reviewText[language] ??
                Object.values(review.reviewText)[0],
              ...(review.devResponse && {
                devResponse:
                  review.devResponse[language] ??
                  Object.values(review.devResponse)[0],
              }),
            };
          }),
        } as PwaContent;

        if (pwaContent._id) {
          trackExternalId(pwaContent._id, pwaContent.pwaLink);
        }

        if (window.matchMedia && !!pwaContent?.theme?.auto) {
          const darkModeMediaQuery = window.matchMedia(
            '(prefers-color-scheme: dark)',
          );

          setDark(darkModeMediaQuery.matches);

          if (typeof darkModeMediaQuery.addEventListener === 'function') {
            darkModeMediaQuery.addEventListener('change', (event: any) => {
              setDark(event.matches);
            });
          } else if (typeof darkModeMediaQuery.addListener === 'function') {
            darkModeMediaQuery.addListener((event: any) => {
              setDark(event.matches);
            });
          }
        } else {
          setDark(!!pwaContent?.theme?.dark);
        }

        if (window.fbq && pwaContent?.pixel?.length) {
          const eventName = 'OpenPage';

          pwaContent.pixel.forEach((pixel) => {
            const event = pixel.events.find(
              ({ triggerEvent }) => triggerEvent === eventName,
            );

            if (pixel.pixelId && pixel.token && event) {
              sendEventWithCAPI(pixel.pixelId, pixel.token, event.sentEvent);
            } else if (event) {
              window.fbq('track', pixel.pixelId, event.sentEvent);
            }
          });
        }

        if (pwaContent?._id) {
          logEvent(
            pwaContent._id,
            window.location.hostname,
            'OpenPage',
            getExternalId(),
          );
        }

        setPwaContent(pwaContent);
      } catch (error) {
        console.error(error);
      }
    };

    getPwaContent();
  }, []);

  useEffect(() => {
    if (!pwaContent?.hasLoadingScreen) return;

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [pwaContent]);

  useEffect(() => {
    const isPWAActivated = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;

    setIsPWAActive(isPWAActivated);

    if (shouldRedirectToApp) {
      const intentUrl = `intent://${window.location.hostname}${
        window.location.pathname
      }${
        window.location.search
      }#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
        window.location.href,
      )};end`;

      window.location.href = intentUrl;
    }
  }, []);

  if (!pwaContent) return <></>;

  let currentView;

  switch (view) {
    case 'main':
      currentView = (
        <MainView
          mainThemeColor={pwaContent?.mainThemeColor}
          dark={dark}
          pwaContent={pwaContent}
          setView={setView}
          installPrompt={installPrompt}
        />
      );
      break;
    case 'about':
      currentView = (
        <AboutView dark={dark} setView={setView} pwaContent={pwaContent} />
      );
      break;
    case 'reviews':
      currentView = (
        <ReviewsView
          mainThemeColor={pwaContent?.mainThemeColor}
          dark={dark}
          pwaContent={pwaContent}
          setView={setView}
          installPrompt={installPrompt}
        />
      );
      break;
  }

  return isPWAActive ? (
    <PwaView
      id={pwaContent._id}
      hasPushes={pwaContent.hasPushes}
      pwaLink={pwaLink}
    />
  ) : (
    <div>
      {dark && <style>{`body{background-color: #131313;}`}</style>}
      {pwaContent?.testDesign && <style>{`body{letter-spacing: 0.3px}`}</style>}
      <div
        style={
          dark
            ? {
                background: 'rgb(19, 19, 19)',
              }
            : {}
        }
        className={`fixed z-[10000000] bg-white w-full h-full justify-center items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isLoading && pwaContent?.hasLoadingScreen ? 'flex' : 'hidden'
        }`}
      >
        {pwaContent?.testDesign ? (
          <svg
            width="160"
            height="160"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
          </svg>
        ) : (
          <img src={playMarket} className="w-[125px] h-[137px]" />
        )}
      </div>
      {currentView}
      {pwaContent?.hasMenu && (
        <div onClick={installPWA}>
          <Menu
            testDesign={pwaContent?.testDesign}
            mainThemeColor={pwaContent?.mainThemeColor}
            dark={dark}
          />
        </div>
      )}
      {pwaContent?.customModal && (
        <ModalMenu
          mainThemeColor={pwaContent?.mainThemeColor}
          installButtonTextColor={pwaContent?.installButtonTextColor}
          showAppHeader={true}
          title={pwaContent?.customModal?.title}
          content={pwaContent?.customModal?.content}
          buttonText={pwaContent?.customModal?.buttonText}
          pwaContent={pwaContent}
          installPrompt={installPrompt}
          dark={dark}
        />
      )}
    </div>
  );
}
