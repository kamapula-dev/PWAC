import { useEffect, useState } from "react";
import PageLoader from "../PageLoader";
import StartAgainView from "../StartAgainView";

const PwaView = ({ pwaLink }: { pwaLink: string }) => {
  const [view, setView] = useState("loading");

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
