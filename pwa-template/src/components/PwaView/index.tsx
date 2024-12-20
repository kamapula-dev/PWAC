import { useEffect, useState } from 'react';
import PageLoader from '../PageLoader';
import StartAgainView from '../StartAgainView';

const PwaView = () => {
  const [view, setView] = useState('loading');
  const [pwaLink, setPwaLink] = useState('');

  useEffect(() => {
    const pwaLink = localStorage.getItem('pwaLink')!;
    setPwaLink(pwaLink);
    const timer = setTimeout(() => {
      setView('button');
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (!pwaLink) return <></>;

  return view === 'loading' ? (
    <PageLoader pwaLink={pwaLink} />
  ) : (
    <StartAgainView pwaLink={pwaLink} />
  );
};

export default PwaView;
