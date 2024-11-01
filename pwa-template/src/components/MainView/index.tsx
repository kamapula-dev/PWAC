import { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import AppLogo from "../AppLogo";
import StarIcon from "@mui/icons-material/Star";
import { Divider, Rating } from "@mui/material";
import InstallButton from "../InstallButton";
import ContentSlider from "../ContentSlider";
import OpenSectionButton from "../OpenSectionButton";
import ChipSlider from "../ChipSlider";
import Review from "../Review";
import InstallationProgress from "../InstallationProgress";
import useSanity from "../../shared/hooks/useSanity";
import { checkLocale } from "../../shared/helpers/languages";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
}

const ratingsData = [
  { stars: 5, rating: 70 },
  { stars: 4, rating: 15 },
  { stars: 3, rating: 10 },
  { stars: 2, rating: 1 },
  { stars: 1, rating: 3 },
];

const MainView: React.FC<Props> = ({ setView }) => {
  const intl = useIntl();
  const { data, urlFor } = useSanity(
    `appName, rating, countOfReviews, countOfDownloads, countOfReviewsFull, countOfStars, reviews, shortDescription`
  );

  if (!data) return null;

  const reviews =
    data.reviews.length > 3 ? data.reviews.slice(0, 3) : data.reviews;

  return (
    <div className="pt-5 px-6">
      <div className="flex mb-4">
        <AppLogo />
        <div className="flex flex-col text-[#00875F]">
          <div className="text-black text-[22px] leading-7 font-medium">
            {data?.appName ? data.appName : "Nine Casino"}
          </div>
          <InstallationProgress />
        </div>
      </div>
      <div className="flex mb-5">
        <div className="flex-1 flex flex-col justify-center items-center h-[44px]">
          <div className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-[5px]">
            {data?.rating}
            <StarIcon fontSize="inherit" />
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            {data?.countOfReviews ? data.countOfReviews : "21K"}
            {intl.formatMessage({
              id: "reviews",
              defaultMessage: "reviews",
            })}
          </div>
        </div>
        <Divider
          className="!p-0 !m-0"
          orientation="vertical"
          variant="inset"
          flexItem
        />
        <div className="flex-1 flex flex-col justify-center items-center h-[44px]">
          <div className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-[5px]">
            {data?.countOfDownloads}
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            {intl.formatMessage({
              id: "downloads",
              defaultMessage: "Donwloads",
            })}
          </div>
        </div>
        <Divider
          className="!p-0 !m-0"
          orientation="vertical"
          variant="inset"
          flexItem
        />
        <div className="flex-1 flex flex-col justify-center items-center h-[44px]">
          <div className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-[5px]">
            <div className="w-4 h-4 mb-0.5">
              <img src="/18.png" alt="Age icon" />
            </div>
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            {intl.formatMessage({ id: "age", defaultMessage: "Age" })}
          </div>
        </div>
      </div>
      <InstallButton appLink="/" />
      <ContentSlider />
      <div className="flex justify-between items-center mb-4">
        <OpenSectionButton
          id="about"
          defaultMessage="About this game"
          view="about"
          setView={setView}
        />
      </div>
      <div className="text-left leading-6 text-[#5f6368] font-normal text-[14px] mb-3">
        {data?.shortDescription[checkLocale()]}
      </div>
      <ChipSlider />
      <div className="flex justify-between items-center mb-4">
        <OpenSectionButton
          id="ratingsAndReviews"
          defaultMessage="Ratings and reviews"
          view="reviews"
          setView={setView}
        />
      </div>

      <div
        className="grid mb-6 gap-x-[2em]"
        style={{
          gridTemplateColumns: "auto 1fr",
          gridTemplateRows: "auto auto auto",
          gridTemplateAreas: `
      "rating-big rating-right"
      "rating-stars rating-right"
      "rating-count rating-right"
    `,
        }}
      >
        <div className="text-[45px]" style={{ gridArea: "rating-big" }}>
          {data?.rating}
        </div>
        <div className="flex mb-2" style={{ gridArea: "rating-stars" }}>
          <Rating
            name="half-rating-read"
            defaultValue={data.countOfStars}
            precision={0.1}
            readOnly
            sx={{ color: "rgb(0, 135, 95)", fontSize: "14px" }}
          />
        </div>
        <div
          className="font-medium text-[0.8em]"
          style={{ gridArea: "rating-count" }}
        >
          {data?.countOfReviewsFull}
        </div>
        <div
          className="flex flex-col gap-[0.25em]"
          style={{ gridArea: "rating-right" }}
        >
          {ratingsData.map((data, index) => (
            <div
              className="flex gap-[0.75em] justify-center items-center"
              key={index}
            >
              <div className="font-medium text-[0.8em] w-[0.5em]">
                {data.stars}
              </div>
              <div className="relative h-[0.5em] w-full bg-[#d9d9d9] rounded-[0.5em]">
                <div
                  className="absolute h-[0.5em] min-w-[0.5em] bg-[#00875f] rounded-[0.5em]"
                  style={{ width: `${data.rating || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {reviews.map((review) => {
          const parts = review.reviewDate.split("-");
          const formattedDate = `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
          return (
            <Review
              src={
                review.reviewAuthorIcon
                  ? urlFor(review.reviewAuthorIcon)
                  : undefined
              }
              key={review.reviewAuthorName}
              name={review.reviewAuthorName}
              avatarName={review.avatarTitle}
              color={review.reviewIconColor}
              stars={review.reviewAuthorRating}
              text={review.reviewText[checkLocale()]}
              date={formattedDate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MainView;
