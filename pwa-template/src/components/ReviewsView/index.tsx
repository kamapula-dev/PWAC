import { Dispatch, SetStateAction } from "react";
import ViewHeader from "../ViewHeader";
import Review from "../Review";
import { PwaContent } from "../../shared/models";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  pwaContent: PwaContent;
}

const ReviewsView: React.FC<Props> = ({ setView, pwaContent }) => {
  return (
    <div>
      <ViewHeader
        id="ratingsAndReviews"
        setView={setView}
        appIcon={pwaContent.appIcon}
        developerName={pwaContent.developerName}
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
    </div>
  );
};

export default ReviewsView;
