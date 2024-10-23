import Slider from "react-slick";
import { useMixpanel } from "react-mixpanel-browser";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Chip } from "@mui/material";
import { useIntl } from "react-intl";
import { ScreenWrapperItem, SliderContainer } from "../styles";

const chipLabels = [
  { id: "casino", defaultMessage: "Casino" },
  { id: "slots", defaultMessage: "Slots" },
  { id: "online", defaultMessage: "Online" },
  { id: "offline", defaultMessage: "Offline" },
  { id: "stylised", defaultMessage: "Stylised" },
];

export default function ChipSlider() {
  const intl = useIntl();
  const mixpanel = useMixpanel();

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    variableWidth: true,
  };

  const handleChipClick = (labelKey: string) => {
    if (mixpanel) {
      mixpanel.track("landing_btn_tag_pressed", {
        label: labelKey,
      });
    }
  };

  return (
    <SliderContainer>
      <div className="slider-container">
        <Slider {...settings}>
          {chipLabels.map((labelKey) => (
            <ScreenWrapperItem key={labelKey.id}>
              <Chip
                label={intl.formatMessage({
                  id: labelKey.id,
                  defaultMessage: labelKey.defaultMessage,
                })}
                onClick={() => handleChipClick(labelKey.id)}
                variant="outlined"
                sx={{
                  borderRadius: "8px",
                  border: "1px solid rgb(32, 33, 36)",
                }}
              />
            </ScreenWrapperItem>
          ))}
        </Slider>
      </div>
    </SliderContainer>
  );
}
