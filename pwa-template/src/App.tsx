/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import MainView from './components/MainView';
import AboutView from './components/AboutView';
import ReviewsView from './components/ReviewsView';
import axios from 'axios';
import { PwaContent, PWAInstallState } from './shared/models';
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
import PageLoader from './components/PageLoader';

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
  }, [dispatch, pwaContent]);

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
      }, 5000);
    }
  }, [isPWAActive, pwaContent, pwaLink]);

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
                timeout: response.data.customModal.timeout ?? 7000,
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
    const isPWAActivated = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    const preloader = document.getElementById('preloader');

    if (isPWAActivated && preloader) {
      preloader.style.display = 'none';
    }

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

  useEffect(() => {
    if (pwaContent) {
      setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
          preloader.style.display = 'none';
        }
      }, 500);
    }
  }, [pwaContent]);

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
        <AboutView
          mainThemeColor={pwaContent?.mainThemeColor}
          dark={dark}
          setView={setView}
          pwaContent={pwaContent}
        />
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
    <PageLoader
      dark={dark}
      offerPreloader={pwaContent.offerPreloader}
      mainThemeColor={pwaContent.mainThemeColor}
      id={pwaContent._id}
      hasPushes={pwaContent.hasPushes}
      pwaLink={pwaLink}
    />
  ) : (
    <div>
      {dark && <style>{`body{background-color: #131313;}`}</style>}
      {pwaContent?.testDesign && <style>{`body{letter-spacing: 0.3px}`}</style>}
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
      {pwaContent?.customModal &&
        installPrompt &&
        !!pwaContent?.customModal?.timeout && (
          <ModalMenu
            timeout={pwaContent.customModal?.timeout}
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
