import { MouseEventHandler } from "react";

interface SimpleButtonProps {
  text: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  color?: string;
  textColor?: string;
  htmlType?: "button" | "submit" | "reset";
}

const SimpleButton: React.FC<SimpleButtonProps> = ({
  text,
  icon,
  disabled,
  onClick,
  color,
  textColor,
  htmlType = "button",
}) => {
  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={disabled}
      className={`flex p-3 gap-3 ${color ? color : "bg-[#515ACA]"} ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } rounded-lg transition duration-300 transform active:scale-95 `}
    >
      {icon}
      <span
        className={`${
          textColor ? textColor : "text-white"
        } font-bold text-base leading-[18px]`}
      >
        {text}
      </span>
    </button>
  );
};

export default SimpleButton;
