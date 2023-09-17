// ISO 639 Codes
export type ISOLanguageCode = "en" |"pt-BR";

export interface Language {
  name: string;
  code: ISOLanguageCode;
}

export const SupportedLanguages: Language[] = [
  { name: "EN", code: "en" },
  { name: "BR", code: "pt-BR" }
];
