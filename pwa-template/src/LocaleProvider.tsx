import React from "react";
import { IntlProvider } from "react-intl";
import EnglishMessages from "./Locales/English.json";

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const userLocale = "en";
  const messages = {
    en: EnglishMessages,
  };

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
