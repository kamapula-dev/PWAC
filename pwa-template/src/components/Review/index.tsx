import Avatar from "@mui/material/Avatar";
import {
  deepOrange,
  red,
  brown,
  blueGrey,
  deepPurple,
  green,
  blue,
} from "@mui/material/colors";
import { Rating } from "@mui/material";

interface ReviewProps {
  avatarName: string;
  name: string;
  color: string;
  stars: number;
  text: string;
  date: string;
  src?: string;
}

const getAvatarColor = (color: string) => {
  switch (color) {
    case "orange":
      return deepOrange[500];
    case "red":
      return red[500];
    case "brown":
      return brown[500];
    case "blueGrey":
      return blueGrey[500];
    case "deepPurple":
      return deepPurple[500];
    case "green":
      return green[500];
    case "blue":
      return blue[500];
    default:
      return brown[500];
  }
};

const Review: React.FC<ReviewProps> = ({
  avatarName,
  name,
  color,
  stars,
  text,
  date,
  src,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-[0.8em] w-full">
        <div className="flex gap-[1em] items-center">
          <Avatar src={src} sx={{ bgcolor: getAvatarColor(color) }}>
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
