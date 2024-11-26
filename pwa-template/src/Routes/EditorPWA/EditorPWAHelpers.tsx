import { LiaSitemapSolid } from "react-icons/lia";
import { SiPivotaltracker } from "react-icons/si";
import { MdColorLens } from "react-icons/md";
import { MdOutlineAnalytics } from "react-icons/md";
import { FaRocketchat } from "react-icons/fa";

export enum EditorPWATabs {
  Domain = "domain",
  Tracker = "tracker",
  Design = "design",
  Analytics = "analytics",
  Push = "push",
}

export const getTabText = (tab: EditorPWATabs) => {
  switch (tab) {
    case EditorPWATabs.Domain:
      return "ДОМЕН";
    case EditorPWATabs.Tracker:
      return "ТРЕКЕР";
    case EditorPWATabs.Design:
      return "ОФОРМЛЕНИЕ";
    case EditorPWATabs.Analytics:
      return "Аналитика";
    case EditorPWATabs.Push:
      return "PUSH УВЕДОМЛЕНИЯ";
  }
};

export const getTabIcon = (tab: EditorPWATabs) => {
  switch (tab) {
    case EditorPWATabs.Domain:
      return <LiaSitemapSolid color="white" style={{ fontSize: "20px" }} />;
    case EditorPWATabs.Tracker:
      return <SiPivotaltracker color="white" style={{ fontSize: "20px" }} />;
    case EditorPWATabs.Design:
      return <MdColorLens color="white" style={{ fontSize: "20px" }} />;
    case EditorPWATabs.Analytics:
      return <MdOutlineAnalytics color="white" style={{ fontSize: "20px" }} />;
    case EditorPWATabs.Push:
      return <FaRocketchat color="white" style={{ fontSize: "20px" }} />;
  }
};
