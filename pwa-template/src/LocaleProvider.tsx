import React, { ReactNode, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

type LocaleMessages = {
  [key: string]: string;
};

interface LocaleProviderProps {
  children: ReactNode;
}

const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const userLocale = navigator.language;
  const [messages, setMessages] = useState<LocaleMessages>({});

  useEffect(() => {
    const loadLocaleData = async (locale: string): Promise<void> => {
      let localeData;
      switch (locale.split("-")[0]) {
        case "en":
          localeData = await import("./Locales/English.json");
          break;
        case "fr":
          localeData = await import("./Locales/French.json");
          break;
        case "nl":
          localeData = await import("./Locales/Dutch.json");
          break;
        case "de":
        case "at":
        case "ch":
          localeData = await import("./Locales/German.json");
          break;
        case "es":
          localeData = await import("./Locales/Spanish.json");
          break;
        case "it":
          localeData = await import("./Locales/Italian.json");
          break;
        default:
          localeData = await import("./Locales/English.json");
      }
      setMessages(localeData.default);
    };

    loadLocaleData(userLocale);
  }, [userLocale]);

  return (
    <IntlProvider locale={userLocale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default LocaleProvider;
