import { Picture } from "@models/pwa";
import { PreviewPwaContent, PwaViews } from "../models";
import VerifiedIcon from "@icons/VerifiedIcon";
import StarIcon from "@icons/StarIcon";
import ScreensSlider from "./ScreensSlider/ScreensSlider";
import { ArrowRightOutlined } from "@ant-design/icons";
import TagsSlider from "./TagsSlider/TagsSlider";
import { Rate } from "antd";
import { Review } from "@models/review";
import ReviewItem from "./Review/ReviewItem";
import thirdPartyIcon from "@shared/images/thirdParties.png";
import dataCollecting from "@shared/images/dataCollecting.png";
import stopIcon from "@shared/images/stop.png";

const MainView = ({
  previewPwaContent,
  screens,
  appIcon,
  setView,
  tags,
  sliders,
  reviews,
  myPWAsPage,
}: {
  previewPwaContent: PreviewPwaContent;
  setView: (view: PwaViews) => void;
  appIcon: Picture;
  screens: Picture[];
  tags: string[];
  sliders: number[];
  reviews: Review[];
  myPWAsPage?: boolean;
}) => {
  const defaultReview: Review[] = [
    {
      reviewAuthorIcon: "",
      reviewAuthorName: "Jacob Smith",
      reviewAuthorRating: 5,
      reviewText:
        "A wonderful application. I love all games,  especially this one",
      reviewDate: "09/04/24",
    },
    {
      reviewAuthorIcon: "",
      reviewAuthorName: "Анастасия Андреева",
      reviewAuthorRating: 5,
      reviewText:
        "A wonderful application. I love all games,  especially this one",
      reviewDate: "09/04/24",
      reviewIconColor: "",
    },
  ];
  const actualReviews =
    reviews.length > 0
      ? reviews.length > 3
        ? reviews.slice(0, 3)
        : reviews
      : defaultReview;

  return (
    <div className={myPWAsPage ? "p-0" : "pt-5 px-6"}>
      <div className="flex mb-4">
        <div className="relative block overflow-hidden w-[70px] h-[70px] rounded-lg mr-5">
          {appIcon.url ? (
            <img
              src={appIcon.url}
              alt="App logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300"></div>
          )}
        </div>

        <div className="flex flex-col text-[#00875F]">
          <div className="text-black text-[22px] leading-7 font-medium mb-1">
            {previewPwaContent.appName
              ? previewPwaContent.appName
              : "Plinko ASMR"}
          </div>
          <div className="flex gap-1 items-center mb-2">
            <div className="font-medium text-[#1357CD] leading-4 text-[14px]">
              {previewPwaContent.developerName
                ? previewPwaContent.developerName
                : "Supercent, Inc."}
            </div>
            {previewPwaContent.verified && <VerifiedIcon />}
          </div>
          {previewPwaContent.hasPaidContentTitle && (
            <div className="flex gap-1 text-[8px] text-[#444444] items-center">
              <div>Нет рекламы</div>
              <div className="rounded-full w-0.5 h-0.5 bg-[#444444]" />
              <div>Нет платного контента</div>
            </div>
          )}
        </div>
      </div>
      <div className="flex mb-5">
        <div className="flex-1 flex flex-col justify-center items-center h-[44px]">
          <div className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-[5px]">
            {previewPwaContent.rating}
            <StarIcon />
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            {previewPwaContent.countOfReviews}&nbsp; отзывов
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center h-[44px]">
          <div className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-[5px]">
            {previewPwaContent.countOfDownloads}
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            Скачиваний
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center h-[44px]">
          <div className="font-medium text-[13px] text-[#030303] flex gap-[2px] items-center justify-center mb-1">
            <div className="mb-0.5 text-xs flex justify-center items-center font-bold border-2 border-solid border-black">
              18+
            </div>
          </div>
          <div className="text-[11px] text-gray-600 font-medium">Возраст</div>
        </div>
      </div>
      <button className="bg-[#1357CD] rounded-[60px] h-9 w-full text-white mb-5">
        Установить
      </button>
      <ScreensSlider screens={screens} />
      <div className="flex flex-col gap-3 mb-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => {
            setView(PwaViews.About);
          }}
        >
          <span className="text-[#605D64] leading-6 font-medium text-base">
            Описание
          </span>
          <ArrowRightOutlined />
        </div>
        <div className="text-[#605D64] text-[14px] leading-5 text-left">
          {previewPwaContent.shortDescription}
        </div>
      </div>
      <TagsSlider tags={tags} />
      <div
        className="flex justify-between items-center cursor-pointer mb-5"
        onClick={() => {
          setView(PwaViews.Reviews);
        }}
      >
        <span className="text-[#605D64] leading-6 font-medium text-base">
          Оценки и отзывы
        </span>
        <ArrowRightOutlined />
      </div>
      <div className="text-[#605D64] text-xs leading-4 mb-4">
        Оценки и отзывы подтверждены. Их оставили пользователи с таким же типом
        устройства как у вас.
      </div>
      <div
        className="grid pb-6 gap-x-[2em]"
        style={{
          gridTemplateColumns: "auto 1fr",
          gridTemplateRows: "auto auto auto",
          gridTemplateAreas: `
      "rating-big rating-right"
      "rating-stars rating-right"
      "rating-count rating-right"
    `,
        }}
      >
        <div className="text-[45px]" style={{ gridArea: "rating-big" }}>
          {previewPwaContent.rating}
        </div>
        <div className="flex mb-2" style={{ gridArea: "rating-stars" }}>
          <Rate
            value={Number(previewPwaContent.rating)}
            style={{ color: "#1357CD", fontSize: "14px" }}
            disabled
          />
        </div>
        <div
          className="font-medium text-[0.8em]"
          style={{ gridArea: "rating-count" }}
        >
          {previewPwaContent.countOfReviewsFull}
        </div>
        <div
          className="flex flex-col gap-[0.25em]"
          style={{ gridArea: "rating-right" }}
        >
          {sliders.map((data, index) => (
            <div
              className="flex gap-[0.75em] justify-center items-center"
              key={index}
            >
              <div className="font-medium text-[0.8em] w-[0.5em]">
                {5 - index}
              </div>
              <div className="relative h-[0.5em] w-full bg-[#d9d9d9] rounded-[0.5em]">
                <div
                  className="absolute h-[0.5em] min-w-[0.1em] bg-[#1357CD] rounded-[0.5em]"
                  style={{ width: `${(data * 100) / 5 || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 pb-5">
        {actualReviews.map((review) => {
          return (
            <ReviewItem
              src={review.reviewAuthorIcon}
              key={review.reviewAuthorName}
              name={review.reviewAuthorName}
              stars={review.reviewAuthorRating}
              text={review.reviewText}
              date={review.reviewDate}
              iconColor={review.reviewIconColor}
              devResponse={review.devResponse}
              developerName={previewPwaContent.developerName}
            />
          );
        })}
      </div>
      <div className="text-[#1357CD] leading-5 text-[14px] font-medium hover:underline cursor-pointer pb-[30px]">
        Все отзывы
      </div>
      {previewPwaContent.securityUI && (
        <>
          <div className="flex justify-between items-center cursor-pointer mb-3">
            <span className="text-[#605D64] leading-6 font-medium text-base">
              Безопасность данных
            </span>
          </div>
          <div className="text-[#605D64] text-[13px] leading-4 mb-[14px]">
            Чтобы контролировать безопасность, нужно знать, как разработчики
            собирают ваши данные и передают их третьим лицам. Методы обеспечения
            безопасности и конфиденциальности могут зависеть от того, как вы
            используете приложение, а также от вашего региона и возраста.
            Информация ниже предоставлена разработчиком и в будущем может
            измениться.
          </div>
          <div className="rounded-lg border border-solid border-[#E6E0E9] pt-5 pl-5 pr-3 pb-5">
            <div className="flex flex-col gap-4 mb-[23px]">
              <div className="flex gap-4">
                <img
                  className="w-5 h-5"
                  src={thirdPartyIcon}
                  alt="third party icon"
                />
                <div className="text-[#605D64] text-[13px] leading-4">
                  Это приложение может передавать указанные типы данных третьим
                  лицам
                  <span className="text-[11px]">
                    {" "}
                    Местоположение, Сведения о приложении и его
                    производительности и Идентификаторы устройства или другие
                    идентификаторы
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  className="w-5 h-5"
                  src={dataCollecting}
                  alt="third party icon"
                />
                <div className="text-[#605D64] text-[13px] leading-4">
                  <div>Данные не собираются</div>
                  <div className="text-[11px]">
                    Подробнее о том,{" "}
                    <span className="underline cursor-pointer">
                      как разработчики заявляют о сборе данных...
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  className="w-5 h-5"
                  src={stopIcon}
                  alt="third party icon"
                />
                <div className="text-[#605D64] text-[13px] leading-4">
                  Данные не шифруются.
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  className="w-5 h-5"
                  src={stopIcon}
                  alt="third party icon"
                />
                <div className="text-[#605D64] text-[13px] leading-4">
                  Удалить данные невозможно.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="h-[30px]"></div>
    </div>
  );
};

export default MainView;
