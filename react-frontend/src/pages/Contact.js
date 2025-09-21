import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
  };

  const serviceHours = [
    {
      day: t('contact.monday_friday'),
      time: t('contact.hours_6_10')
    },
    {
      day: t('contact.saturday'),
      time: t('contact.hours_7_8')
    },
    {
      day: t('contact.sunday'),
      time: t('contact.hours_8_6')
    },
    {
      day: t('contact.holidays'),
      time: t('contact.hours_9_5')
    }
  ];

  const contactMethods = [
    {
      icon: 'fas fa-phone',
      title: t('contact.contactMethods.customerService.title'),
      primary: t('contact.contactMethods.customerService.phone'),
      secondary: t('contact.contactMethods.customerService.waitTime')
    },
    {
      icon: 'fas fa-envelope',
      title: t('contact.contactMethods.emailSupport.title'),
      primary: t('contact.contactMethods.emailSupport.email'),
      secondary: t('contact.contactMethods.emailSupport.responseTime')
    },
    {
      icon: 'fas fa-tty',
      title: t('contact.contactMethods.ttyService.title'),
      primary: t('contact.contactMethods.ttyService.phone'),
      secondary: t('contact.contactMethods.ttyService.description')
    },
    {
      icon: 'fas fa-language',
      title: t('contact.contactMethods.multiLanguage.title'),
      primary: t('contact.contactMethods.multiLanguage.description'),
      secondary: t('contact.contactMethods.multiLanguage.instruction')
    }
  ];

  return (
    <div className="contact-page">
      {/* Page Hero */}
      <section className="page-hero">
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.subtitle')}</p>
      </section>

      <div className="container">
        <div className="contact-grid">
          {/* Contact Form Section */}
          <div className="contact-section">
            <h2 className="section-title">
              <i className="fas fa-envelope"></i>
              {t('contact.sendMessage')}
            </h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">{t('contact.fullName')}</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t('contact.emailAddress')}</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">{t('contact.phoneNumber')}</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">{t('contact.category')}</label>
                <select 
                  id="category" 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('contact.selectCategory')}</option>
                  <option value="general">{t('contact.categories.general')}</option>
                  <option value="complaint">{t('contact.categories.complaint')}</option>
                  <option value="feedback">{t('contact.categories.feedback')}</option>
                  <option value="lost-found">{t('contact.categories.lostFound')}</option>
                  <option value="schedule">{t('contact.categories.schedule')}</option>
                  <option value="technical">{t('contact.categories.technical')}</option>
                  <option value="accessibility">{t('contact.categories.accessibility')}</option>
                  <option value="safety">{t('contact.categories.safety')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">{t('contact.message')}</label>
                <textarea 
                  id="message" 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-submit">{t('contact.submitMessage')}</button>
            </form>
            <div className="response-time">
              <p><i className="fas fa-clock"></i> {t('contact.responseTime')}</p>
            </div>
          </div>

          {/* Customer Service Section */}
          <div className="contact-section">
            <h2 className="section-title">
              <i className="fas fa-headset"></i>
              {t('contact.customerService')}
            </h2>
            <div className="service-hours">
              <h3>{t('contact.serviceHours')}</h3>
              <div className="hours-grid">
                {serviceHours.map((hour, index) => (
                  <div key={index} className="hours-item">
                    <span className="day">{hour.day}</span>
                    <span className="time">{hour.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-methods">
              {contactMethods.map((method, index) => (
                <div key={index} className="contact-method">
                  <i className={`${method.icon} method-icon`}></i>
                  <div className="method-info">
                    <h4>{method.title}</h4>
                    <p>{method.primary}</p>
                    <p>{method.secondary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
