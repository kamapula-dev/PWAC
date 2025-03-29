const TagsSlider = ({
  tags,
  dark,
  testDesign,
}: {
  tags: string[];
  dark: boolean;
  testDesign?: boolean;
}) => {
  const actualTags =
    tags.length > 0 ? tags : ["Casino", "Slots", "Online", "Offline"];

  return (
    <div
      className={`slider-container  overflow-x-auto whitespace-nowrap scroll-smooth ${testDesign ? "mb-4" : "mb-7"} snap-normal no-scrollbar`}
    >
      <div className="flex space-x-4">
        {actualTags.map((tag, index) => (
          <div
            key={index}
            style={
              dark
                ? {
                    color: "#DFDFDF",
                    ...(testDesign && {
                      fontSize: "12px",
                      padding: "14px",
                      height: "30px",
                      border: "1px solid #DFDFDF",
                    }),
                  }
                : {
                    ...(testDesign && {
                      color: "#605d64",
                      fontSize: "12px",
                      padding: "14px",
                      height: "30px",
                    }),
                  }
            }
            className={`rounded-lg border border-solid border-[${testDesign ? "" : "#79747E"}] flex items-center justify-center flex-shrink-0 px-3 py-1.5 h-8 snap-start`}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsSlider;
