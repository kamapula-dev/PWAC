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
  trackExternalId,
} from './shared/helpers/analytics.ts';
import ModalMenu from './components/ModalMenu/ModalMenu.tsx';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import {
  getInstallState,
  setInstallState,
} from './Redux/feat/InstallSlice.tsx';
import { RootState } from './Redux/store/store.tsx';

declare const window: any;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function App() {
  const [view, setView] = useState('main');
  const [isPWAActive, setIsPWAActive] = useState(false);
  const [pwaContent, setPwaContent] = useState<PwaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const installState = useSelector((state: RootState) =>
    getInstallState(state.install),
  );

  const dispatch = useDispatch();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkPWAInstallation = async () => {
      console.log(navigator);
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (
            navigator as any
          ).getInstalledRelatedApps();
          console.log('relatedApps', relatedApps);
          if (relatedApps.length > 0) {
            dispatch(setInstallState(PWAInstallState.installed));
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error checking related apps', error);
        }
      }
    };

    interval = setInterval(() => {
      checkPWAInstallation();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [installState, dispatch]);

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

  useEffect(() => {
    if (!isPWAActive) {
      setTimeout(() => {
        const fbc = Cookies.get('_fbc');
        const fbp = Cookies.get('_fbp');
        localStorage.setItem('fbc', fbc || '');
        localStorage.setItem('fbp', fbp || '');
      }, 3000);
    }
  }, [isPWAActive]);

  useEffect(() => {
    if (isPWAActive) return;
    const getPwaContent = async () => {
      try {
        const response = await axios.get(
          `https://pwac.world/pwa-content/${
            import.meta.env.VITE_PWA_CONTENT_ID
          }/trusted`,
        );

        const language = new Intl.Locale(navigator.language).language || 'en';

        const pwaContent = {
          ...response.data,
          ...(response.data.customModal && {
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
          let viewContentEvent;

          pwaContent.pixel.forEach((pixel) => {
            const event = pixel.events.find(
              ({ triggerEvent }) => triggerEvent === eventName,
            );

            if (event) {
              viewContentEvent = eventName;
              window.fbq('track', pixel.pixelId, event.sentEvent);
            }
          });
          if (viewContentEvent && pwaContent._id) {
            logEvent(
              pwaContent._id,
              window.location.hostname,
              viewContentEvent,
              getExternalId(),
            );
          }
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

    if (pwaContent._id) {
      trackExternalId(pwaContent._id);
    }
  }, [pwaContent]);

  useEffect(() => {
    const isPWAActivated = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;

    setIsPWAActive(isPWAActivated);

    if (/FBA[NV]/.test(navigator.userAgent)) {
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
        <ReviewsView dark={dark} pwaContent={pwaContent} setView={setView} />
      );
      break;
  }

  return isPWAActive ? (
    <PwaView
      pwaLink={buildAppLink(
        pwaContent?.pwaLink,
        localStorage.getItem('fbc')?.toString(),
        localStorage.getItem('fbp')?.toString(),
      )}
    />
  ) : (
    <div>
      {dark && <style>{`body{background-color: #131313;}`}</style>}
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
        <img src={playMarket} className="w-[125px] h-[137px]" />
      </div>
      {currentView}
      {pwaContent?.hasMenu && <Menu dark={dark} />}
      {pwaContent?.customModal && (
        <ModalMenu
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
