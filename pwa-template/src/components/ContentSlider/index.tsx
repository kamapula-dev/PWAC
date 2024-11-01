import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useSanity from "../../shared/hooks/useSanity";

export default function ContentSlider() {
  const { data, urlFor } = useSanity("screens");

  if (!data) return null;

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
    <div className="slider-container mb-4">
      <Slider {...settings}>
        {data?.screens.map((screen, index) => {
          return (
            <div className="pr-2" key={index}>
              <img
                src={urlFor(screen)}
                width={360}
                height={720}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
                alt="Screen"
              />
            </div>
          );
        })}
      </Slider>
    </div>
  );
}
