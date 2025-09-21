import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Services.css';

const Services = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [contactInfo, setContactInfo] = useState('');
  const [specificRoutes, setSpecificRoutes] = useState('');
  const [selectedCategories, setSelectedCategories] = useState({
    disruptions: true,
    diversions: true,
    weather: false,
    emergency: true,
    maintenance: false
  });
  const [archiveSearch, setArchiveSearch] = useState('');

  const alertsData = [
    {
      id: 1,
      type: 'critical',
      category: 'emergency',
      time: '2 ' + t('services.hoursAgo'),
      title: t('services.alerts.bridgeIncident.title'),
      description: t('services.alerts.bridgeIncident.description'),
      routes: ['Route 15', 'Route 15 Express'],
      icon: 'fas fa-exclamation-circle'
    },
    {
      id: 2,
      type: 'warning',
      category: 'weather',
      time: '30 ' + t('services.minutesAgo'),
      title: t('services.alerts.weatherDelay.title'),
      description: t('services.alerts.weatherDelay.description'),
      routes: ['Route 22', 'Route 23', 'Route 45'],
      icon: 'fas fa-exclamation-triangle'
    },
    {
      id: 3,
      type: 'info',
      category: 'info',
      time: '1 ' + t('services.hoursAgo'),
      title: t('services.alerts.routeDiversion.title'),
      description: t('services.alerts.routeDiversion.description'),
      routes: ['Route 8', 'Route 8A'],
      icon: 'fas fa-info-circle'
    },
    {
      id: 4,
      type: 'resolved',
      category: 'resolved',
      time: '3 ' + t('services.hoursAgo'),
      title: t('services.alerts.serviceRestored.title'),
      description: t('services.alerts.serviceRestored.description'),
      routes: ['Route 12'],
      icon: 'fas fa-check-circle'
    }
  ];

  const maintenanceData = [
    {
      id: 1,
      date: t('services.maintenance.terminalUpgrade.date'),
      title: t('services.maintenance.terminalUpgrade.title'),
      details: t('services.maintenance.terminalUpgrade.details')
    },
    {
      id: 2,
      date: t('services.maintenance.busStopImprovements.date'),
      title: t('services.maintenance.busStopImprovements.title'),
      details: t('services.maintenance.busStopImprovements.details')
    },
    {
      id: 3,
      date: t('services.maintenance.fleetMaintenance.date'),
      title: t('services.maintenance.fleetMaintenance.title'),
      details: t('services.maintenance.fleetMaintenance.details')
    }
  ];

  const archiveData = [
    {
      id: 1,
      date: 'September 18, 2025',
      title: 'Major Service Update - New Express Routes Launched',
      summary: 'Introduction of Express Routes 50E, 51E, and 52E to reduce commute times by 30%.'
    },
    {
      id: 2,
      date: 'September 15, 2025',
      title: 'System Maintenance Completed Successfully',
      summary: 'Annual system maintenance completed with minimal disruption to services.'
    },
    {
      id: 3,
      date: 'September 10, 2025',
      title: 'Weather Alert - Tropical Storm Advisory',
      summary: 'Modified service schedule due to tropical storm conditions. All services resumed next day.'
    }
  ];

  const filteredAlerts = activeFilter === 'all' ? alertsData : alertsData.filter(alert => alert.type === activeFilter);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribing with:', { contactInfo, selectedCategories, specificRoutes });
    // Add subscription logic here
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleArchiveSearch = () => {
    console.log('Searching archive for:', archiveSearch);
    // Add search logic here
  };

  return (
    <div className="services-page">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>{t('services.title')}</h1>
          <p>{t('services.subtitle')}</p>
        </div>
      </section>

      {/* Current Active Alerts */}
      <section className="alerts-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('services.currentAlerts')}</h2>
            <div className="filter-controls">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterClick('all')}
              >
                {t('services.allAlerts')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'critical' ? 'active' : ''}`}
                onClick={() => handleFilterClick('critical')}
              >
                {t('services.critical')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'warning' ? 'active' : ''}`}
                onClick={() => handleFilterClick('warning')}
              >
                {t('services.warning')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'info' ? 'active' : ''}`}
                onClick={() => handleFilterClick('info')}
              >
                {t('services.info')}
              </button>
            </div>
          </div>

          <div className="alerts-grid">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${alert.type}`}>
                <div className="alert-header">
                  <span className={`alert-type ${alert.type}`}>
                    <i className={alert.icon}></i>
                    {t(`services.${alert.category}`)}
                  </span>
                  <span className="alert-time">
                    <i className="fas fa-clock"></i>
                    {alert.time}
                  </span>
                </div>
                <h3 className="alert-title">{alert.title}</h3>
                <p className="alert-description">{alert.description}</p>
                <div className="affected-routes">
                  {alert.routes.map((route, index) => (
                    <span key={index} className="route-badge">{route}</span>
                  ))}
                </div>
                <div className="alert-actions">
                  <button className="alert-action-btn primary">
                    <i className="fas fa-map-marked-alt"></i>
                    {t('services.viewAlternativeRoutes')}
                  </button>
                  <button className="alert-action-btn secondary">
                    <i className="fas fa-bell"></i>
                    {t('services.getUpdates')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription System */}
      <section className="subscription-section">
        <div className="container">
          <div className="subscription-container">
            <div className="subscription-header">
              <h2 className="subscription-title">{t('services.subscribeTitle')}</h2>
              <p className="subscription-subtitle">{t('services.subscribeSubtitle')}</p>
            </div>

            <div className="subscription-options">
              <div className="subscription-option">
                <i className="fas fa-sms subscription-icon"></i>
                <h3 className="subscription-name">{t('services.smsAlerts')}</h3>
                <p className="subscription-description">{t('services.smsDescription')}</p>
              </div>
              <div className="subscription-option">
                <i className="fas fa-envelope subscription-icon"></i>
                <h3 className="subscription-name">{t('services.emailUpdates')}</h3>
                <p className="subscription-description">{t('services.emailDescription')}</p>
              </div>
              <div className="subscription-option">
                <i className="fas fa-mobile-alt subscription-icon"></i>
                <h3 className="subscription-name">{t('services.pushNotifications')}</h3>
                <p className="subscription-description">{t('services.pushDescription')}</p>
              </div>
            </div>

            <form className="subscription-form" onSubmit={handleSubscribe}>
              <div className="form-group">
                <label className="form-label">{t('services.contactInfo')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={t('services.contactPlaceholder')}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('services.selectCategories')}</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.disruptions}
                      onChange={() => handleCategoryChange('disruptions')}
                    />
                    <span>{t('services.serviceDisruptions')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.diversions}
                      onChange={() => handleCategoryChange('diversions')}
                    />
                    <span>{t('services.routeDiversions')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.weather}
                      onChange={() => handleCategoryChange('weather')}
                    />
                    <span>{t('services.weatherDelays')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.emergency}
                      onChange={() => handleCategoryChange('emergency')}
                    />
                    <span>{t('services.emergencySituations')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.maintenance}
                      onChange={() => handleCategoryChange('maintenance')}
                    />
                    <span>{t('services.plannedMaintenance')}</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('services.specificRoutes')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={t('services.routesPlaceholder')}
                  value={specificRoutes}
                  onChange={(e) => setSpecificRoutes(e.target.value)}
                />
              </div>
              <button type="submit" className="submit-btn">{t('services.subscribeButton')}</button>
            </form>
          </div>
        </div>
      </section>

      {/* Planned Maintenance Schedule */}
      <section className="maintenance-section">
        <div className="container">
          <h2 className="section-title">{t('services.maintenanceTitle')}</h2>
          <div className="maintenance-grid">
            {maintenanceData.map((maintenance) => (
              <div key={maintenance.id} className="maintenance-card">
                <div className="maintenance-content">
                  <span className="maintenance-date">{maintenance.date}</span>
                  <h3 className="maintenance-title">{maintenance.title}</h3>
                  <p className="maintenance-details">{maintenance.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Integration */}
      <section className="social-section">
        <div className="container">
          <h2 className="social-title">{t('services.followUs')}</h2>
          <p className="social-subtitle">{t('services.socialSubtitle')}</p>
          <div className="social-links">
            <a href="#" className="social-link">
              <div className="social-icon twitter">
                <i className="fab fa-twitter"></i>
              </div>
              <span>@TransitTrack</span>
            </a>
            <a href="#" className="social-link">
              <div className="social-icon facebook">
                <i className="fab fa-facebook-f"></i>
              </div>
              <span>Transit Track</span>
            </a>
            <a href="#" className="social-link">
              <div className="social-icon instagram">
                <i className="fab fa-instagram"></i>
              </div>
              <span>@transit.track</span>
            </a>
            <a href="#" className="social-link">
              <div className="social-icon telegram">
                <i className="fab fa-telegram-plane"></i>
              </div>
              <span>Transit Updates</span>
            </a>
          </div>
        </div>
      </section>

      {/* Historical Alerts Archive */}
      <section className="archive-section">
        <div className="container">
          <h2 className="section-title">{t('services.archiveTitle')}</h2>
          <div className="archive-search">
            <input 
              type="text" 
              placeholder={t('services.searchPlaceholder')}
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
            />
            <button onClick={handleArchiveSearch}>
              <i className="fas fa-search"></i> {t('services.searchButton')}
            </button>
          </div>
          <div className="archive-list">
            {archiveData.map((item) => (
              <div key={item.id} className="archive-item">
                <div className="archive-date">{item.date}</div>
                <div className="archive-title">{item.title}</div>
                <div className="archive-summary">{item.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
