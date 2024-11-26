import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

interface TagsSliderProps {
  tags: string[];
}

const TagsSlider: React.FC<TagsSliderProps> = ({ tags }) => {
  const actualTags =
    tags.length > 0 ? tags : ["Casino", "Slots", "Online", "Offline", "Game"];

  return (
    <Swiper
      spaceBetween={12}
      freeMode={true}
      grabCursor={true}
      slidesPerView={3.5}
      className="mb-7 flex"
    >
      {actualTags.map((tag, index) => (
        <SwiperSlide key={index}>
          <div className="rounded-lg border border-solid border-[#49454F] flex items-center justify-center px-3 py-1.5 h-8">
            {tag}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TagsSlider;
