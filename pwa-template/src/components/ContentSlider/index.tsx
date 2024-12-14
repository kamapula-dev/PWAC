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
            style={{ width: pwaContent.wideScreens ? "294px" : "94px" }}
            className="bg-gray-300 rounded-lg flex-shrink-0 h-[167px] snap-start scrollbar-hide"
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
