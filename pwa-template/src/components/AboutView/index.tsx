import { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import ViewHeader from "../ViewHeader";
import { PwaContent } from "../../shared/models";
import moment from "moment";
import { motion } from "framer-motion";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  pwaContent: PwaContent;
}

const AboutView: React.FC<Props> = ({ setView, pwaContent }) => {
  const intl = useIntl();

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
        appIcon={pwaContent.appIcon}
        developerName={pwaContent.developerName}
        setView={setView}
        appName={pwaContent.appName}
      />
      <section className="pt-[56px] mx-6 pb-4">
        <div className="text-base text-main font-sans pt-4 pb-3 flex items-center">
          {intl.formatMessage({ id: "about" })}
        </div>
        <div className="text-sm whitespace-pre-wrap relative text-justify text-[#605D64]">
          {pwaContent.fullDescription}
        </div>
      </section>
      <div className="bg-[#C6C6C6] h-[1px] w-full" />
      <div className="px-6 py-4">
        <div className="flex flex-col gap-9 text-sm leading-5 text-[#605D64]">
          <div className="text-base text-black">
            {intl.formatMessage({ id: "appInfo" })}
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "version" })}</span>
            <span>{pwaContent.version}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "updatedOn" })}</span>
            <span>{moment(pwaContent.lastUpdate).format("DD.MM.YYYY")}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "downloads" })}</span>
            <span>{pwaContent.countOfDownloads}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "downloadSize" })}</span>
            <span>{pwaContent.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "offeredBy" })}</span>
            <span>{pwaContent.developerName}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "releasedOn" })}</span>
            <span>{intl.formatMessage({ id: "releaseDate" })}</span>
          </div>
        </div>
      </div>
      <div className="bg-[#C6C6C6] h-[1px] w-full" />
      <div className="px-6 py-4">
        <div className="flex flex-col gap-9 text-sm leading-5 text-[#605D64]">
          <div className="text-base text-black">
            {intl.formatMessage({ id: "compatibilityTitle" })}
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "compatibility" })}</span>
            <span>{intl.formatMessage({ id: "worksOnYourDevice" })}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "version" })}</span>
            <span>{pwaContent.version}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "downloadSize" })}</span>
            <span>{pwaContent.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span>{intl.formatMessage({ id: "RequiredOS" })}</span>
            <span>{intl.formatMessage({ id: "OS" })}</span>
          </div>
        </div>
      </div>
      <div className="bg-[#C6C6C6] h-[1px] w-full" />
    </motion.div>
  );
};

export default AboutView;
