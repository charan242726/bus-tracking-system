import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t('footer.department')}</h3>
          <p>{t('footer.description')}</p>
        </div>
        <div className="footer-section">
          <h3>{t('footer.quickLinks')}</h3>
          <ul>
            <li><Link to="/live-tracking">{t('nav.liveTracking')}</Link></li>
            <li><Link to="/routes">{t('footer.routeMaps')}</Link></li>
            <li><a href="#schedules">{t('footer.schedules')}</a></li>
            <li><a href="#alerts">{t('footer.serviceAlerts')}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>{t('footer.support')}</h3>
          <ul>
            <li><a href="#help">{t('footer.helpCenter')}</a></li>
            <li><Link to="/contact">{t('footer.contactUs')}</Link></li>
            <li><a href="#feedback">{t('footer.feedback')}</a></li>
            <li><a href="#accessibility">{t('footer.accessibility')}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>{t('footer.contact')}</h3>
          <ul>
            <li><i className="fas fa-phone"></i> 1-800-TRANSIT</li>
            <li><i className="fas fa-envelope"></i> info@transit.gov</li>
            <li><i className="fas fa-map-marker-alt"></i> 123 Government Plaza</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 {t('footer.department')}. {t('footer.rights')} | {t('footer.privacy')} | {t('footer.terms')}</p>
      </div>
    </footer>
  );
};

export default Footer;
