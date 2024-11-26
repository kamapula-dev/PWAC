export enum PWAInstallState {
  idle = "idle",
  installing = "installing",
  installed = "installed",
  downloaded = "downloaded",
  downloading = "downloading",
}

export enum PwaViews {
  Main = "Main",
  Reviews = "Reviews",
  About = "About",
}

export interface PreviewPwaContent {
  appName?: string;
  developerName?: string;
  countOfDownloads?: string;
  countOfReviews?: string;
  size: string;
  verified: boolean;
  hasPaidContentTitle: boolean;
  securityUI: boolean;
  lastUpdate: string;
  rating: string;
  countOfReviewsFull: string;
  shortDescription: string;
  fullDescription: string;
  version: string;
}
