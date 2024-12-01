import React, { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import EnglishMessages from "./Locales/English.json";

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const userLocale = navigator.language.split("-")[0] || "en";
  const [messages, setMessages] = useState<{
    [key: string]: typeof EnglishMessages;
  }>({
    en: EnglishMessages,
  });

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(
        `https://pwac.world/languages/${userLocale}`
      );
      const data = await response.json();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [userLocale]: data,
      }));
    };

    fetchMessages();
  }, []);

  return (
    <IntlProvider
      locale={userLocale}
      messages={messages[userLocale]}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
};

export default LocaleProvider;
