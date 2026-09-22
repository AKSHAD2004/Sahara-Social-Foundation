import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldAlert,
  Building 
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/db';

const Contact = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = language === 'mr' ? 'नाव आवश्यक आहे' : 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'mr' ? 'मोबाईल नंबर आवश्यक आहे' : 'Phone is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = language === 'mr' ? 'वैध १० अंकी मोबाईल नंबर टाका' : 'Valid 10-digit mobile required';
    }
    if (!formData.message.trim()) {
      newErrors.message = language === 'mr' ? 'संदेश किंवा प्रश्न लिहा' : 'Message is required';
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

      dbService.add('leads', {
        leadId: `LEAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerName: formData.name,
        mobile: formData.phone,
        email: formData.email,
        source: activeRef ? 'Affiliate' : 'Website Contact Page',
        interestedProduct: formData.subject || 'General Health Consultation',
        assignedEmployee: 'usr_emp_akash',
        assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
        leadStatus: 'New',
        priority: 'High',
        notes: `Subject: ${formData.subject || 'N/A'}. Message: ${formData.message}`
      });

      dbService.addNotification({
        title: 'New Website Contact Inquiry',
        message: `${formData.name} sent message: "${formData.subject || formData.message.slice(0, 30)}..."`,
        type: 'lead',
        link: '/crm/leads'
      });

      setIsSubmitted(true);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fef3c7' }}>
            <Phone size={16} />
            <span>{language === 'mr' ? 'संपर्क व मार्गदर्शन' : 'Contact & Guidance'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            {language === 'mr' ? 'सहारा सोशल फाऊंडेशनाशी संपर्क साधा' : 'Contact Sahara Social Foundation'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr'
              ? 'कार्यालय पत्ता, दूरध्वनी क्रमांक, व्हॉट्सअ‍ॅप आणि थेट समुपदेशन सेवा माहिती.'
              : 'Official Kolhapur office address, phone helplines, WhatsApp and consultation desk.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          {/* Main 2-Col Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.25fr',
            gap: '3rem',
            alignItems: 'flex-start',
            marginBottom: '3.5rem'
          }} className="contact-layout-grid">
            {/* Left Column: Authentic Info Cards */}
            <div>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                marginBottom: '1.75rem'
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.5rem' }}>
                  {language === 'mr' ? 'अधिकृत संपर्क माहिती' : 'Official Contact Info'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <MapPin size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#064e3b', marginBottom: '0.2rem' }}>
                        {language === 'mr' ? 'कार्यालय पत्ता (Office Address):' : 'Office Address:'}
                      </div>
                      <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                        {language === 'mr' ? organizationInfo.contact.address.fullAddressMr : organizationInfo.contact.address.fullAddressEn}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#f0fdf4',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Phone size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#064e3b', marginBottom: '0.2rem' }}>
                        {language === 'mr' ? 'हेल्पलाईन फोन नंबर:' : 'Helpline Numbers:'}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <a href={`tel:${organizationInfo.contact.primaryPhone}`} style={{ color: '#0284c7', fontWeight: 700, fontSize: '1.05rem' }}>
                          {organizationInfo.contact.primaryPhone}
                        </a>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <a href={`tel:${organizationInfo.contact.secondaryPhone}`} style={{ color: '#0284c7', fontWeight: 700, fontSize: '1.05rem' }}>
                          {organizationInfo.contact.secondaryPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#ecfdf5',
                      color: '#25d366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <WhatsAppIcon size={24} color="#25d366" animated={true} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#064e3b', marginBottom: '0.2rem' }}>
                        {language === 'mr' ? 'व्हॉट्सअ‍ॅप संवाद:' : 'WhatsApp Support:'}
                      </div>
                      <a
                        href={`https://wa.me/${organizationInfo.contact.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'underline' }}
                      >
                        +91 {organizationInfo.contact.primaryPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Important Visiting Note */}
                <div style={{
                  backgroundColor: '#fffbeb',
                  borderLeft: '4px solid #d97706',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1.75rem',
                  fontSize: '0.88rem',
                  color: '#92400e',
                  lineHeight: 1.5
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <ShieldAlert size={16} />
                    <span>{language === 'mr' ? 'महत्त्वाची सूचना:' : 'Visiting Note:'}</span>
                  </div>
                  {language === 'mr' ? organizationInfo.contact.visitingNoteMr : organizationInfo.contact.visitingNote}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.35rem', color: '#064e3b', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {language === 'mr' ? 'ऑनलाईन संदेश / चौकशी फॉर्म' : 'Send An Online Enquiry'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.75rem' }}>
                  {language === 'mr'
                    ? 'आपला प्रश्न किंवा समस्या खाली लिहा, आमची टीम लवकरच मार्गदर्शन करेल.'
                    : 'Submit your questions regarding campaigns or products. We will respond promptly.'}
                </p>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">
                          {language === 'mr' ? 'आपले नाव *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={language === 'mr' ? 'उदा. सचिन शिंदे' : 'e.g. Sachin Shinde'}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                      </div>

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
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        {errors.phone && <div className="form-error">{errors.phone}</div>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {language === 'mr' ? 'ईमेल पत्ता' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {language === 'mr' ? 'विषय (Subject)' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={language === 'mr' ? 'उदा. Antox D ऑर्डर किंवा मधुमेह मार्गदर्शन' : 'e.g. Product enquiry / Health query'}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {language === 'mr' ? 'आपला संदेश / प्रश्न *' : 'Your Message / Inquiry *'}
                      </label>
                      <textarea
                        rows={4}
                        className="form-textarea"
                        placeholder={language === 'mr' ? 'आपल्या आरोग्याविषयी किंवा फॉर्म्युलाविषयी प्रश्न लिहा...' : 'Write your detailed message here...'}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                      {errors.message && <div className="form-error">{errors.message}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <Send size={18} />
                      <span>{language === 'mr' ? 'संदेश पाठवा' : 'Send Message'}</span>
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem auto'
                    }}>
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>
                      {language === 'mr' ? 'संदेश यशस्वीरित्या प्राप्त झाला!' : 'Message Sent Successfully!'}
                    </h4>
                    <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {language === 'mr'
                        ? 'धन्यवाद! सहारा सोशल फाऊंडेशनची टीम लवकरच आपल्याशी संपर्क करेल.'
                        : 'Thank you! Our counseling team will contact you shortly.'}
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      {language === 'mr' ? 'नवीन संदेश पाठवा' : 'Send Another Message'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Embedded Google Map Section */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} style={{ color: '#059669' }} />
              <span style={{ fontWeight: 700, color: '#064e3b' }}>
                {language === 'mr' ? 'कार्यालय नकाशा स्थान: शाहूपुरी, कोल्हापूर' : 'Office Location: Shahupuri, Kolhapur'}
              </span>
            </div>
            <div style={{ width: '100%', height: '360px' }}>
              <iframe
                title="Sahara Social Foundation Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15286.082522731876!2d74.2255745!3d16.7028124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1001a1829e1eb%3A0x6b86cf2ff2be9ec5!2sShahupuri%2C%20Kolhapur%2C%20Maharashtra%20416001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .contact-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
