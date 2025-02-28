import * as deepl from 'deepl-node';
import { Logger } from '@nestjs/common';

export const translateFields = async (
  field: Map<deepl.LanguageCode, string> | undefined,
  fieldName: string,
  actualLanguages: deepl.TargetLanguageCode[],
  translator: deepl.Translator,
) => {
  if (field) {
    const initialText = Object.values(field)[0];
    await Promise.all(
      actualLanguages.map(async (lang) => {
        const translatedText = await translator.translateText(
          initialText,
          null,
          lang,
        );
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
