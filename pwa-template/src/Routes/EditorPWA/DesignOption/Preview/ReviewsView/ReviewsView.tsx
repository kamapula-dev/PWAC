import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import ViewHeader from "../ViewHeader/ViewHeader";
import { PreviewPwaContent, PwaViews } from "../models";
import ReviewItem from "../MainView/Review/ReviewItem";
import { Review } from "@models/review";

interface Props {
  setView: Dispatch<SetStateAction<PwaViews>>;
  previewPwaContent: PreviewPwaContent;
  appIcon: string | null;
  reviews: Review[];
}

const ReviewsView: React.FC<Props> = ({
  setView,
  reviews,
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
      <div className="pt-4 px-[24px]">
        <section className="mt-6 mb-4 flex flex-col gap-[1.5em]">
          {reviews.map((review) => {
            return (
              <ReviewItem
                src={review.reviewAuthorIcon}
                key={review.reviewAuthorName}
                name={review.reviewAuthorName}
                stars={review.reviewAuthorRating}
                text={review.reviewText}
                date={review.reviewDate}
                iconColor={review.reviewIconColor}
              />
            );
          })}
        </section>
      </div>
    </motion.div>
  );
};

export default ReviewsView;
