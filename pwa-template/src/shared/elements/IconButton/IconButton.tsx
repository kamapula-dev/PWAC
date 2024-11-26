const IconButton = ({
  icon,
  text,
  onclick,
  disabled,
}: {
  icon: React.ReactNode;
  text: string;
  onclick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onclick}
      disabled={disabled}
      className={`flex items-center hover:bg-[#515ACA] bg-[#383B66] h-[42px] rounded-lg  p-[14px] gap-[14px] ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {icon}
      <span className="text-base text-white leading-5">{text}</span>
    </button>
  );
};

export default IconButton;
