import { Logger } from '@nestjs/common';
import { Language } from '../modules/languages/dto/languages.dto';

export const translateFields = async (
  field: Map<Language, string> | undefined,
  fieldName: string,
  actualLanguages: Language[],
  translator: (text: string, targetLang: Language) => Promise<{ text: string }>,
) => {
  if (field) {
    const initialText = Object.values(field)[0];
    await Promise.all(
      actualLanguages.map(async (lang) => {
        const translatedText = await translator(initialText, lang);
        const languageKey = lang.split('-')[0];
        field[languageKey] = Array.isArray(translatedText)
          ? translatedText[0].text
          : translatedText.text;
      }),
    );
  } else {
    Logger.warn(`Field "${fieldName}" is not defined in the DTO.`);
  }
};
