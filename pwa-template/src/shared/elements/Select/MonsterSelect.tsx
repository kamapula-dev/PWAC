import React from "react";
import "./MonsterSelect.scss";
import { Select, SelectProps } from "antd";

const MonsterSelect: React.FC<SelectProps> = ({ ...rest }) => {
  return <Select rootClassName={"monster-select"} {...rest} />;
};

export default MonsterSelect;
