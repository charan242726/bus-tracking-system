import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Stats = () => {
  const { t } = useTranslation();
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  const stats = [
    { number: '250+', labelKey: 'stats.buses' },
    { number: '45', labelKey: 'stats.routes' },
    { number: '50K+', labelKey: 'stats.passengers' },
    { number: '99.8%', labelKey: 'stats.uptime' }
  ];

  const animateNumber = (element, target) => {
    const isPercentage = target.includes('%');
    const isK = target.includes('K');
    const isPlus = target.includes('+');
    const numericTarget = parseInt(target.replace(/[^0-9.]/g, ''));
    
    let current = 0;
    const increment = numericTarget / 50;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        current = numericTarget;
        clearInterval(timer);
      }
      
      let displayValue = Math.floor(current);
      if (isK) displayValue = displayValue + 'K';
      if (isPercentage) displayValue = displayValue + '%';
      if (isPlus) displayValue = displayValue + '+';
      
      element.textContent = displayValue;
    }, 50);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach((stat, index) => {
              const finalNumber = stats[index].number;
              stat.textContent = '0';
              
              setTimeout(() => {
                animateNumber(stat, finalNumber);
              }, index * 200);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const currentStatsRef = statsRef.current;
    if (currentStatsRef) {
      observer.observe(currentStatsRef);
    }

    return () => {
      if (currentStatsRef) {
        observer.unobserve(currentStatsRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnimated]);

  return (
    <section className="stats" ref={statsRef}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <div className="stat-label">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
