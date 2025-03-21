import Avatar from "@mui/material/Avatar";
import { Rating } from "@mui/material";
import moment from "moment";
import DotsIcon from "../../shared/icons/DotsIcon";
import { useIntl } from "react-intl";
import { BeforeInstallPromptEvent } from "../../App";
import { PwaContent } from "../../shared/models";
import useInstallPwaInstall from "../../shared/useInstallPwa";

interface ReviewProps {
  name: string;
  stars: number;
  text: string;
  date: string;
  src?: string;
  reviewIconColor: string;
  devResponse?: string;
  developerName?: string;
  dark: boolean;
  keepActualDateOfReviews?: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  pwaContent: PwaContent;
  mainThemeColor?: string;
}

const Review: React.FC<ReviewProps> = ({
  name,
  reviewIconColor,
  stars,
  text,
  date,
  src,
  devResponse,
  developerName,
  dark,
  keepActualDateOfReviews = false,
  installPrompt,
  pwaContent,
  mainThemeColor,
}) => {
  const avatarName = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const actualDate = keepActualDateOfReviews ? date : new Date().toISOString();
  const intl = useIntl();

  const { installPWA } = useInstallPwaInstall(
    installPrompt,
    pwaContent?.pixel,
    pwaContent?._id,
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between">
        <div className="flex gap-[14px] items-center mb-[10px]">
          <Avatar
            src={src}
            sx={{ bgcolor: `${reviewIconColor}` }}
            className="w-10 h-10"
          >
            {avatarName}
          </Avatar>
          <div
            style={dark ? { color: "#DFDFDF" } : {}}
            className="font-roboto font-normal text-main text-[0.875rem] leading-[1.25rem]"
          >
            {name}
          </div>
        </div>
        <div onClick={installPWA} className="cursor-pointer">
          <DotsIcon dark={dark} />
        </div>
      </div>
      <div className="flex gap-[0.5em] items-center mb-2.5">
        <Rating
          name="half-rating-read"
          defaultValue={stars}
          precision={1}
          readOnly
          sx={{
            color: mainThemeColor || (dark ? "#A8C8FB" : "#1357CD"),
            fontSize: "14px",
          }}
        />
        <div
          style={dark ? { color: "#DFDFDF" } : {}}
          className="flex items-center text-[#605D64] text-xs "
        >
          {moment(actualDate).format("DD.MM.YYYY")}
        </div>
      </div>
      <div
        className="font-normal text-sm leading-5 text-[#322F35] text-justify"
        style={{
          textOverflow: "ellipsis",
          letterSpacing: "0.0142857143em",
          overflowWrap: "anywhere",
          ...(dark && { color: "#DFDFDF" }),
        }}
      >
        {text}
      </div>
      <div className="flex justify-between items-center">
        <p
          className="text-[#4B4B4B] leading-6 text-xs"
          style={
            dark
              ? {
                  color: "#DFDFDF",
                }
              : {}
          }
        >
          {intl.formatMessage({
            id: "wasTheReviewHelpful",
            defaultMessage: "Was the review helpful?",
          })}
        </p>
        <div className="flex gap-[9px]">
          <button
            onClick={installPWA}
            className="py-1 px-4 border border-solid border-[#C5C5C5] rounded-lg bg-transparent active:bg-[#c3e7ff] active:border-transparent transition-colors duration-200"
            style={
              dark
                ? {
                    border: "1px solid #DFDFDF",
                    color: "#DFDFDF",
                  }
                : {}
            }
          >
            {intl.formatMessage({
              id: "yes",
              defaultMessage: "Yes",
            })}
          </button>
          <button
            className="py-1 px-4 border border-solid border-[#C5C5C5] rounded-lg bg-transparent active:bg-[#c3e7ff] active:border-transparent transition-colors duration-200"
            onClick={installPWA}
            style={
              dark
                ? {
                    border: "1px solid #DFDFDF",
                    color: "#DFDFDF",
                  }
                : {}
            }
          >
            {intl.formatMessage({
              id: "no",
              defaultMessage: "No",
            })}
          </button>
        </div>
      </div>
      {devResponse && developerName && (
        <div
          style={
            dark ? { background: "rgb(48, 48, 48)", color: "#DFDFDF" } : {}
          }
          className="rounded bg-[#EBEBEB] px-3 py-3 flex flex-col gap-4 text-sm leading-4"
        >
          <div className="flex justify-between">
            <div>{developerName}</div>
            <div> {moment(actualDate).format("DD.MM.YYYY")}</div>
          </div>
          <div>{devResponse}</div>
        </div>
      )}
    </div>
  );
};

export default Review;
