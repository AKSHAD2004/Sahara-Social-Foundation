import React, { useState } from 'react';
import { X, CheckCircle, Phone, Calendar, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';

const ConsultationModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    category: 'diabetes',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = language === 'mr' ? 'कृपया पूर्ण नाव प्रविष्ट करा' : 'Please enter full name';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'mr' ? 'मोबाईल नंबर आवश्यक आहे' : 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका' : 'Please enter valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const activeRef = localStorage.getItem('sahara_active_ref') || '';
      const users = dbService.getAll('users');
      const matchingAffiliate = users.find((u) => u.referralCode && u.referralCode.toUpperCase() === activeRef.toUpperCase());

      // Create CRM Lead
      dbService.add('leads', {
        leadId: `LEAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerName: formData.name,
        mobile: formData.phone,
        email: '',
        source: activeRef ? 'Affiliate' : 'Website Consultation',
        interestedProduct: formData.category === 'diabetes' ? 'Antox D & Antox T (Diabetes Support Kit)' : 'Samarth Ayurvedic Consultation',
        assignedEmployee: 'usr_emp_sneha',
        assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
        leadStatus: 'New',
        priority: 'High',
        notes: `City: ${formData.city}. Query: ${formData.message || 'Booked Free Consultation'}`
      });

      // Notify CRM
      dbService.addNotification({
        title: 'New Health Consultation Booking',
        message: `${formData.name} (${formData.city}) booked a free consultation.`,
        type: 'lead',
        link: '/crm/leads'
      });

      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      city: '',
      category: 'diabetes',
      message: ''
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div className="modal-content modal-consultation-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleReset}
          className="modal-close-trigger"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Calendar size={22} style={{ color: '#087E8B', flexShrink: 0 }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#12355B', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'मोफत आरोग्य समुपदेशन नोंदणी' : 'Free Health Counseling Booking'}
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#4f6182', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {language === 'mr'
                ? 'खालील फॉर्म भरा. सहारा सोशल फाऊंडेशनचे तज्ज्ञ समुपदेशक तुम्हाला आहार व आयुर्वेदिक उपचारांसाठी फोनवर मार्गदर्शन करतील.'
                : 'Fill the form below. Our health counselor will contact you for dietary advice and natural Ayurvedic support.'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={language === 'mr' ? 'उदा. सुरेश पाटील' : 'e.g. Suresh Patil'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="modal-form-row">
                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'गाव / शहर' : 'City / Village'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={language === 'mr' ? 'उदा. कोल्हापूर' : 'e.g. Kolhapur'}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'आरोग्य समस्या / विषय *' : 'Health Topic / Concern *'}
                </label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="diabetes">{language === 'mr' ? 'मधुमेह (Diabetes Care)' : 'Diabetes Care'}</option>
                  <option value="addiction">{language === 'mr' ? 'व्यसनमुक्ती (De-Addiction)' : 'De-Addiction (Alcohol/Tobacco)'}</option>
                  <option value="heart">{language === 'mr' ? 'हृदय व रक्तदाब (Heart & BP)' : 'Heart & Blood Pressure'}</option>
                  <option value="liver">{language === 'mr' ? 'यकृत व लिव्हर काळजी (Liver Care)' : 'Liver & Detox'}</option>
                  <option value="kidney">{language === 'mr' ? 'मूत्रपिंड आरोग्य (Kidney Health)' : 'Kidney Health'}</option>
                  <option value="bones">{language === 'mr' ? 'सांधेदुखी व गुडघेदुखी (Joint Pain)' : 'Joints & Arthritis'}</option>
                  <option value="acidity">{language === 'mr' ? 'पित्त व अपचन (Acidity & Gas)' : 'Acidity & Digestion'}</option>
                  <option value="other">{language === 'mr' ? 'इतर आरोग्य मार्गदर्शन' : 'General Vitality'}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'काही विशेष माहिती / प्रश्न' : 'Any Specific Question / Notes'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder={language === 'mr' ? 'उदा. गेल्या ५ वर्षांपासून साखर जास्त आहे...' : 'Briefly describe your symptoms...'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '46px' }}>
                <Send size={16} />
                <span>{language === 'mr' ? 'समुपदेशनासाठी विनंती पाठवा' : 'Submit Consultation Request'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#dbf7fa',
              color: '#087E8B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle size={34} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#12355B', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'आपली नोंदणी यशस्वी झाली आहे!' : 'Request Received Successfully!'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#4f6182', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {language === 'mr'
                ? `धन्यवाद ${formData.name}. आमचे समुपदेशक लवकरच ${formData.phone} वर संपर्क करतील.`
                : `Thank you ${formData.name}. Our health counseling team will call you shortly on ${formData.phone}.`}
            </p>

            <div style={{
              backgroundColor: '#F5F7FA',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid #e2eaf4',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.82rem', color: '#4f6182', marginBottom: '0.3rem' }}>
                {language === 'mr' ? 'तातडीच्या मार्गदर्शनासाठी थेट कॉल करा:' : 'For immediate guidance, call directly:'}
              </div>
              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                style={{ fontSize: '1.15rem', fontWeight: 800, color: '#087E8B' }}
              >
                <Phone size={15} style={{ display: 'inline', marginRight: '6px' }} />
                {organizationInfo.contact.primaryPhone}
              </a>
            </div>

            <button type="button" onClick={handleReset} className="btn btn-outline" style={{ width: '100%' }}>
              <span>{language === 'mr' ? 'बंद करा' : 'Close'}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .modal-consultation-content {
          padding: 1.75rem;
        }

        .modal-close-trigger {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background-color: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
        }

        .modal-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 480px) {
          .modal-consultation-content {
            padding: 1.25rem 1rem;
          }
          .modal-form-row {
            grid-template-columns: 1fr !important;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsultationModal;
