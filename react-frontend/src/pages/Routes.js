import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Routes.css';

const Routes = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [routeType, setRouteType] = useState('');
  const [routeZone, setRouteZone] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  const routeData = [
    {
      number: '101',
      type: 'express',
      name: t('routes.routeCards.101.name'),
      frequency: t('routes.routeCards.101.frequency'),
      stops: t('routes.routeCards.101.stops'),
      duration: t('routes.routeCards.101.duration'),
      price: t('routes.routeCards.101.price'),
      status: 'active',
      frequencyLevel: 'high',
      gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)'
    },
    {
      number: '202',
      type: 'local',
      name: t('routes.routeCards.202.name'),
      frequency: t('routes.routeCards.202.frequency'),
      stops: t('routes.routeCards.202.stops'),
      duration: t('routes.routeCards.202.duration'),
      price: t('routes.routeCards.202.price'),
      status: 'active',
      frequencyLevel: 'medium',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    {
      number: '303',
      type: 'night',
      name: t('routes.routeCards.303.name'),
      frequency: t('routes.routeCards.303.frequency'),
      stops: t('routes.routeCards.303.stops'),
      duration: t('routes.routeCards.303.duration'),
      price: t('routes.routeCards.303.price'),
      status: 'delayed',
      frequencyLevel: 'low',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
    },
    {
      number: '404',
      type: 'express',
      name: t('routes.routeCards.404.name'),
      frequency: t('routes.routeCards.404.frequency'),
      stops: t('routes.routeCards.404.stops'),
      duration: t('routes.routeCards.404.duration'),
      price: t('routes.routeCards.404.price'),
      status: 'active',
      frequencyLevel: 'high',
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)'
    },
    {
      number: '505',
      type: 'local',
      name: t('routes.routeCards.505.name'),
      frequency: t('routes.routeCards.505.frequency'),
      stops: t('routes.routeCards.505.stops'),
      duration: t('routes.routeCards.505.duration'),
      price: t('routes.routeCards.505.price'),
      status: 'active',
      frequencyLevel: 'medium',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    }
  ];

  const handleSearch = () => {
    console.log('Searching routes:', { searchTerm, routeType, routeZone });
  };

  const handlePlanRoute = () => {
    console.log('Planning route from:', fromLocation, 'to:', toLocation);
  };

  const handleRouteClick = (routeNumber) => {
    console.log('Opening route detail for:', routeNumber);
  };

  const getFrequencyWidth = (level) => {
    switch (level) {
      case 'high': return '85%';
      case 'medium': return '60%';
      case 'low': return '35%';
      default: return '50%';
    }
  };

  const getFrequencyColor = (level) => {
    switch (level) {
      case 'high': return 'linear-gradient(90deg, #10b981, #34d399)';
      case 'medium': return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      case 'low': return 'linear-gradient(90deg, #ef4444, #f87171)';
      default: return 'linear-gradient(90deg, #6b7280, #9ca3af)';
    }
  };

  return (
    <div className="routes-page">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>{t('routes.title')}</h1>
          <p>{t('routes.subtitle')}</p>
        </div>
      </section>

      <div className="container">
        {/* Search and Filter Section */}
        <div className="search-section">
          <div className="search-controls">
            <div className="search-box">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('routes.searchPlaceholder')}
              />
              <i className="fas fa-search"></i>
            </div>
            <select 
              className="filter-select" 
              value={routeType}
              onChange={(e) => setRouteType(e.target.value)}
            >
              <option value="">{t('routes.allRoutes')}</option>
              <option value="express">{t('routes.express')}</option>
              <option value="local">{t('routes.local')}</option>
              <option value="night">{t('routes.night')}</option>
              <option value="airport">{t('routes.airport')}</option>
            </select>
            <select 
              className="filter-select" 
              value={routeZone}
              onChange={(e) => setRouteZone(e.target.value)}
            >
              <option value="">{t('routes.allZones')}</option>
              <option value="north">{t('routes.northZone')}</option>
              <option value="south">{t('routes.southZone')}</option>
              <option value="east">{t('routes.eastZone')}</option>
              <option value="west">{t('routes.westZone')}</option>
              <option value="central">{t('routes.central')}</option>
            </select>
            <button className="btn-search" onClick={handleSearch}>
              <i className="fas fa-filter"></i> {t('routes.applyFilters')}
            </button>
          </div>
        </div>

        {/* Route Planning Tool */}
        <div className="route-planner">
          <h2><i className="fas fa-route"></i> {t('routes.plannerTitle')}</h2>
          <div className="planner-form">
            <div className="input-group">
              <label htmlFor="fromLocation">{t('routes.from')}</label>
              <input 
                type="text" 
                id="fromLocation" 
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder={t('routes.fromPlaceholder')}
              />
            </div>
            <div className="input-group">
              <label htmlFor="toLocation">{t('routes.to')}</label>
              <input 
                type="text" 
                id="toLocation" 
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder={t('routes.toPlaceholder')}
              />
            </div>
            <button className="btn-plan" onClick={handlePlanRoute}>
              <i className="fas fa-directions"></i> {t('routes.planRoute')}
            </button>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="routes-grid">
          {routeData.map((route) => (
            <div 
              key={route.number} 
              className="route-card" 
              onClick={() => handleRouteClick(route.number)}
            >
              <div className="route-header" style={{ background: route.gradient }}>
                <span className="route-number">{route.number}</span>
                <span className="route-type">{t(`routes.${route.type}`)}</span>
              </div>
              <div className="route-body">
                <div className="route-name">{route.name}</div>
                <div className="route-info">
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>{route.frequency}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-map-pin"></i>
                    <span>{route.stops}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-hourglass-half"></i>
                    <span>{route.duration}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-ticket-alt"></i>
                    <span>{route.price}</span>
                  </div>
                </div>
                <div className="frequency-indicator">
                  <span className="frequency-label">{t('routes.frequency')}</span>
                  <div className="frequency-bar">
                    <div 
                      className="frequency-fill"
                      style={{
                        width: getFrequencyWidth(route.frequencyLevel),
                        background: getFrequencyColor(route.frequencyLevel)
                      }}
                    ></div>
                  </div>
                  <span className={`service-status status-${route.status}`}>
                    <i className="fas fa-circle"></i> {t(`status.${route.status}`)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Routes;
