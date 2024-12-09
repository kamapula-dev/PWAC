import { useEffect, useState } from "react";
import PageLoader from "../PageLoader";
import StartAgainView from "../StartAgainView";

const PwaView = () => {
  const [view, setView] = useState("loading");
  const pwaLink = localStorage.getItem("pwaLink")!;

  useEffect(() => {
    const firstVisitPwa = localStorage.getItem("firstVisitPWA");
    if (!firstVisitPwa) {
      localStorage.setItem("firstVisitPWA", "true");
    }

    const timer = setTimeout(() => {
      setView("button");
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  return view === "loading" ? (
    <PageLoader pwaLink={pwaLink} />
  ) : (
    <StartAgainView pwaLink={pwaLink} />
  );
};

export default PwaView;
