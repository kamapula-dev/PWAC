import { useEffect, useState } from 'react';
import PageLoader from '../PageLoader';
import StartAgainView from '../StartAgainView';

const PwaView = ({
  pwaLink,
  withPushes,
}: {
  pwaLink: string | null;
  withPushes: boolean;
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
    <PageLoader withPushes={withPushes} pwaLink={pwaLink} />
  ) : (
    <StartAgainView pwaLink={pwaLink} />
  );
};

export default PwaView;
