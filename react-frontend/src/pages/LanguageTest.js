import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LanguageTest = () => {
  const { t, i18n } = useTranslation();

  const testStrings = [
    'hero.title',
    'hero.subtitle',
    'features.title',
    'features.gps.title',
    'features.gps.desc',
    'nav.home',
    'nav.liveTracking',
    'tracking.title',
    'status.active',
    'status.delayed'
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="language-test">
      <div className="container">
        <div className="test-header">
          <h1>🌍 Language Testing Page</h1>
          <p>Test the React i18next internationalization system by switching between different languages.</p>
          <p><strong>Current Language:</strong> {i18n.language} ({languages.find(l => l.code === i18n.language)?.name})</p>
        </div>

        <div className="language-buttons">
          <h2>Quick Language Switch:</h2>
          <div className="button-grid">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="translation-tests">
          <h2>Translation Tests:</h2>
          
          <div className="test-section">
            <h3>{t('hero.title')}</h3>
            <p>{t('hero.subtitle')}</p>
            <div className="test-buttons">
              <button className="btn btn-primary">
                <i className="fas fa-map-marker-alt"></i>
                {t('hero.trackBus')}
              </button>
              <button className="btn btn-secondary">
                <i className="fas fa-route"></i>
                {t('hero.viewRoutes')}
              </button>
            </div>
          </div>

          <div className="test-section">
            <h3>{t('features.title')}</h3>
            <div className="feature-preview">
              <div className="mini-feature-card">
                <i className="fas fa-satellite"></i>
                <h4>{t('features.gps.title')}</h4>
                <p>{t('features.gps.desc')}</p>
              </div>
              <div className="mini-feature-card">
                <i className="fas fa-clock"></i>
                <h4>{t('features.schedule.title')}</h4>
                <p>{t('features.schedule.desc')}</p>
              </div>
            </div>
          </div>

          <div className="test-section">
            <h3>{t('tracking.title')}</h3>
            <div className="tracking-preview">
              <div className="view-buttons">
                <button className="view-btn active">
                  <i className="fas fa-map"></i> {t('tracking.mapView')}
                </button>
                <button className="view-btn">
                  <i className="fas fa-list"></i> {t('tracking.listView')}
                </button>
              </div>
              <input 
                type="text" 
                placeholder={t('tracking.searchPlaceholder')} 
                className="search-input"
              />
            </div>
          </div>

          <div className="test-section">
            <h3>Status Examples:</h3>
            <div className="status-examples">
              <span className="status active">
                <span className="status-dot"></span>
                {t('status.active')}
              </span>
              <span className="status delayed">
                <span className="status-dot"></span>
                {t('status.delayed')}
              </span>
              <span className="status stopped">
                <span className="status-dot"></span>
                {t('status.stopped')}
              </span>
              <span className="status offline">
                <span className="status-dot"></span>
                {t('status.offline')}
              </span>
            </div>
          </div>
        </div>

        <div className="translation-table">
          <h2>Translation Keys Test:</h2>
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Current Translation</th>
              </tr>
            </thead>
            <tbody>
              {testStrings.map(key => (
                <tr key={key}>
                  <td><code>{key}</code></td>
                  <td>{t(key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="navigation-links">
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i>
            {t('nav.home')}
          </Link>
          <Link to="/live-tracking" className="btn btn-secondary">
            <i className="fas fa-map"></i>
            {t('nav.liveTracking')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
