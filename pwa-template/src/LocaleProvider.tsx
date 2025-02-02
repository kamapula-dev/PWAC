import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import EnglishMessages from './Locales/English.json';

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const userLocale = new Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  const [messages, setMessages] = useState<{
    [key: string]: typeof EnglishMessages;
  }>({
    en: EnglishMessages,
  });
  const [languageIsLoaded, setLanguageIsLoaded] = useState(false);

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
        setMessages((prevMessages) => ({
          ...prevMessages,
          [userLocale]: data,
        }));
        setLanguageIsLoaded(true);
      } catch (error) {
        console.error('Error fetching translations:', error);
      }
    };

    fetchMessages();
  }, [userLocale]);

  return (
    <IntlProvider
      locale={languageIsLoaded ? userLocale : 'en'}
      messages={messages[userLocale]}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
};

export default LocaleProvider;
