import Avatar from "@mui/material/Avatar";
import { Rating } from "@mui/material";
import moment from "moment";

interface ReviewProps {
  name: string;
  stars: number;
  text: string;
  date: string;
  src?: string;
  reviewIconColor: string;
  devResponse?: string;
  developerName?: string;
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
}) => {
  const avatarName = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex gap-[14px] items-center mb-[10px]">
        <Avatar
          src={src}
          sx={{ bgcolor: `${reviewIconColor}` }}
          className="w-10 h-10"
        >
          {avatarName}
        </Avatar>
        <div className="font-roboto font-normal text-main text-[0.875rem] leading-[1.25rem]">
          {name}
        </div>
      </div>
      <div className="flex gap-[0.5em] items-center mb-2.5">
        <Rating
          name="half-rating-read"
          defaultValue={stars}
          precision={1}
          readOnly
          sx={{ color: "#1357CD", fontSize: "14px" }}
        />
        <div className="flex items-center text-[#605D64] text-xs ">
          {moment(date).format("DD.MM.YYYY")}
        </div>
      </div>
      <div
        className="font-normal text-sm leading-5 text-[#322F35] text-justify"
        style={{
          textOverflow: "ellipsis",
          letterSpacing: "0.0142857143em",
          overflowWrap: "anywhere",
        }}
      >
        {text}
      </div>
      {devResponse && developerName && (
        <div className="rounded bg-[#EBEBEB] px-3 py-3 flex flex-col gap-4 text-sm leading-4">
          <div className="flex justify-between">
            <div>{developerName}</div>
            <div> {moment(date).format("DD.MM.YYYY")}</div>
          </div>
          <div>{devResponse}</div>
        </div>
      )}
    </div>
  );
};

export default Review;
