import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationEnUS from './en-US/translation.json';
import translationPtPT from './pt-PT/translation.json';

const resources = {
  'en-US': { translation: translationEnUS },
  'pt-PT': { translation: translationPtPT },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');

  if (!savedLanguage) savedLanguage = Localization.getLocales()[0].languageTag;

  i18n.use(initReactI18next).init({
    debug: true,
    compatibilityJSON: 'v3',
    resources,
    lng: savedLanguage,
    fallbackLng: 'en-US',
    interpolation: { escapeValue: false },
  });
};

initI18n();

export default i18n;
