import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  // Add interactive hover effects
  useEffect(() => {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      const handleMouseEnter = () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
      };
      
      const handleMouseLeave = () => {
        card.style.transform = 'translateY(0) scale(1)';
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      // Cleanup
      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, []);

  const features = [
    {
      icon: 'fas fa-satellite',
      titleKey: 'features.gps.title',
      descKey: 'features.gps.desc'
    },
    {
      icon: 'fas fa-clock',
      titleKey: 'features.schedule.title',
      descKey: 'features.schedule.desc'
    },
    {
      icon: 'fas fa-mobile-alt',
      titleKey: 'features.mobile.title',
      descKey: 'features.mobile.desc'
    },
    {
      icon: 'fas fa-chart-line',
      titleKey: 'features.analytics.title',
      descKey: 'features.analytics.desc'
    },
    {
      icon: 'fas fa-bell',
      titleKey: 'features.alerts.title',
      descKey: 'features.alerts.desc'
    },
    {
      icon: 'fas fa-shield-alt',
      titleKey: 'features.security.title',
      descKey: 'features.security.desc'
    }
  ];

  return (
    <section className="features" id="services">
      <div className="container">
        <h2 className="section-title">{t('features.title')}</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <i className={`${feature.icon} feature-icon`}></i>
              <h3 className="feature-title">{t(feature.titleKey)}</h3>
              <p className="feature-description">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
