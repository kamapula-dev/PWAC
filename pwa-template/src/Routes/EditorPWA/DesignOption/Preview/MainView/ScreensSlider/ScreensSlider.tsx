import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { Picture } from "@models/pwa";

interface ScreensSliderProps {
  screens: Picture[];
}

const ScreensSlider: React.FC<ScreensSliderProps> = ({ screens }) => {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={"auto"}
      freeMode={true}
      className="mb-6"
      grabCursor={true}
    >
      {screens.map((screen, index) => (
        <SwiperSlide key={index} style={{ width: "94px", height: "167px" }}>
          <div className="bg-gray-300 rounded-lg flex-shrink-0 w-full h-full">
            {screen.url && (
              <img
                src={screen.url}
                alt="Screen"
                className="object-fill w-full h-full rounded-lg"
              />
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ScreensSlider;
