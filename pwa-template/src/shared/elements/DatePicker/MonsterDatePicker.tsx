import React from "react";
import "./MonsterDatePicker.scss";
import { DatePicker, DatePickerProps } from "antd";

const MonsterDatePicker: React.FC<DatePickerProps> = ({ ...rest }) => {
  return (
    <DatePicker
      format={"DD.MM.YYYY"}
      rootClassName={"monster-datePicker"}
      {...rest}
    />
  );
};

export default MonsterDatePicker;
