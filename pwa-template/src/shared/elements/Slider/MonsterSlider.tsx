import React from "react";
import "./MonsterSlider.scss";
import { Slider, SliderSingleProps } from "antd";

const MonsterSlider: React.FC<SliderSingleProps> = ({ ...rest }) => {
  return <Slider rootClassName={"monster-select"} {...rest} />;
};

export default MonsterSlider;
