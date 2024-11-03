import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Chip } from "@mui/material";
import { PwaContent } from "../../shared/models";

const ChipSlider = ({ pwaContent }: { pwaContent: PwaContent }) => {
  const settings = {
    dots: false,
    infinite: false,
    slidesToScroll: 1,
    initialSlide: 0,
    variableWidth: true,
  };

  if (!pwaContent.tags || pwaContent.tags.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="slider-container w-full">
        <Slider {...settings}>
          {pwaContent?.tags?.map((label) => (
            <div className="pr-3" key={label}>
              <Chip
                label={label}
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
};

export default ChipSlider;
