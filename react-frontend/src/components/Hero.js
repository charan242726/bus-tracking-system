import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  const handleScrollToRoutes = (e) => {
    e.preventDefault();
    const target = document.querySelector('#routes');
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.subtitle')}</p>
        <div className="cta-buttons">
          <Link to="/live-tracking" className="btn btn-primary">
            <i className="fas fa-map-marker-alt"></i>
            <span>{t('hero.trackBus')}</span>
          </Link>
          <a href="#routes" className="btn btn-secondary" onClick={handleScrollToRoutes}>
            <i className="fas fa-route"></i>
            <span>{t('hero.viewRoutes')}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
