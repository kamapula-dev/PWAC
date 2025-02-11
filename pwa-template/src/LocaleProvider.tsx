import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import EnglishMessages from './Locales/English.json';

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const userLocale =
    Intl.DateTimeFormat().resolvedOptions().locale?.split('-')[0] ??
    window.navigator.language ??
    navigator.language ??
    'en';
  const [messages, setMessages] = useState<{
    [key: string]: typeof EnglishMessages;
  }>({
    en: EnglishMessages,
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://pwac.world/languages/${userLocale}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to load translations: ${response.status}`);
        }

        const data = await response.json();
        setMessages({
          [userLocale]: data,
        });
      } catch (error) {
        console.error('Error fetching translations:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <IntlProvider
      locale={messages[userLocale] ? userLocale : 'en'}
      messages={messages[userLocale] || messages['en']}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
};

export default LocaleProvider;
