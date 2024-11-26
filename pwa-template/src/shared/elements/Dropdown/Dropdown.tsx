import React from "react";
import "./MonsterDropdown.scss";
import { Dropdown, DropDownProps } from "antd";

const MonsterDropdown: React.FC<DropDownProps> = ({ ...rest }) => {
  return <Dropdown rootClassName={"monster-dropdown"} {...rest} />;
};

export default MonsterDropdown;
