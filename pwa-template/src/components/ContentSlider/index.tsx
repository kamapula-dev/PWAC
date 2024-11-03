import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { PwaContent } from "../../shared/models";

interface Props {
  pwaContent: PwaContent;
}

const ContentSlider: React.FC<Props> = ({ pwaContent }) => {
  const settings = {
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3.5,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
    ],
  };
  return (
    <div className="slider-container  mb-4">
      <Slider {...settings}>
        {pwaContent.images.map((screen, index) => {
          return (
            <div className="pr-1" key={index}>
              <img
                src={screen.url}
                width={82}
                height={176}
                className="object-cover w-[82px] h-[176px] rounded-lg"
                alt="Screen"
              />
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default ContentSlider;
