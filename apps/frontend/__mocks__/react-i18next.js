const reactI18next = require('react-i18next');

module.exports = {
  ...reactI18next,
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  useTranslation: () => {
    return {
      t: (key) => key,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
};
