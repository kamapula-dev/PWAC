import { Dispatch, SetStateAction } from "react";
import ViewHeader from "../ViewHeader";
import Review from "../Review";
import { PwaContent } from "../../shared/models";
import { motion } from "framer-motion";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  pwaContent: PwaContent;
}

const ReviewsView: React.FC<Props> = ({ setView, pwaContent }) => {
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
        setView={setView}
        appIcon={pwaContent.appIcon}
        developerName={pwaContent.developerName}
        appName={pwaContent.appName}
      />
      <div className="pt-[3.5em] px-[24px]">
        <section className="mt-6 mb-4 flex flex-col gap-[1.5em]">
          {pwaContent.reviews.map((review) => {
            return (
              <Review
                reviewIconColor={review.reviewIconColor}
                src={review.reviewAuthorIcon}
                key={review.reviewAuthorName}
                name={review.reviewAuthorName}
                stars={review.reviewAuthorRating}
                text={review.reviewText}
                date={review.reviewDate}
              />
            );
          })}
        </section>
      </div>
    </motion.div>
  );
};

export default ReviewsView;
