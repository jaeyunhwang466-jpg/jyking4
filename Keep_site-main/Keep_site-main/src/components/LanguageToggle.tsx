import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ko' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('keep-language', newLang);
  };

  return (
    <button className="btn-icon" onClick={toggleLanguage} aria-label="Toggle Language" title="Toggle Language">
      <Languages size={20} />
      <span className="text-xs font-semibold uppercase">{i18n.language}</span>
    </button>
  );
};
