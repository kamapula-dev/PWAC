import { Dispatch, SetStateAction } from "react";
import {
  HorizontalDivider,
  InstallWrapper,
  RatingsAndReviewsSection,
  RatingsAndReviewsWrapper,
  ViewAppContainer,
  ViewFooter,
} from "../styles";
import ViewHeader from "../ViewHeader";
import Review from "../Review";
import { useIntl } from "react-intl";
import InstallButton from "../InstallButton";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
}

const getDate = (decrement: number) => {
  const today = new Date();
  today.setDate(today.getDate() - decrement);

  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yy = String(today.getFullYear());

  return dd + "." + mm + "." + yy;
};

const reviewsData = [
  {
    name: "Watson",
    avatarName: "S",
    color: "blueGrey",
    stars: 5,
    reviewKey: "Watson",
    date: getDate(0),
    src: "https://play-lh.googleusercontent.com/a-/ALV-UjUitVOQZoEb-JkE5x-6fJfa9gGoZ82zB5DaLHXWldUkE3M=s32-rw",
    developerResponse: true,
    developerResponseText: "DeveloperResponseWatson",
  },
  {
    name: "Bibi",
    avatarName: "F",
    color: "blue",
    stars: 5,
    reviewKey: "Sheff816",
    date: getDate(0),
    developerResponse: true,
    developerResponseText: "DeveloperResponseSheff816",
  },
  {
    name: "Matthew",
    avatarName: "M",
    color: "deepPurple",
    stars: 4,
    reviewKey: "Matthew",
    date: getDate(1),
    src: "https://play-lh.googleusercontent.com/a-/ALV-UjUnmvE_tonNa6yGncMLT56DJk7EFjuOncgrj3ce2kv4_7g=s32-rw",
    developerResponse: true,
    developerResponseText: "DeveloperResponseMatthew",
  },
  {
    name: "MassesOfPalpur",
    avatarName: "M",
    color: "deepPurple",
    stars: 5,
    reviewKey: "Matthew",
    date: getDate(2),
    developerResponse: true,
    developerResponseText: "DeveloperResponseMassesOfPalpur",
  },
  {
    name: "Opposum",
    avatarName: "O",
    color: "green",
    stars: 4,
    reviewKey: "Opposum",
    date: getDate(2),
    developerResponse: false,
    developerResponseText: "",
  },
  {
    name: "Vindigo",
    avatarName: "V",
    color: "orange",
    stars: 4,
    reviewKey: "Vindigo",
    date: getDate(3),
    src: "https://play-lh.googleusercontent.com/a-/ALV-UjVmDNqO46bseaW5sRAS7_UuKDp4RFw9S816ZYvxqPV1lkc=s32-rw",
    developerResponse: false,
    developerResponseText: "",
  },
  {
    name: "i_DrmRR_i",
    avatarName: "I",
    color: "red",
    stars: 5,
    reviewKey: "i_DrmRR_i",
    date: getDate(3),
    src: "https://play-lh.googleusercontent.com/a-/ALV-UjUTauTiiGmOdHTcb8HXks-qFSoR7XYimGAl2mCtsXPnQA=s32-rw",
    developerResponse: false,
    developerResponseText: "",
  },
  {
    name: "Woger",
    avatarName: "W",
    color: "deepPurple",
    stars: 3,
    reviewKey: "Woger",
    date: getDate(5),
    developerResponse: false,
    developerResponseText: "",
  },
  {
    name: "Merora",
    avatarName: "W",
    color: "orange",
    stars: 5,
    reviewKey: "Merora",
    date: getDate(7),
    developerResponse: false,
    developerResponseText: "",
  },
  {
    name: "Anita",
    avatarName: "W",
    color: "brown",
    stars: 5,
    reviewKey: "Anita",
    date: getDate(10),
    developerResponse: false,
    developerResponseText: "",
  },
  {
    name: "GLEN",
    avatarName: "W",
    color: "blueGrey",
    stars: 4,
    reviewKey: "GLEN",
    date: getDate(12),
    developerResponse: false,
    developerResponseText: "",
  },
];

const ReviewsView: React.FC<Props> = ({ setView }) => {
  const intl = useIntl();
  return (
    <ViewAppContainer>
      <ViewHeader id="ratingsAndReviews" setView={setView} />
      <RatingsAndReviewsWrapper>
        <RatingsAndReviewsSection>
          {reviewsData.map((review) => {
            if (review.developerResponse) {
              return (
                <Review
                  src={review.src ? review.src : undefined}
                  key={review.name}
                  name={review.name}
                  avatarName={review.avatarName}
                  color={review.color}
                  stars={review.stars}
                  text={intl.formatMessage({ id: review.reviewKey })}
                  date={review.date}
                  developerResponse={review.developerResponse}
                  developerResponseText={intl.formatMessage({
                    id: review.developerResponseText,
                  })}
                />
              );
            } else {
              return (
                <Review
                  src={review.src ? review.src : undefined}
                  key={review.name}
                  name={review.name}
                  avatarName={review.avatarName}
                  color={review.color}
                  stars={review.stars}
                  text={intl.formatMessage({ id: review.reviewKey })}
                  date={review.date}
                />
              );
            }
          })}
        </RatingsAndReviewsSection>
      </RatingsAndReviewsWrapper>
      <HorizontalDivider style={{ paddingBottom: "3.5em" }} />
      <ViewFooter>
        <InstallWrapper>
          <InstallButton appLink="/" />
        </InstallWrapper>
      </ViewFooter>
    </ViewAppContainer>
  );
};

export default ReviewsView;
