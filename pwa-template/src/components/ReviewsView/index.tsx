import { Dispatch, SetStateAction } from "react";
import ViewHeader from "../ViewHeader";
import Review from "../Review";
import useSanity from "../../shared/hooks/useSanity";
import { checkLocale } from "../../shared/helpers/languages";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
}

const ReviewsView: React.FC<Props> = ({ setView }) => {
  const { data, urlFor } = useSanity("reviews");

  if (!data) return null;

  return (
    <div>
      <ViewHeader id="ratingsAndReviews" setView={setView} />
      <div className="pt-[3.5em] px-[24px]">
        <section className="mt-6 mb-4 flex flex-col gap-[1.5em]">
          {data.reviews.map((review) => {
            const parts = review.reviewDate.split("-");
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0].slice(
              -2
            )}`;
            return (
              <Review
                src={
                  review.reviewAuthorIcon
                    ? urlFor(review.reviewAuthorIcon)
                    : undefined
                }
                key={review.reviewAuthorName}
                name={review.reviewAuthorName}
                avatarName={review.avatarTitle}
                color={review.reviewIconColor}
                stars={review.reviewAuthorRating}
                text={review.reviewText[checkLocale()]}
                date={formattedDate}
              />
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default ReviewsView;
