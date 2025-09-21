import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode).then(() => {
      // Update document direction for RTL languages
      document.documentElement.dir = i18n.dir();
      document.documentElement.lang = langCode;
      
      // Show notification
      showLanguageChangeNotification(languages.find(lang => lang.code === langCode));
    });
  };

  const showLanguageChangeNotification = (language) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'language-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-language"></i>
        <span>${t('notification.languageChanged')} ${language.name} ${language.flag}</span>
      </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #4f46e5;
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      font-family: 'Segoe UI', sans-serif;
    `;
    
    // Add CSS animation if not exists
    if (!document.querySelector('#language-animations')) {
      const style = document.createElement('style');
      style.id = 'language-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  return (
    <div className="language-selector">
      <label htmlFor="languageSelect" className="sr-only">
        {t('nav.language')}
      </label>
      <select
        id="languageSelect"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
