import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Chip } from "@mui/material";
import { useIntl } from "react-intl";

const chipLabels = [
  { id: "casino", defaultMessage: "Casino" },
  { id: "slots", defaultMessage: "Slots" },
  { id: "online", defaultMessage: "Online" },
  { id: "offline", defaultMessage: "Offline" },
];

export default function ChipSlider() {
  const intl = useIntl();

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    variableWidth: true,
  };

  return (
    <div className="mb-4">
      <div className="slider-container">
        <Slider {...settings}>
          {chipLabels.map((labelKey) => (
            <div className="pr-3" key={labelKey.id}>
              <Chip
                label={intl.formatMessage({
                  id: labelKey.id,
                  defaultMessage: labelKey.defaultMessage,
                })}
                variant="outlined"
                sx={{
                  borderRadius: "8px",
                  border: "1px solid rgb(32, 33, 36)",
                }}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
