import { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import AppLogo from "../AppLogo";
import { Rating } from "@mui/material";
import InstallButton from "../InstallButton";
import ContentSlider from "../ContentSlider";
import OpenSectionButton from "../OpenSectionButton";
import TagsSlider from "../TagsSlider";
import Review from "../Review";
import InstallationProgress from "../InstallationProgress";
import { PwaContent } from "../../shared/models";
import ArrowLeft from "../../shared/icons/ArrowLeft";
import StarIcon from "../../shared/icons/StarIcon";
import { motion } from "framer-motion";
import { BeforeInstallPromptEvent } from "../../App";
import DotsIcon from "../../shared/icons/DotsIcon";
import InfoIcon from "../../shared/icons/InfoIcon";
import DownloadIcon from "../../shared/icons/DownloadIcon";
import StopIcon from "../../shared/icons/StopIcon";
import DataCollecting from "../../shared/icons/DataCollecting";
import ThirdPartyIcon from "../../shared/icons/ThirdParty";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  pwaContent: PwaContent;
  installPrompt: BeforeInstallPromptEvent | null;
  dark: boolean;
}

const MainView: React.FC<Props> = ({
  setView,
  pwaContent,
  installPrompt,
  dark,
}) => {
  const intl = useIntl();

  const slideVariants = {
    visible: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  const reviews =
    pwaContent.reviews.length > 3
      ? pwaContent.reviews.slice(0, 3)
      : pwaContent.reviews;

  return (
    <motion.div
      style={dark ? { background: "#131313" } : {}}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={slideVariants}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <div className="h-11 pl-[18px] flex items-center justify-between mb-2.5">
        <ArrowLeft dark={dark} />
        <DotsIcon dark={dark} />
      </div>
      <div className="px-4 pb-[30px]">
        <div className="flex mb-4">
          <AppLogo logoUrl={pwaContent.appIcon} />
          <div className="flex flex-col">
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-black text-[22px] leading-7 font-medium"
            >
              {pwaContent.appName}
            </div>
            <InstallationProgress
              dark={dark}
              hasPaidContent={pwaContent.hasPaidContentTitle}
              developerName={pwaContent.developerName}
              isVerified={pwaContent.verified}
            />
          </div>
        </div>
        <div
          style={{ overflowX: "auto" }}
          className="flex items-center mb-5 no-scrollbar"
        >
          <div
            style={{
              minWidth: "156px",
            }}
            className="flex-1 flex flex-col justify-center items-center h-10"
          >
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="font-medium text-sm text-[#020202] flex gap-0.5 items-center justify-center"
            >
              {pwaContent.countOfStars}
              <StarIcon dark={dark} />
            </div>
            <div
              style={{
                width: "max-content",
                ...(dark && { color: "#DFDFDF" }),
              }}
              className="text-xs text-[#605D64] flex items-center font-medium"
            >
              {pwaContent.countOfReviews}
              {intl.formatMessage({
                id: "reviews",
                defaultMessage: "reviews",
              })}
              &nbsp;
              <InfoIcon dark={dark} />
            </div>
          </div>
          <div
            style={{ minWidth: "1px" }}
            className="h-[22px] bg-[#C4C4C4] w-px"
          />
          <div
            style={{ minWidth: "126px" }}
            className="flex-1 flex flex-col justify-center items-center h-[44px]"
          >
            <DownloadIcon dark={dark} />
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-xs text-[#605D64] font-medium"
            >
              {pwaContent.size.toUpperCase()}
            </div>
          </div>
          <div
            style={{ minWidth: "1px" }}
            className="h-[22px] bg-[#C4C4C4] w-px"
          />
          <div
            style={{ minWidth: "126px" }}
            className="flex-1 flex flex-col justify-center items-center h-[44px]"
          >
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="font-medium text-sm text-[#030303] items-center justify-center"
            >
              {pwaContent.countOfDownloads}
            </div>
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-xs text-[#605D64] font-medium"
            >
              {intl.formatMessage({
                id: "downloads",
                defaultMessage: "Downloads",
              })}
            </div>
          </div>
          <div
            style={{ minWidth: "1px" }}
            className="h-[22px] bg-[#C4C4C4] w-px"
          />
          <div
            style={{ minWidth: "126px" }}
            className="flex-1 flex flex-col justify-center items-center h-[44px]"
          >
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-[5px]"
            >
              <div
                style={dark ? { border: "1px solid #DFDFDF" } : {}}
                className="h-4 mb-0. border border-solid border-black flex items-center justify-center text-xs font-bold"
              >
                {pwaContent.age}
              </div>
            </div>
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-xs text-[#605D64] flex items-center font-medium"
            >
              {intl.formatMessage({ id: "age", defaultMessage: "Age" })}&nbsp;
              <InfoIcon dark={dark} />
            </div>
          </div>
        </div>
        <InstallButton
          id={pwaContent._id}
          dark={dark}
          pixel={pwaContent?.pixel}
          appLink="/"
          installPrompt={installPrompt}
        />
        <ContentSlider pwaContent={pwaContent} />
        <div className="mb-4">
          <OpenSectionButton
            dark={dark}
            id="about"
            defaultMessage="About this game"
            view="about"
            setView={setView}
          />
        </div>
        <div
          style={dark ? { color: "#DFDFDF" } : {}}
          className="text-left leading-5 text-[#605D64] font-normal text-sm mb-4"
        >
          {pwaContent.shortDescription}
        </div>
        <TagsSlider dark={dark} tags={pwaContent.tags} />
        <div className="flex justify-between items-center mb-5">
          <OpenSectionButton
            dark={dark}
            id="ratingsAndReviews"
            defaultMessage="Ratings and reviews"
            view="reviews"
            setView={setView}
          />
        </div>
        <div
          style={dark ? { color: "#DFDFDF" } : {}}
          className="mb-3 text-[#605D64] text-xs leading-[17px]"
        >
          {intl.formatMessage({
            id: "ratesAndReviewsAreVerified",
            defaultMessage:
              "Ratings and reviews are verified. They were left by users with the same type of device as yours.",
          })}
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
          <div
            className="text-[45px] leading-[52px]"
            style={{
              gridArea: "rating-big",
              ...(dark && { color: "#DFDFDF" }),
            }}
          >
            {pwaContent.countOfStars}
          </div>
          <div className="flex" style={{ gridArea: "rating-stars" }}>
            <Rating
              name="half-rating-read"
              defaultValue={pwaContent.countOfStars}
              precision={0.1}
              readOnly
              sx={{
                color: dark ? "#A8C8FB" : "#1357CD",
                fontSize: "12px",
                maxHeight: "14px",
              }}
            />
          </div>
          <div
            className="font-medium text-xs leading-4 flex"
            style={{
              gridArea: "rating-count",
              ...(dark && { color: "#DFDFDF" }),
            }}
          >
            {pwaContent.countOfReviewsFull}
          </div>
          <div
            className="flex flex-col gap-[0.25em]"
            style={{ gridArea: "rating-right" }}
          >
            {pwaContent.sliders.map((data, index) => (
              <div
                className="flex gap-[0.75em] justify-center items-center"
                key={index}
              >
                <div
                  style={dark ? { color: "#DFDFDF" } : {}}
                  className="font-medium text-xs"
                >
                  {5 - index}
                </div>
                <div
                  style={dark ? { background: "#303030" } : {}}
                  className="relative h-2 w-full bg-[#d9d9d9] rounded-[0.5em]"
                >
                  <div
                    className="absolute h-[0.5em] min-w-[0.1em] bg-[#1357CD] rounded-[0.5em]"
                    style={{
                      width: `${(data * 100) / 5 || 0}%`,
                      ...(dark && { background: "#A8C8FB" }),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[22px] mb-[19px]">
          {reviews.map((review) => {
            return (
              <Review
                dark={dark}
                reviewIconColor={review.reviewIconColor}
                src={review.reviewAuthorIcon}
                key={review.reviewAuthorName}
                name={review.reviewAuthorName}
                stars={review.reviewAuthorRating}
                text={review.reviewText}
                date={review.reviewDate}
                devResponse={review.devResponse}
                developerName={pwaContent.developerName}
                keepActualDateOfReviews={pwaContent.keepActualDateOfReviews}
              />
            );
          })}
        </div>
        <button
          onClick={() => setView("reviews")}
          style={dark ? { color: "#A8C8FB" } : {}}
          className="text-[#1357CD] font-medium leading-5 text-xs mb-[30px]"
        >
          {intl.formatMessage({
            id: "allReviews",
            defaultMessage: "All reviews",
          })}
        </button>
        {pwaContent.securityUI && (
          <>
            <div className="flex justify-between items-center cursor-pointer mb-3">
              <span
                style={dark ? { color: "#DFDFDF" } : {}}
                className="text-[#605D64] leading-6 font-medium text-base"
              >
                {intl.formatMessage({
                  id: "dataSecurity",
                  defaultMessage: "Data security",
                })}
              </span>
            </div>
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-[#605D64] text-[13px] leading-4 mb-[14px]"
            >
              {intl.formatMessage({
                id: "safetyContent",
              })}
            </div>
            <div className="rounded-lg border border-solid border-[#E6E0E9] pt-5 pl-5 pr-3 pb-5">
              <div className="flex flex-col gap-4 mb-[23px]">
                <div className="flex gap-4">
                  <ThirdPartyIcon dark={dark} />
                  <div
                    style={dark ? { color: "#DFDFDF" } : {}}
                    className="text-[#605D64] text-[13px] leading-4"
                  >
                    {intl.formatMessage({
                      id: "thirdParty",
                    })}
                    <span className="text-[11px]">
                      {" "}
                      {intl.formatMessage({
                        id: "locationDisclosure",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <DataCollecting dark={dark} />
                  <div
                    style={dark ? { color: "#DFDFDF" } : {}}
                    className="text-[#605D64] text-[13px] leading-4"
                  >
                    <div>
                      {intl.formatMessage({
                        id: "noDataCollected",
                      })}
                    </div>
                    <div className="text-[11px]">
                      {intl.formatMessage({
                        id: "learnMore",
                      })}{" "}
                      <span className="underline cursor-pointer">
                        {intl.formatMessage({
                          id: "developerDataCollection",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <StopIcon dark={dark} />
                  <div
                    style={dark ? { color: "#DFDFDF" } : {}}
                    className="text-[#605D64] text-[13px] leading-4"
                  >
                    {intl.formatMessage({
                      id: "dataNotEncrypted",
                    })}
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <StopIcon dark={dark} />
                  <div
                    style={dark ? { color: "#DFDFDF" } : {}}
                    className="text-[#605D64] text-[13px] leading-4"
                  >
                    {intl.formatMessage({
                      id: "dataCanNotBeDeleted",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MainView;
