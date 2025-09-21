import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const QuickAccess = () => {
  const { t } = useTranslation();

  // Add interactive hover effects
  useEffect(() => {
    const accessCards = document.querySelectorAll('.access-card');
    
    accessCards.forEach(card => {
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

  const accessItems = [
    {
      icon: 'fas fa-search-location',
      titleKey: 'quickAccess.nearestStop.title',
      descKey: 'quickAccess.nearestStop.desc'
    },
    {
      icon: 'fas fa-calendar-alt',
      titleKey: 'quickAccess.schedule.title',
      descKey: 'quickAccess.schedule.desc'
    },
    {
      icon: 'fas fa-exclamation-triangle',
      titleKey: 'quickAccess.alerts.title',
      descKey: 'quickAccess.alerts.desc'
    },
    {
      icon: 'fas fa-phone-alt',
      titleKey: 'quickAccess.support.title',
      descKey: 'quickAccess.support.desc'
    }
  ];

  return (
    <section className="quick-access">
      <div className="container">
        <h2 className="section-title">{t('quickAccess.title')}</h2>
        <div className="access-grid">
          {accessItems.map((item, index) => (
            <div key={index} className="access-card">
              <i className={`${item.icon} access-icon`}></i>
              <h3>{t(item.titleKey)}</h3>
              <p>{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
