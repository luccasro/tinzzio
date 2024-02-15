import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Translations from './resources';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheUserLanguage = (language: string) => {
  AsyncStorage.setItem('language', language);
};

const languageDetector = async () => {
  const storedLanguage = await AsyncStorage.getItem('language');

  if (storedLanguage) {
    i18n.changeLanguage(storedLanguage);
  } else {
    let phoneLanguage: string | null = null;
    if (Platform.OS === 'android') {
      phoneLanguage = NativeModules.I18Manager.localeIdentifier;
    } else if (Platform.OS === 'ios') {
      phoneLanguage = NativeModules.SettingsManager.settings.AppleLocale;
    } else if (Platform.OS === 'web') {
      phoneLanguage = navigator.language;
    }
    if (phoneLanguage) {
      phoneLanguage = phoneLanguage.replace('_', '').replace('-', '');
    }
    if (phoneLanguage === 'enUS') {
      phoneLanguage = 'en';
    }
    i18n
      .changeLanguage(phoneLanguage ?? 'en')
      .then(() => cacheUserLanguage(phoneLanguage ?? 'en'));
  }
};

languageDetector();

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translations: Translations.EN,
    },
    ptBR: {
      translations: Translations.PTBR,
    },
  },
  fallbackLng: 'en',
  debug: false,
  ns: ['translations'],
  defaultNS: 'translations',
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
