import { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import AppLogo from "../AppLogo";
import StarIcon from "@mui/icons-material/Star";
import { Rating } from "@mui/material";
import {
  MainContainer,
  AppDescriptionSection,
  AppNameContainer,
  AppHeader,
  AppHeaderInfoContainer,
  AppStatisticsCard,
  AppStatisticsCardItem,
  VerticalDivider,
  AppStatisticsCardItemTitle,
  AppStatisticsCardItemContent,
  AgeLogoContainer,
  AboutGameContainer,
  ShortDescriptionWrapper,
  AppRateContainer,
  AppRatesAndSection,
  AppRatesAndReviewsContainer,
  AppStarsContainer,
  AppRatesCountContainer,
  AppRatingContainer,
  RatingContainer,
  StarsCount,
  RatingChart,
  ReviewsSection,
  AgeImg,
} from "../styles";
import InstallButton from "../InstallButton";
import ContentSlider from "../ContentSlider";
import OpenSectionButton from "../OpenSectionButton";
import ChipSlider from "../ChipSlider";
import Review from "../Review";
import InstallationProgess from "../InstallationProgress";
import RateApp from "../RateApp";

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
];

const ratingsData = [
  { stars: 5, rating: 70 },
  { stars: 4, rating: 15 },
  { stars: 3, rating: 10 },
  { stars: 2, rating: 1 },
  { stars: 1, rating: 3 },
];

const MainView: React.FC<Props> = ({ setView }) => {
  const intl = useIntl();

  return (
    <MainContainer>
      <AppDescriptionSection>
        <AppHeader>
          <AppLogo />
          <AppHeaderInfoContainer>
            <AppNameContainer>MrBeast casino</AppNameContainer>
            <InstallationProgess />
          </AppHeaderInfoContainer>
        </AppHeader>
        <AppStatisticsCard>
          <AppStatisticsCardItem>
            <AppStatisticsCardItemTitle>
              4.8 <StarIcon fontSize="inherit" />
            </AppStatisticsCardItemTitle>
            <AppStatisticsCardItemContent>
              {intl.formatMessage({
                id: "reviews",
                defaultMessage: "21K reviews",
              })}
            </AppStatisticsCardItemContent>
          </AppStatisticsCardItem>
          <VerticalDivider orientation="vertical" variant="inset" flexItem />
          <AppStatisticsCardItem>
            <AppStatisticsCardItemTitle>119К+</AppStatisticsCardItemTitle>
            <AppStatisticsCardItemContent>
              {intl.formatMessage({
                id: "downloads",
                defaultMessage: "Downloads",
              })}
            </AppStatisticsCardItemContent>
          </AppStatisticsCardItem>
          <VerticalDivider orientation="vertical" variant="inset" flexItem />
          <AppStatisticsCardItem>
            <AppStatisticsCardItemTitle>
              <AgeLogoContainer>
                <AgeImg src="/18.png" alt="Age icon" />
              </AgeLogoContainer>
            </AppStatisticsCardItemTitle>
            <AppStatisticsCardItemContent>
              {intl.formatMessage({ id: "age", defaultMessage: "Age" })}
            </AppStatisticsCardItemContent>
          </AppStatisticsCardItem>
        </AppStatisticsCard>
        <InstallButton appLink="/" />
        <ContentSlider />
        <AboutGameContainer>
          <OpenSectionButton
            mixPanelEvent="landing_btn_aboutApp_pressed"
            id="about"
            defaultMessage="About this game"
            view="about"
            setView={setView}
          />
        </AboutGameContainer>
        <ShortDescriptionWrapper>
          {intl.formatMessage({
            id: "shortDescription",
            defaultMessage:
              "DON'T MISS A CHANCE - WIN $100,000 MrBeast casino is in touch!",
          })}
          <br />
          <br />
          {intl.formatMessage({
            id: "shortDescriptionSecondParagraph",
            defaultMessage: "Download the app and get £2500 Bonus.",
          })}
          <br />
          <br />
          {intl.formatMessage({
            id: "shortDescriptionThirdParagraph",
            defaultMessage:
              "Get 250 FREE SPINS, 250 free tries to win JACKPOT.",
          })}
          <br />
          <br />
          {intl.formatMessage({
            id: "shortDescriptionFourthParagraph",
            defaultMessage:
              "My team created this casino, where we simply give hundreds of millions of dollars to anyone who wishes!",
          })}
        </ShortDescriptionWrapper>
        <ChipSlider />
        <AboutGameContainer>
          <OpenSectionButton
            mixPanelEvent="landing_btn_ratingsApp_pressed"
            id="ratingsAndReviews"
            defaultMessage="Ratings and reviews"
            view="reviews"
            setView={setView}
          />
        </AboutGameContainer>
      </AppDescriptionSection>

      <AppRatesAndSection>
        <AppRatesAndReviewsContainer>
          <AppRateContainer>4.8</AppRateContainer>
          <AppStarsContainer>
            <Rating
              name="half-rating-read"
              defaultValue={4.6}
              precision={0.1}
              readOnly
              sx={{ color: "rgb(11, 87, 207)", fontSize: "14px" }}
            />
          </AppStarsContainer>
          <AppRatesCountContainer>21,301</AppRatesCountContainer>
          <AppRatingContainer>
            {ratingsData.map((data, index) => (
              <RatingContainer key={index}>
                <StarsCount>{data.stars}</StarsCount>
                <RatingChart rating={data.rating} />
              </RatingContainer>
            ))}
          </AppRatingContainer>
        </AppRatesAndReviewsContainer>
        <RateApp />
      </AppRatesAndSection>
      <ReviewsSection>
        {reviewsData.map((review) => (
          <Review
            src={review.src ? review.src : undefined}
            key={review.name}
            name={review.name}
            avatarName={review.avatarName}
            color={review.color}
            stars={review.stars}
            text={intl.formatMessage({ id: review.reviewKey })}
            date={review.date}
            developerResponse
            developerResponseText={intl.formatMessage({
              id: review.developerResponseText,
            })}
          />
        ))}
      </ReviewsSection>
    </MainContainer>
  );
};

export default MainView;
