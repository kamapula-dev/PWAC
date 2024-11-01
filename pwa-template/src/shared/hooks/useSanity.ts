import { useEffect, useState } from "react";
import sanityClient from "../../client";
import imageUrlBuilder from "@sanity/image-url";

interface ImageAsset {
  _id: string;
  url: string;
}

interface Image {
  asset: ImageAsset;
}

interface Text {
  [key: string]: string;
  en: string; // English
  de: string; // German
  fr: string; // French
  es: string; // Spanish
  pt: string; // Portuguese
  nl: string; // Dutch
  it: string; // Italian
  da: string; // Danish
  sv: string; // Swedish
  no: string; // Norwegian
  el: string; // Greek
  tr: string; // Turkish
  bg: string; // Bulgarian
  cs: string; // Czech
  hu: string; // Hungarian
  ro: string; // Romanian
  sl: string; // Slovenian
  sk: string; // Slovak
  pl: string; // Polish
}

interface Review {
  reviewAuthorName: string;
  reviewAuthorIcon: Image;
  reviewAuthorRating: number;
  reviewIconColor: string;
  avatarTitle: string;
  reviewText: Text;
  reviewDate: string;
}

interface Data {
  appName: string;
  developerName: string;
  countOfDownloads: string;
  countOfReviews: string;
  lastUpdate: string;
  pwaLink: string;
  rating: string;
  shortDescription: Text;
  fullDescription: Text;
  countOfReviewsFull: string;
  countOfStars: number;
  appIcon: Image;
  screens: Image[];
  reviews: Review[];
  size: string;
  version: string;
}

const builder = imageUrlBuilder(sanityClient);

function urlFor(source: Image) {
  return builder.image(source.asset).url();
}

const useSanity = (params: string) => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = `*[_type == "event"]{${params}}`;
        const result = await sanityClient.fetch(query);
        console.log(result);
        if (result && result.length > 0) {
          const [firstResult] = result;

          setData(firstResult);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return { data, urlFor, loading, error };
};

export default useSanity;
