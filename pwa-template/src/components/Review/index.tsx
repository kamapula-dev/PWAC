import Avatar from "@mui/material/Avatar";
import { Rating } from "@mui/material";

interface ReviewProps {
  name: string;
  stars: number;
  text: string;
  date: string;
  src?: string;
  reviewIconColor: string;
}

const Review: React.FC<ReviewProps> = ({
  name,
  reviewIconColor,
  stars,
  text,
  date,
  src,
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
          <Avatar src={src} sx={{ bgcolor: `${reviewIconColor}` }}>
            {avatarName}
          </Avatar>
          <div className="font-roboto font-normal text-main text-[0.875rem] leading-[1.25rem]">
            {name}
          </div>
        </div>
        <div className="flex gap-[0.5em] items-center">
          <Rating
            name="half-rating-read"
            defaultValue={stars}
            precision={1}
            readOnly
            sx={{ color: "rgb(0, 135, 95)", fontSize: "14px" }}
          />
          <div className="leading-[1rem] text-[0.75em]">{date}</div>
        </div>
        <div
          className="font-roboto font-normal text-secondary text-justify text-[0.875rem] leading-[1.25rem]"
          style={{
            textOverflow: "ellipsis",
            letterSpacing: "0.0142857143em",
            overflowWrap: "anywhere",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default Review;
