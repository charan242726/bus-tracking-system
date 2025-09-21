import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <div className="cta-buttons">
            <Link to="/live-tracking" className="btn btn-primary">
              <i className="fas fa-map-marker-alt"></i>
              {t('hero.trackBus')}
            </Link>
            <Link to="/routes" className="btn btn-secondary">
              <i className="fas fa-route"></i>
              {t('hero.viewRoutes')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">{t('features.title')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-satellite feature-icon"></i>
              <h3 className="feature-title">{t('features.gps.title')}</h3>
              <p className="feature-description">{t('features.gps.desc')}</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-clock feature-icon"></i>
              <h3 className="feature-title">{t('features.schedule.title')}</h3>
              <p className="feature-description">{t('features.schedule.desc')}</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-mobile-alt feature-icon"></i>
              <h3 className="feature-title">{t('features.mobile.title')}</h3>
              <p className="feature-description">{t('features.mobile.desc')}</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-chart-line feature-icon"></i>
              <h3 className="feature-title">{t('features.analytics.title')}</h3>
              <p className="feature-description">{t('features.analytics.desc')}</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bell feature-icon"></i>
              <h3 className="feature-title">{t('features.alerts.title')}</h3>
              <p className="feature-description">{t('features.alerts.desc')}</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-shield-alt feature-icon"></i>
              <h3 className="feature-title">{t('features.security.title')}</h3>
              <p className="feature-description">{t('features.security.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">250+</span>
              <div className="stat-label">{t('stats.buses')}</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">45</span>
              <div className="stat-label">{t('stats.routes')}</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <div className="stat-label">{t('stats.passengers')}</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">99.8%</span>
              <div className="stat-label">{t('stats.uptime')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="quick-access">
        <div className="container">
          <h2 className="section-title">{t('quickAccess.title')}</h2>
          <div className="access-grid">
            <div className="access-card">
              <i className="fas fa-search-location access-icon"></i>
              <h3>{t('quickAccess.nearestStop.title')}</h3>
              <p>{t('quickAccess.nearestStop.desc')}</p>
            </div>
            <div className="access-card">
              <i className="fas fa-calendar-alt access-icon"></i>
              <h3>{t('quickAccess.schedule.title')}</h3>
              <p>{t('quickAccess.schedule.desc')}</p>
            </div>
            <div className="access-card">
              <i className="fas fa-map access-icon"></i>
              <h3>{t('quickAccess.route.title')}</h3>
              <p>{t('quickAccess.route.desc')}</p>
            </div>
            <div className="access-card">
              <i className="fas fa-phone-alt access-icon"></i>
              <h3>{t('quickAccess.support.title')}</h3>
              <p>{t('quickAccess.support.desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
