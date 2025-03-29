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
import InfoIcon from "../../shared/icons/InfoIcon";
import DownloadIcon from "../../shared/icons/DownloadIcon";
import StopIcon from "../../shared/icons/StopIcon";
import DataCollecting from "../../shared/icons/DataCollecting";
import ThirdPartyIcon from "../../shared/icons/ThirdParty";
import useInstallPwaInstall from "../../shared/useInstallPwa";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  pwaContent: PwaContent;
  installPrompt: BeforeInstallPromptEvent | null;
  dark: boolean;
  mainThemeColor?: string;
}

const MainView: React.FC<Props> = ({
  setView,
  pwaContent,
  installPrompt,
  dark,
  mainThemeColor,
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

  const { installPWA } = useInstallPwaInstall(
    installPrompt,
    pwaContent?.pixel,
    pwaContent?._id,
  );

  return (
    <motion.div
      style={dark ? { background: "#131313" } : {}}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={slideVariants}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <div
        className={`h-11 pl-[18px] flex items-center justify-between ${pwaContent?.testDesign ? "mt-2.5 mb-7" : "mb-2.5"}`}
      >
        {pwaContent?.testDesign ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
            <svg
              width="30"
              height="30"
              className="kOqhQd"
              aria-hidden="true"
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0,0h40v40H0V0z"></path>
              <g>
                <path
                  d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z"
                  fill="#EA4335"
                ></path>
                <path
                  d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z"
                  fill="#FBBC04"
                ></path>
                <path
                  d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z"
                  fill="#34A853"
                ></path>
              </g>
            </svg>

            <img
              style={{ width: "100px", height: "auto" }}
              src="data:image/png;base64,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"
            />

            <img
              style={{
                height: "26px",
                marginLeft: "auto",
                marginRight: "18px",
              }}
              src="data:image/png;base64,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"
            />
          </div>
        ) : (
          <div onClick={installPWA}>
            <ArrowLeft dark={dark} />
          </div>
        )}
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
              testDesign={pwaContent?.testDesign}
              mainThemeColor={pwaContent?.mainThemeColor}
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
              minWidth: pwaContent?.testDesign ? "126px" : "156px",
            }}
            className="flex-1 flex flex-col justify-center items-center h-10"
          >
            <div
              style={
                pwaContent?.testDesign
                  ? { color: "#605D64" }
                  : dark
                    ? { color: "#DFDFDF" }
                    : {}
              }
              className="font-medium text-sm text-[#020202] flex gap-0.5 items-center justify-center"
            >
              {pwaContent.countOfStars}
              {pwaContent?.testDesign ? (
                <StarIcon
                  colour={"#605D64"}
                  width="10px"
                  height="10px"
                  dark={dark}
                />
              ) : (
                <StarIcon dark={dark} />
              )}
            </div>
            <div
              style={{
                width: "max-content",
                ...(dark && { color: "#DFDFDF" }),
              }}
              className="text-xs text-[#605D64] flex items-center font-medium"
            >
              {pwaContent.countOfReviews}{" "}
              {intl.formatMessage({
                id: "reviews",
                defaultMessage: "reviews",
              })}
              &nbsp;
              {!pwaContent?.testDesign && <InfoIcon dark={dark} />}
            </div>
          </div>
          <div
            style={{
              minWidth: "1px",
              ...(pwaContent?.testDesign && {
                backgroundColor: "rgb(60,64,67)",
              }),
            }}
            className="h-[22px] bg-[#C4C4C4] w-px"
          />
          <div
            style={{ minWidth: "126px" }}
            className="flex-1 flex flex-col justify-center items-center h-[44px]"
          >
            {pwaContent?.testDesign ? (
              <DownloadIcon width="12px" height="12px" dark={dark} />
            ) : (
              <DownloadIcon dark={dark} />
            )}
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-xs text-[#605D64] font-medium"
            >
              {pwaContent.size.toUpperCase()}
            </div>
          </div>
          {!pwaContent?.testDesign && (
            <div
              style={{
                minWidth: "1px",
                ...(!!pwaContent?.testDesign && {
                  backgroundColor: "rgb(60,64,67)",
                }),
              }}
              className="h-[22px] bg-[#C4C4C4] w-px"
            />
          )}
          {!pwaContent?.testDesign && (
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
          )}

          <div
            style={{
              minWidth: "1px",
              ...(!!pwaContent?.testDesign && {
                backgroundColor: "rgb(60,64,67)",
              }),
            }}
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
              {pwaContent?.testDesign ? (
                <img
                  style={{ height: "12px" }}
                  src="data:image/png;base64,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"
                />
              ) : (
                <div
                  style={dark ? { border: "1px solid #DFDFDF" } : {}}
                  className="p1 h-4 mb-0. border border-solid border-black flex items-center justify-center text-xs font-bold"
                >
                  {pwaContent.age}
                </div>
              )}
            </div>
            <div
              style={dark ? { color: "#DFDFDF" } : {}}
              className="text-xs text-[#605D64] flex items-center font-medium"
            >
              {intl.formatMessage({ id: "age", defaultMessage: "Age" })}&nbsp;
              {!pwaContent?.testDesign && <InfoIcon dark={dark} />}
            </div>
          </div>
        </div>
        <InstallButton
          mainThemeColor={pwaContent?.mainThemeColor}
          installButtonTextColor={pwaContent?.installButtonTextColor}
          id={pwaContent._id}
          dark={dark}
          pixel={pwaContent?.pixel}
          appLink="/"
          installPrompt={installPrompt}
        />
        <ContentSlider pwaContent={pwaContent} />
        <div className="mb-4">
          <OpenSectionButton
            testDesign={pwaContent?.testDesign}
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
        <TagsSlider
          testDesign={pwaContent?.testDesign}
          dark={dark}
          tags={pwaContent.tags}
        />
        <div className="flex justify-between items-center mb-5">
          <OpenSectionButton
            testDesign={pwaContent?.testDesign}
            dark={dark}
            id="ratingsAndReviews"
            defaultMessage="Ratings and reviews"
            view="reviews"
            setView={setView}
          />
        </div>

        {!pwaContent?.testDesign && (
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
        )}

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
                color: mainThemeColor || (dark ? "#A8C8FB" : "#1357CD"),
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
            {pwaContent.countOfReviewsFull}{" "}
            {intl.formatMessage({
              id: "reviews",
              defaultMessage: "reviews",
            })}
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
                      background:
                        mainThemeColor || (dark ? "#A8C8FB" : undefined),
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
                installPrompt={installPrompt}
                pwaContent={pwaContent}
                mainThemeColor={mainThemeColor}
              />
            );
          })}
        </div>
        <button
          onClick={() => setView("reviews")}
          style={{ color: mainThemeColor || (dark ? "#A8C8FB" : undefined) }}
          className="text-[#1357CD] font-medium leading-5 text-xs mb-[30px]"
        >
          {pwaContent?.testDesign
            ? intl.formatMessage({
                id: "seeAllReviews",
                defaultMessage: "See all reviews",
              })
            : intl.formatMessage({
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
              <div
                style={pwaContent?.testDesign ? { marginBottom: "0px" } : {}}
                className="flex flex-col gap-4 mb-[23px]"
              >
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
                      <span
                        className="underline cursor-pointer"
                        onClick={installPWA}
                      >
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
                {!pwaContent?.testDesign && (
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
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MainView;
