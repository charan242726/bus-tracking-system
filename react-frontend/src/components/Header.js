import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.querySelector('.mobile-menu');
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      
      if (mobileMenu && mobileMenuBtn && 
          !mobileMenu.contains(event.target) && 
          !mobileMenuBtn.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="logo">
          <i className="fas fa-bus"></i>
          <div className="logo-text">Transit Track</div>
        </div>
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              {t('nav.home')}
            </Link>
          </li>
          <li>
            <Link 
              to="/live-tracking" 
              className={isActive('/live-tracking') ? 'active' : ''}
            >
              {t('nav.liveTracking')}
            </Link>
          </li>
          <li>
            <Link 
              to="/routes" 
              className={isActive('/routes') ? 'active' : ''}
            >
              {t('nav.routes')}
            </Link>
          </li>
          <li>
            <Link 
              to="/services" 
              className={isActive('/services') ? 'active' : ''}
            >
              {t('nav.services')}
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className={isActive('/contact') ? 'active' : ''}
            >
              {t('nav.contact')}
            </Link>
          </li>
        </ul>
        <div className="nav-right">
          {location.pathname === '/live-tracking' && (
            <button className="nav-btn" onClick={toggleFullscreen}>
              <i className="fas fa-expand"></i>
              <span>{t('nav.fullscreen')}</span>
            </button>
          )}
          <div className="language-selector">
            <select value={i18n.language} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-menu-links">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t('nav.home')}
            </Link>
          </li>
          <li>
            <Link 
              to="/live-tracking" 
              className={isActive('/live-tracking') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t('nav.liveTracking')}
            </Link>
          </li>
          <li>
            <Link 
              to="/routes" 
              className={isActive('/routes') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t('nav.routes')}
            </Link>
          </li>
          <li>
            <Link 
              to="/services" 
              className={isActive('/services') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t('nav.services')}
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className={isActive('/contact') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t('nav.contact')}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
