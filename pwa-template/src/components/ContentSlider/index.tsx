import React from 'react';
import YouTube from 'react-youtube';
import { PwaContent } from '../../shared/models';
import ScreensGallery from '../ScreenGallery';

interface Props {
  pwaContent: PwaContent;
}

const extractVideoId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get('v');
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return null;
  }
};

const ContentSlider: React.FC<Props> = ({ pwaContent }) => {
  const youtubeId = pwaContent.videoUrl
    ? extractVideoId(pwaContent.videoUrl)
    : null;

  return (
    <div className="mb-6 overflow-x-auto whitespace-nowrap scroll-smooth snap-normal no-scrollbar">
      <div className="flex space-x-4">
        {youtubeId && (
          <div
            style={{ width: '294' }}
            className="bg-gray-300 overflow-hidden flex-shrink-0 h-[167px] snap-start scrollbar-hide rounded-md"
          >
            <YouTube
              videoId={youtubeId}
              opts={{
                width: '294',
                height: '167',
                playerVars: {
                  autoplay: 0,
                  controls: 1,
                },
              }}
            />
          </div>
        )}

        <ScreensGallery pwaContent={pwaContent} />
      </div>
    </div>
  );
};

export default ContentSlider;
