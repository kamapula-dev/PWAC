import { useEffect, useState } from 'react';
import PageLoader from '../PageLoader';
import StartAgainView from '../StartAgainView';

const PwaView = ({
  id,
  pwaLink,
  hasPushes,
}: {
  id?: string;
  pwaLink: string | null;
  hasPushes: boolean;
}) => {
  const [view, setView] = useState('loading');

  useEffect(() => {
    const timer = setTimeout(() => {
      setView('button');
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (!pwaLink) return <></>;

  return view === 'loading' ? (
    <PageLoader id={id} hasPushes={hasPushes} pwaLink={pwaLink} />
  ) : (
    <StartAgainView pwaLink={pwaLink} />
  );
};

export default PwaView;
