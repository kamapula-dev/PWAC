import { Dispatch, SetStateAction } from "react";
import ViewHeader from "../ViewHeader/ViewHeader";
import moment from "moment";
import { motion } from "framer-motion";
import { PreviewPwaContent, PwaViews } from "../models";

interface Props {
  setView: Dispatch<SetStateAction<PwaViews>>;
  previewPwaContent: PreviewPwaContent;
  appIcon: string | null;
}

const AboutView: React.FC<Props> = ({
  setView,
  previewPwaContent,
  appIcon,
}) => {
  const slideVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={slideVariants}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <ViewHeader
        appIcon={appIcon}
        developerName={previewPwaContent.developerName}
        setView={setView}
        appName={previewPwaContent.appName}
      />
      <section className="pt-4 mx-6 pb-4">
        <div className="text-base text-main font-sans pt-4 pb-3 flex items-center">
          Описание
        </div>
        <div className="text-sm whitespace-pre-wrap relative text-left text-[#605D64]">
          {previewPwaContent.fullDescription}
        </div>
      </section>
      <div className="bg-[#C6C6C6] h-[1px] w-full" />
      <div className="px-6 py-4">
        <div className="flex flex-col gap-9 text-sm leading-5 text-[#605D64]">
          <div className="text-base text-black">Об игре</div>
          <div className="flex flex-row justify-between items-center">
            <span>Версия</span>
            <span>{previewPwaContent.version}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Последнее обновление</span>
            <span>
              {moment(previewPwaContent.lastUpdate).format("DD.MM.YYYY")}
            </span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Кол-во скачиваний</span>
            <span>{previewPwaContent.countOfDownloads}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Размер файла</span>
            <span>{previewPwaContent.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Разработчик</span>
            <span>{previewPwaContent.developerName}</span>
          </div>
        </div>
      </div>
      <div className="bg-[#C6C6C6] h-[1px] w-full" />
      <div className="px-6 py-4">
        <div className="flex flex-col gap-9 text-sm leading-5 text-[#605D64]">
          <div className="text-base text-black">
            Совместимость с вашим устройством
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Версия</span>
            <span>{previewPwaContent.version}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Размер загрузки</span>
            <span>{previewPwaContent.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>Требуемая ОС</span>
            <span>Android 5.0 и выше</span>
          </div>
        </div>
      </div>
      <div className="bg-[#C6C6C6] h-[1px] w-full" />
    </motion.div>
  );
};

export default AboutView;
