export const checkLocale = () => {
  switch (navigator.language.split("-")[0]) {
    case "en":
      return "en"; // English
    case "de":
      return "de"; // German
    case "fr":
      return "fr"; // French
    case "es":
      return "es"; // Spanish
    case "pt":
      return "pt"; // Portuguese
    case "nl":
      return "nl"; // Dutch
    case "it":
      return "it"; // Italian
    case "da":
      return "da"; // Danish
    case "sv":
      return "sv"; // Swedish
    case "no":
      return "no"; // Norwegian
    case "el":
      return "el"; // Greek
    case "tr":
      return "tr"; // Turkish
    case "bg":
      return "bg"; // Bulgarian
    case "cs":
      return "cs"; // Czech
    case "hu":
      return "hu"; // Hungarian
    case "ro":
      return "ro"; // Romanian
    case "sl":
      return "sl"; // Slovenian
    case "sk":
      return "sk"; // Slovak
    case "pl":
      return "pl"; // Polish
    default:
      return "en"; // Default to English
  }
};
