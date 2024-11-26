import { Avatar, Rate } from "antd";
import moment from "moment";

interface ReviewProps {
  name: string;
  stars: number;
  text: string;
  date: string;
  src?: string;
  iconColor?: string;
  devResponse?: string;
  developerName?: string;
}

const ReviewItem: React.FC<ReviewProps> = ({
  name,
  stars,
  text,
  date,
  src,
  iconColor,
  devResponse,
  developerName,
}) => {
  const avatarName = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-[0.8em] w-full">
        <div className="flex gap-[1em] items-center">
          <div className="rounded-full w-10 h-10 bg-gray-300">
            {!src ? (
              <Avatar
                style={{
                  backgroundColor: iconColor,
                }}
                className="w-10 h-10"
              >
                {avatarName}
              </Avatar>
            ) : (
              <img
                src={src}
                alt={name}
                className="rounded-full w-full h-full"
              />
            )}
          </div>
          <div className="font-roboto font-normal text-main text-[0.875rem] leading-[1.25rem]">
            {name}
          </div>
        </div>
        <div className="flex gap-[0.5em] items-center">
          <Rate
            value={stars}
            style={{ color: "#1357CD", fontSize: "14px" }}
            disabled
          />
          <div className="leading-4 text-xs">
            {moment(date).format("DD.MM.YYYY")}
          </div>
        </div>
        <div
          className="font-roboto font-normal text-secondary text-sm leading-5"
          style={{
            textOverflow: "ellipsis",
            letterSpacing: "0.0142857143em",
            overflowWrap: "anywhere",
          }}
        >
          {text}
        </div>
      </div>
      {devResponse && developerName && (
        <div className="rounded bg-[#EBEBEB] px-3 py-3 flex flex-col gap-4 text-sm leading-5">
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

export default ReviewItem;
