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
import {
  DeveloperResponseContainer,
  DeveloperResponseDate,
  DeveloperResponseHeader,
  DeveloperResponseName,
  DeveloperResponseText,
  ReviewAuthorContainer,
  ReviewContainer,
  ReviewDataContainer,
  ReviewDate,
  ReviewHeader,
  ReviewText,
  ReviewWrapper,
} from "../styles";

interface ReviewProps {
  avatarName: string;
  name: string;
  color: string;
  stars: number;
  text: string;
  date: string;
  src?: string;
  developerResponse?: boolean;
  developerResponseText?: string;
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
  developerResponse,
  developerResponseText,
}) => {
  return (
    <ReviewWrapper>
      <ReviewContainer>
        <ReviewHeader>
          <Avatar src={src} sx={{ bgcolor: getAvatarColor(color) }}>
            {avatarName}
          </Avatar>
          <ReviewAuthorContainer>{name}</ReviewAuthorContainer>
        </ReviewHeader>
        <ReviewDataContainer>
          <Rating
            name="half-rating-read"
            defaultValue={stars}
            precision={1}
            readOnly
            sx={{ color: "rgb(11, 87, 207)", fontSize: "14px" }}
          />
          <ReviewDate>{date}</ReviewDate>
        </ReviewDataContainer>
        <ReviewText>{text}</ReviewText>
      </ReviewContainer>
      {developerResponse && (
        <DeveloperResponseContainer>
          <DeveloperResponseHeader>
            <DeveloperResponseName>MrBeast casino</DeveloperResponseName>
            <DeveloperResponseDate>{date}</DeveloperResponseDate>
          </DeveloperResponseHeader>
          <DeveloperResponseText>{developerResponseText}</DeveloperResponseText>
        </DeveloperResponseContainer>
      )}
    </ReviewWrapper>
  );
};

export default Review;
