import React from "react";
import "./MonsterSwitch.scss";
import { Switch, SwitchProps } from "antd";

const MonsterSwitch: React.FC<SwitchProps> = ({ ...rest }) => {
  return <Switch rootClassName={"monster-switch"} {...rest} />;
};

export default MonsterSwitch;
