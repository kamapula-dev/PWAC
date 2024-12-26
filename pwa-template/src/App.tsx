/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import MainView from "./components/MainView";
import AboutView from "./components/AboutView";
import PwaView from "./components/PwaView";
import ReviewsView from "./components/ReviewsView";
import axios from "axios";
import { PwaContent } from "./shared/models";
import playMarket from "./shared/icons/playMarketIcon.svg";
import Menu from "./components/Menu/Menu";

declare const window: any;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function App() {
  const [view, setView] = useState("main");
  const [isPWAActive, setIsPWAActive] = useState(false);
  const [pwaContent, setPwaContent] = useState<PwaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isPWAActive) return;
    const getPwaContent = async () => {
      try {
        const response = await axios.get(
          `https://pwac.world/pwa-content/${
            import.meta.env.VITE_PWA_CONTENT_ID
          }/trusted`
        );

        const language = navigator.language.split("-")[0];

        const pwaContent = {
          ...response.data,
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
              devResponse:
                review.devResponse[language] ??
                Object.values(review.devResponse)[0],
            };
          }),
        };

        setPwaContent(pwaContent);
      } catch (error) {
        console.error(error);
      }
    };
    getPwaContent();
  }, []);

  useEffect(() => {
    window.addEventListener(
      "beforeinstallprompt",
      (e: BeforeInstallPromptEvent) => {
        e.preventDefault();
        console.log("beforeinstallprompt fired");
        setInstallPrompt(e);
      }
    );

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {
        setInstallPrompt(null);
      });
    };
  }, []);

  useEffect(() => {
    if (!pwaContent?.hasLoadingScreen) return;
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [pwaContent]);

  useEffect(() => {
    const isPWAActivated = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    setIsPWAActive(isPWAActivated);

    if (/FBA[NV]/.test(navigator.userAgent)) {
      const intentUrl = `intent://${window.location.hostname}${
        window.location.pathname
      }${
        window.location.search
      }#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
        window.location.href
      )};end`;

      window.location.href = intentUrl;
    }
  }, []);

  useEffect(() => {
    if (pwaContent?.pwaLink) {
      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);

        let newPwaLink = pwaContent.pwaLink;
        let pixelId: string | null = "";

        const fbc = Cookies.get("_fbc");
        const fbp = Cookies.get("_fbp");

        const domain = window.location.hostname;

        newPwaLink += `${
          newPwaLink.includes("?") ? "&" : "?"
        }sub_id_5=${domain}`;

        if (searchParams.has("idpixel") || searchParams.has("sub_id_7")) {
          pixelId = searchParams.has("idpixel")
            ? searchParams.get("idpixel")
            : searchParams.get("sub_id_7");
          newPwaLink += `${
            newPwaLink.includes("?") ? "&" : "?"
          }sub_id_7=${pixelId}`;
        }

        if (fbp && fbc) {
          newPwaLink += `${
            newPwaLink.includes("?") ? "&" : "?"
          }sub_id_8=${fbp}&sub_id_9=${fbc}`;
        }

        searchParams.forEach((value, key) => {
          if (key !== "idpixel" && key !== "sub_id_7") {
            newPwaLink += `${
              newPwaLink.includes("?") ? "&" : "?"
            }${key}=${value}`;
          }
        });

        const pwaLink = localStorage.getItem("pwaLink");
        if (!pwaLink) {
          localStorage.setItem("pwaLink", newPwaLink);
        }
      }, 3000);
    }
  }, [pwaContent]);

  if (!pwaContent) return <></>;

  let currentView;

  switch (view) {
    case "main":
      currentView = (
        <MainView
          pwaContent={pwaContent}
          setView={setView}
          installPrompt={installPrompt}
        />
      );
      break;
    case "about":
      currentView = <AboutView setView={setView} pwaContent={pwaContent} />;
      break;
    case "reviews":
      currentView = <ReviewsView pwaContent={pwaContent} setView={setView} />;
      break;
  }

  return isPWAActive ? (
    <PwaView />
  ) : (
    <div>
      <div
        className={`fixed z-[10000000] bg-white w-full h-full justify-center items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isLoading && pwaContent?.hasLoadingScreen ? "flex" : "hidden"
        }`}
      >
        <img src={playMarket} className="w-[125px] h-[137px]" />
      </div>
      {currentView}
      {pwaContent?.hasMenu && <Menu />}
    </div>
  );
}
