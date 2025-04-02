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
            xmlns="http://www.w3.org/2000/svg"
            height="180"
            width="180"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 512 118"
          >
            <path
              d="m81.281306 77.0029082c13.9731346-7.6725046 24.566551-13.5188714 25.47962-13.9731346 2.920912-1.5535799 5.93722-5.6646615 0-8.8581315-1.91699-1.0039215-12.2378491-6.668583-25.47962-13.9731345l-18.356774 18.5384792z"
              fill="#ffd900"
            />
            <path
              d="m62.924532 58.7369868-58.45003994 58.9088462c1.37187472.181705 2.92091207-.181706 4.74704995-1.185627 3.83398099-2.098696 44.47690529-24.2939937 72.05976399-39.4527551z"
              fill="#f43249"
            />
            <path
              d="m62.924532 58.7369868 18.356774-18.4476266s-67.9486825-37.08150121-72.05976399-39.27104961c-1.54903735-.91761157-3.2843226-1.19016946-4.83790258-.91761157z"
              fill="#00ee76"
            />
            <path
              d="m62.924532 58.7369868-58.54089257-58.63628778c-2.37579629.54965842-4.38363943 2.64835418-4.38363943 6.94114098v103.662852c0 3.929376 1.55357998 6.759435 4.47449206 7.031993z"
              fill="#00d3ff"
            />
            <path
              d="m253.533351 47.0442533c-10.502564 0-19.17899 8.1267678-19.17899 19.2698429 0 11.0522226 8.585573 19.269843 19.17899 19.269843s19.17899-8.1267678 19.17899-19.269843c0-11.1430751-8.585573-19.2698429-19.17899-19.2698429zm0 30.8717239c-5.755514 0-10.775122-4.8424452-10.775122-11.688191 0-6.9411409 5.024151-11.6881909 10.775122-11.6881909 5.750972 0 10.775122 4.74705 10.775122 11.6881909 0 6.8457458-5.02415 11.688191-10.775122 11.688191zm-41.737698-30.8717239c-10.593417 0-19.178991 8.1267678-19.178991 19.2698429 0 11.0522226 8.585574 19.269843 19.178991 19.269843 10.593416 0 19.17899-8.1267678 19.17899-19.269843 0-11.1430751-8.585574-19.2698429-19.17899-19.2698429zm0 30.8717239c-5.755515 0-10.775122-4.8424452-10.775122-11.688191 0-6.9411409 5.02415-11.6881909 10.775122-11.6881909 5.755514 0 10.775122 4.74705 10.775122 11.6881909 0 6.8457458-4.933298 11.688191-10.775122 11.688191zm-49.591909-24.9345045v8.1267678h19.360696c-.549659 4.5653447-2.098696 7.9450625-4.38364 10.2300062-2.830059 2.8300595-7.213699 5.9372194-14.977056 5.9372194-11.965291 0-21.186833-9.6803478-21.186833-21.6456392 0-11.9652915 9.226084-21.8273445 21.186833-21.8273445 6.482335 0 11.143075 2.5575015 14.613646 5.8463667l5.750971-5.7555141c-4.842445-4.6561973-11.32478-8.2176205-20.364617-8.2176205-16.348931 0-30.049507 13.4234762-30.049507 29.7724071s13.700576 29.7724071 30.049507 29.7724071c8.858132 0 15.435862-2.9209121 20.73257-8.4038684 5.387561-5.387561 7.031994-12.969213 7.031994-19.0881377 0-1.9169905-.181705-3.6522757-.458806-5.1150031zm202.932979 6.3006299c-1.55358-4.2927868-6.482336-12.2378493-16.348931-12.2378493-9.866596 0-17.993364 7.7633573-17.993364 19.2698429 0 10.775122 8.126768 19.269843 18.906433 19.269843 8.767278 0 13.791429-5.387561 15.890125-8.494721l-6.482335-4.3836394c-2.194092 3.1980126-5.115004 5.2967084-9.40779 5.2967084-4.292787 0-7.304552-1.9169905-9.226085-5.8463668l25.47962-10.6842694zm-25.938426 6.4868779c-.181706-7.3999468 5.755514-11.2339278 9.952905-11.2339278 3.379718 0 6.118925 1.6444326 7.122846 4.1110815zm-20.732571 18.5384792h8.403869v-56.4421968h-8.403869zm-13.696034-32.9704196h-.272558c-1.91699-2.2849437-5.478413-4.2927868-10.048301-4.2927868-9.589495 0-18.265921 8.4947209-18.265921 19.2698429s8.767279 19.1789904 18.265921 19.1789904c4.565345 0 8.126768-2.0078432 10.048301-4.3836395h.272558v2.7392069c0 7.3999467-3.929376 11.3247804-10.230006 11.3247804-5.115003 0-8.313016-3.7431284-9.589495-6.8502884l-7.304552 3.10716c2.098696 5.1150031 7.672505 11.415633 16.894047 11.415633 9.862053 0 18.175069-5.8463668 18.175069-20.0012066v-34.6148523h-7.945063zm-9.589495 26.5789371c-5.755514 0-10.593417-4.8424452-10.593417-11.5973383s4.842445-11.688191 10.593417-11.688191c5.664661 0 10.230006 4.9332979 10.230006 11.688191-.004542 6.6640404-4.569887 11.5973383-10.230006 11.5973383zm109.136723-50.0507143h-20.09206v56.4421968h8.403869v-21.3730813h11.688191c9.316937 0 18.447626-6.7594357 18.447626-17.5345577s-9.130689-17.5345578-18.447626-17.5345578zm.272557 27.2194482h-11.874438v-19.3652382h11.874438c6.209778 0 9.862053 5.2058557 9.862053 9.6803478-.08631 4.3836394-3.647733 9.6848904-9.862053 9.6848904zm51.695147-8.1313105c-6.028072 0-12.328702 2.6483542-14.886203 8.6764263l7.399946 3.1071599c1.644433-3.1071599 4.565345-4.1110815 7.672505-4.1110815 4.38364 0 8.767279 2.6483542 8.858132 7.3045515v.5496584c-1.55358-.9130689-4.74705-2.194091-8.767279-2.194091-8.035915 0-16.167226 4.4744921-16.167226 12.6966551 0 7.5816521 6.577731 12.4195546 13.882282 12.4195546 5.664662 0 8.767279-2.5575015 10.684269-5.5692662h.272558v4.3836394h8.126768v-21.6456392c-.090852-9.9529057-7.486257-15.6175673-17.075752-15.6175673zm-1.003921 30.8717239c-2.739207 0-6.577731-1.3718747-6.577731-4.7470499 0-4.3836394 4.74705-6.0280721 8.858132-6.0280721 3.652275 0 5.387561.8222164 7.672504 1.9169906-.640511 5.2058557-5.115003 8.8581314-9.952905 8.8581314zm47.397817-29.5907018-9.589495 24.3848461h-.272558l-9.952906-24.3848461h-9.039836l14.977056 34.1560465-8.494721 19.0881378h8.767279l22.922118-53.2441843zm-75.253234 36.073037h8.403868v-56.4421968h-8.403868z"
              fill="#808285"
            />
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
