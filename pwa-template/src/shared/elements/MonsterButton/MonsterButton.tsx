import React from "react";
import "./MonsterButton.scss";
import { Button, ButtonProps } from "antd";

const MonsterButton: React.FC<ButtonProps> = ({ ...rest }) => {
  return <Button rootClassName={"monster-btn"} {...rest} />;
};

export default MonsterButton;
