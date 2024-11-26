import DesignOption from "./DesignOption/DesignOption";

const EditorPWA = () => {
  return (
    <div className="px-[50px] pt-[110px] w-full min-w-[1050px]">
      <h1 className="font-bold text-[28px] leading-8 text-white mb-7">
        Создание PWA
      </h1>
      {/* <div className="h-[42px] flex justify-between mb-12">
        <div className="flex items-center"></div>
        <div className="flex gap-5">
          <IconButton
            disabled
            icon={<MdOutlineNotStarted color="white" />}
            text="Запустить"
            onclick={() => {}}
          />
          <IconButton
            disabled
            icon={<VscPreview color="white" />}
            text="Предпросмотр"
            onclick={() => {}}
          />
          <IconButton
            disabled
            icon={<FaSave color="white" />}
            text="Сохранить"
            onclick={() => {}}
          />
        </div>
      </div> */}

      <DesignOption />
    </div>
  );
};

export default EditorPWA;
