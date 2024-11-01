import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import MainView from "./components/MainView";
import AboutView from "./components/AboutView";
import PwaView from "./components/PwaView";
import ReviewsView from "./components/ReviewsView";
import useSanity from "./shared/hooks/useSanity";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function App() {
  const { data } = useSanity("pwaLink");
  const [view, setView] = useState("main");
  const [isPWAActive, setIsPWAActive] = useState(false);
  console.log(import.meta.env.VITE_PWA_CONTENT_ID);

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
    if (data?.pwaLink) {
      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);

        let newPwaLink = data.pwaLink;
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
  }, [data]);

  let currentView;

  switch (view) {
    case "main":
      currentView = <MainView setView={setView} />;
      break;
    case "about":
      currentView = <AboutView setView={setView} />;
      break;
    case "reviews":
      currentView = <ReviewsView setView={setView} />;
      break;
  }

  return isPWAActive ? <PwaView /> : <>{currentView}</>;
}
