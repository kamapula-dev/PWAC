export enum PWAInstallState {
  idle = "idle",
  installing = "installing",
  installed = "installed",
  downloaded = "downloaded",
  downloading = "downloading",
}

export interface PwaContent {
  appName: string;
  developerName: string;
  hasPaidContentTitle: boolean;
  countOfDownloads: number;
  countOfReviews: number;
  size: string;
  verified: boolean;
  tags: string[];
  securityUI: boolean;
  lastUpdate: string;
  pwaLink: string;
  rating: string;
  shortDescription: string;
  fullDescription: string;
  countOfReviewsFull: number;
  countOfStars: number;
  appIcon: string;
  languages?: string[];
  images: {
    id?: string;
    url: string;
    type: string;
  }[];
  reviews: {
    reviewAuthorName: string;
    reviewAuthorIcon?: string;
    reviewAuthorRating: number;
    reviewIconColor: string;
    reviewText: string;
    reviewDate: string;
    devResponse?: string;
  }[];
  version: string;
  sliders: number[];
  id?: string;
  wideScreens: boolean;
  hasLoadingScreen?: boolean;
  hasMenu?: boolean;
  videoUrl?: string;
}
