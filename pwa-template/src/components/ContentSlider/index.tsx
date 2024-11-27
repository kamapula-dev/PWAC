import { PwaContent } from "../../shared/models";

interface Props {
  pwaContent: PwaContent;
}

const ContentSlider: React.FC<Props> = ({ pwaContent }) => {
  return (
    <div className="mb-6 overflow-x-auto whitespace-nowrap scroll-smooth snap-normal no-scrollbar">
      <div className="flex space-x-4">
        {pwaContent.images.map((screen, index) => (
          <div
            key={index}
            className="bg-gray-300 rounded-lg flex-shrink-0 w-[94px] h-[167px] snap-start scrollbar-hide"
          >
            {screen.url && (
              <img
                src={screen.url}
                alt="Screen"
                className="object-fill w-full h-full rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentSlider;
