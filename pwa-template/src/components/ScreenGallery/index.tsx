import { useEffect, useState } from 'react';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { PwaContent } from '../../shared/models';

import 'photoswipe/style.css';

function GalleryItem({
  url,
  wideScreens,
}: {
  url: string;
  wideScreens: boolean;
}) {
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    if (!url) return;

    const img = new Image();

    img.src = url;
    img.onload = () => {
      setDims({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
  }, [url]);

  if (!dims) {
    return (
      <div
        style={{ width: wideScreens ? '294px' : '94px' }}
        className="bg-gray-300 rounded-lg flex-shrink-0 h-[167px] snap-start scrollbar-hide animate-pulse"
      />
    );
  }

  return (
    <Item
      original={url}
      thumbnail={url}
      width={dims.width}
      height={dims.height}
    >
      {({ ref, open }) => (
        <div
          ref={ref}
          onClick={open}
          style={{
            width: wideScreens ? '294px' : '94px',
          }}
          className="bg-gray-300 rounded-lg flex-shrink-0 h-[167px] snap-start scrollbar-hide cursor-pointer"
        >
          <img
            src={url}
            alt="Preview"
            className="object-fill w-full h-full rounded-lg"
          />
        </div>
      )}
    </Item>
  );
}

export default function ScreensGallery({
  pwaContent,
}: {
  pwaContent: PwaContent;
}) {
  return (
    <Gallery options={{ showHideAnimationType: 'none' }}>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {pwaContent.images.map((screen, index) => (
          <GalleryItem
            key={index}
            url={screen.url}
            wideScreens={pwaContent.wideScreens}
          />
        ))}
      </div>
    </Gallery>
  );
}
