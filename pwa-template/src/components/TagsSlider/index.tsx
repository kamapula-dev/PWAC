const TagsSlider = ({ tags, dark }: { tags: string[]; dark: boolean }) => {
  const actualTags =
    tags.length > 0 ? tags : ["Casino", "Slots", "Online", "Offline"];

  return (
    <div className="slider-container  overflow-x-auto whitespace-nowrap scroll-smooth mb-7 snap-normal no-scrollbar">
      <div className="flex space-x-4">
        {actualTags.map((tag, index) => (
          <div
            key={index}
            style={dark ? { color: "#DFDFDF" } : {}}
            className="rounded-lg border border-solid border-[#79747E] flex items-center justify-center flex-shrink-0 px-3 py-1.5 h-8 snap-start"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsSlider;
