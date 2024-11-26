const MenuItem = ({ text, onClick }: { text: string; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#0E421D] hover:bg-[#20223B] h-[42px] rounded flex items-center p-[14px] cursor-pointer"
    >
      <div className="w-[10px] h-[10px] rounded-full bg-[#00FF11] mr-[14px]" />
      <span className="text-base text-[#00FF11] leading-5">{text}</span>
    </div>
  );
};

export default MenuItem;
