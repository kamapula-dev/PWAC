import React from "react";
import "./MonsterRate.scss";
import { Rate, RateProps } from "antd";

const MonsterRate: React.FC<RateProps> = ({ ...rest }) => {
  return <Rate allowHalf rootClassName={"monster-rate"} {...rest} />;
};

export default MonsterRate;
