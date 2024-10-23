import { useEffect, useState } from "react";
import { useMixpanel } from "react-mixpanel-browser";
import PageLoader from "../PageLoader";
import StartAgainView from "../StartAgainView";

const PwaView = () => {
  const [view, setView] = useState("loading");
  const mixpanel = useMixpanel();

  useEffect(() => {
    const firstVisitPwa = localStorage.getItem("firstVisitPWA");
    if (!firstVisitPwa && mixpanel) {
      localStorage.setItem("firstVisitPWA", "true");
      mixpanel.track("pwa_first_open");
    }

    const timer = setTimeout(() => {
      setView("button");
    }, 5000);

    return () => clearTimeout(timer);
  }, [mixpanel]);

  return view === "loading" ? <PageLoader /> : <StartAgainView />;
};

export default PwaView;
