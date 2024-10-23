import Slider from "react-slick";
import { useMixpanel } from "react-mixpanel-browser";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import firstScreen from "../../images/firstScreen.webp";
import secondScreen from "../../images/secondScreen.webp";
import thirdScreen from "../../images/thirdScreen.webp";
import fourthScreen from "../../images/fourthScreen.webp";
import { ScreenContainer, ScreenWrapperItem, SliderContainer } from "../styles";

export default function ContentSlider() {
  const mixpanel = useMixpanel();

  const handleScreenshotClick = (screenName: string) => {
    if (mixpanel) {
      mixpanel.track("landing_screenshots_tapped", {
        "Screen Name": screenName,
      });
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
    ],
  };
  return (
    <SliderContainer>
      <div className="slider-container">
        <Slider {...settings}>
          <ScreenWrapperItem
            onClick={() => handleScreenshotClick("First Screen")}
          >
            <ScreenContainer>
              <img
                src={firstScreen}
                width={360}
                height={720}
                alt="First screen"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </ScreenContainer>
          </ScreenWrapperItem>

          <ScreenWrapperItem
            onClick={() => handleScreenshotClick("Second Screen")}
          >
            <ScreenContainer>
              <img
                src={secondScreen}
                width={360}
                height={720}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
                alt="Second screen"
              />
            </ScreenContainer>
          </ScreenWrapperItem>

          <ScreenWrapperItem
            onClick={() => handleScreenshotClick("Third Screen")}
          >
            <ScreenContainer>
              <img
                src={thirdScreen}
                width={360}
                height={720}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
                alt="Third screen"
              />
            </ScreenContainer>
          </ScreenWrapperItem>

          <ScreenWrapperItem
            onClick={() => handleScreenshotClick("Fourth Screen")}
          >
            <ScreenContainer>
              <img
                src={fourthScreen}
                width={360}
                height={720}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
                alt="Fourth screen"
              />
            </ScreenContainer>
          </ScreenWrapperItem>
        </Slider>
      </div>
    </SliderContainer>
  );
}
