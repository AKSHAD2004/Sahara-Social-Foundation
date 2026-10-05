import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Mail, 
  ShieldAlert, 
  Heart, 
  ExternalLink,
  Users
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo, socialLinks } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import MissionLogoBadge from './MissionLogoBadge';

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Top Notice Box in Footer */}
        <div className="footer-notice-box">
          <div className="footer-notice-icon-box">
            <ShieldAlert size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="footer-notice-title" style={{ fontWeight: 700, color: '#FFC928', fontSize: '0.96rem', marginBottom: '0.2rem' }}>
              {language === 'mr' ? 'महत्त्वाची सूचना व मार्गदर्शन:' : 'Important Notice & Regimen Guidance:'}
            </div>
            <p className="footer-notice-text" style={{ fontSize: '0.86rem', color: '#e2faea', lineHeight: 1.45, margin: 0 }}>
              {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
            </p>
          </div>
        </div>

        {/* 4-Column Main Grid */}
        <div className="grid-4 footer-main-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-brand-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <MissionLogoBadge size={44} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '1.08rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
                  {language === 'mr' ? organizationInfo.nameMr : organizationInfo.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
                  {language === 'mr' ? 'कोल्हापूर (महाराष्ट्र)' : 'Kolhapur (Maharashtra)'}
                </span>
              </div>
            </div>

            <p className="footer-brand-desc" style={{ fontSize: '0.84rem', color: '#a7f3d0', lineHeight: 1.55, marginBottom: '1rem' }}>
              {language === 'mr' 
                ? 'मधुमेह मुक्त भारत आणि व्यसनमुक्त भारत अभियानांतर्गत समाजातील प्रत्येक व्यक्तीला निरोगी बनवण्यासाठी कटिबद्ध सामाजिक संस्था.'
                : 'A dedicated social welfare foundation promoting nationwide diabetes awareness, addiction-free rehabilitation, and Nutraceutical wellness.'}
            </p>

            {/* Official Social Media Links */}
            <div className="footer-social-row" style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="Facebook"
                aria-label="Facebook"
              >
                <FacebookIcon size={18} />
              </a>

              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>

              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="YouTube"
                aria-label="YouTube"
              >
                <YoutubeIcon size={18} />
              </a>

              <a
                href={socialLinks.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn footer-wa-btn"
                title="Join WhatsApp Group"
                aria-label="WhatsApp Group"
              >
                <WhatsAppIcon size={19} color="#ffffff" animated={true} />
              </a>
            </div>

            <div className="footer-assoc-center" style={{ fontSize: '0.78rem', color: '#ecfdf5', opacity: 0.9 }}>
              <strong>{language === 'mr' ? 'सहयोगी केंद्र:' : 'Associated Center:'}</strong><br />
              {language === 'mr' ? organizationInfo.associatedCenterMr : organizationInfo.associatedCenter}
            </div>
          </div>

          {/* Grouped Links: Rendered as 2-column grid on mobile to dramatically reduce vertical scroll space */}
          <div className="footer-links-wrapper">
            {/* Col 2: Quick Links */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">
                {language === 'mr' ? 'मुख्य लिंक्स' : 'Quick Navigation'}
              </h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/" className="footer-link">
                    → {language === 'mr' ? 'मुख्यपृष्ठ (Home)' : 'Home'}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link">
                    → {language === 'mr' ? 'संस्थेविषयी (About)' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="footer-link">
                    → {language === 'mr' ? 'आरोग्य सेवा' : 'Services'}
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="footer-link">
                    → {language === 'mr' ? 'आयुर्वेदिक उत्पादने' : 'Products'}
                  </Link>
                </li>
                <li>
                  <Link to="/photos" className="footer-link">
                    → {language === 'mr' ? 'छायाचित्रे' : 'Photo Gallery'}
                  </Link>
                </li>
                <li>
                  <Link to="/videos" className="footer-link">
                    → {language === 'mr' ? 'रुग्णांचे व्हिडिओ' : 'Result Videos'}
                  </Link>
                </li>
                <li>
                  <Link to="/study-report" className="footer-link">
                    → {language === 'mr' ? 'क्लिनिकल रिपोर्ट' : 'Clinical Report'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Campaigns & Policies */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">
                {language === 'mr' ? 'अभियान व धोरणे' : 'Campaigns & Policies'}
              </h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/services" className="footer-link">
                    • {language === 'mr' ? 'मधुमेह मुक्त भारत' : 'Madhumeh Mukt'}
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="footer-link">
                    • {language === 'mr' ? 'व्यसनमुक्त भारत' : 'Vyasanmukt'}
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="footer-link">
                    • {language === 'mr' ? 'माझे खाते' : 'My Account'}
                  </Link>
                </li>
                <li>
                  <Link to="/affiliate" className="footer-link">
                    • {language === 'mr' ? 'समाज सेवक' : 'Affiliate'}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="footer-link">
                    • {language === 'mr' ? 'गोपनीयता' : 'Privacy'}
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="footer-link">
                    • {language === 'mr' ? 'परतावा' : 'Refunds'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">
              {language === 'mr' ? 'कार्यालय संपर्क' : 'Contact Us'}
            </h4>
            
            <div className="footer-contact-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <MapPin size={17} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {language === 'mr' ? organizationInfo.contact.address.fullAddressMr : organizationInfo.contact.address.fullAddressEn}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Phone size={17} style={{ color: '#34d399', flexShrink: 0 }} />
                <div>
                  <a href={`tel:${organizationInfo.contact.primaryPhone}`} style={{ color: '#ffffff', fontWeight: 700 }}>
                    {organizationInfo.contact.primaryPhone}
                  </a>
                  <span style={{ margin: '0 0.4rem', opacity: 0.6 }}>/</span>
                  <a href={`tel:${organizationInfo.contact.secondaryPhone}`} style={{ color: '#ffffff', fontWeight: 700 }}>
                    {organizationInfo.contact.secondaryPhone}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <WhatsAppIcon size={17} color="#34d399" />
                <a
                  href={`https://wa.me/${organizationInfo.contact.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline' }}
                >
                  WhatsApp: +91 {organizationInfo.contact.primaryPhone}
                </a>
              </div>

              <div className="footer-visiting-note" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                color: '#FFC928',
                border: '1px solid rgba(255, 201, 40, 0.25)'
              }}>
                {language === 'mr' ? organizationInfo.contact.visitingNoteMr : organizationInfo.contact.visitingNote}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="footer-bottom-bar">
          <div>
            © {new Date().getFullYear()} {organizationInfo.name} ({organizationInfo.nameMr}) | Founded & Led by <strong>Sana Sayyad</strong>.
          </div>

          <div className="footer-bottom-links" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/privacy-policy" style={{ color: '#d1fae5' }}>Privacy Policy</Link>
            <Link to="/refund-policy" style={{ color: '#d1fae5' }}>Refund Policy</Link>
            <Link to="/contact" style={{ color: '#d1fae5' }}>Help & Support</Link>
          </div>
        </div>

        <div className="footer-medical-disclaimer">
          {language === 'mr'
            ? 'वैद्यकीय अस्वीकरण: या संकेतस्थळावरील माहिती केवळ जनजागृती आणि शैक्षणिक उद्देशाने आहे. गंभीर आजारांच्या बाबतीत आपल्या तज्ज्ञ डॉक्टरांचा व समुपदेशकांचा सल्ला अवश्य घ्या.'
            : 'Medical Disclaimer: Information on this website is for educational and public wellness purposes. Consult qualified health counselors or physicians for clinical care.'}
        </div>
      </div>

      <style>{`
        .site-footer {
          background-color: #04200e;
          color: #d6fae0;
          padding-top: 3rem;
          padding-bottom: 2rem;
          border-top: 4px solid #159B32;
          margin-top: auto;
        }

        .footer-notice-box {
          background-color: rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 1.15rem 1.35rem;
          margin-bottom: 2.25rem;
          border: 1px solid rgba(255, 201, 40, 0.35);
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .footer-notice-icon-box {
          background: linear-gradient(135deg, #FFC928, #e6a70a);
          color: #17251B;
          padding: 0.35rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .footer-main-grid {
          margin-bottom: 2.25rem;
        }

        .footer-links-wrapper {
          display: contents;
        }

        .footer-col-title {
          color: #ffffff;
          font-size: 0.98rem;
          font-weight: 700;
          margin-bottom: 0.85rem;
          border-bottom: 2px solid #159B32;
          padding-bottom: 0.3rem;
          display: inline-block;
        }

        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          font-size: 0.88rem;
        }

        .footer-link {
          color: #d6fae0;
          transition: color 0.2s ease;
          display: inline-block;
        }

        .footer-link:hover {
          color: #FFC928;
        }

        .footer-social-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .footer-social-btn:hover {
          background-color: #159B32;
          color: #ffffff;
        }

        .footer-wa-btn {
          background-color: #25d366 !important;
        }

        .footer-bottom-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding-top: 1.15rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.82rem;
          color: #a7f0ba;
        }

        .footer-medical-disclaimer {
          margin-top: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          font-size: 0.74rem;
          color: #80c497;
          text-align: center;
          line-height: 1.4;
        }

        /* =======================================================
           COMPACT FOOTER FOR MOBILE DEVICES (< 768px)
           Significantly reduces vertical space and scrolling
           ======================================================= */
        @media (max-width: 768px) {
          .site-footer {
            padding-top: 1.25rem !important;
            padding-bottom: 1.25rem !important;
          }

          .footer-notice-box {
            margin-bottom: 1rem !important;
            padding: 0.6rem 0.8rem !important;
            gap: 0.5rem !important;
            border-radius: 10px !important;
          }

          .footer-notice-icon-box {
            padding: 0.25rem !important;
          }

          .footer-notice-title {
            font-size: 0.82rem !important;
            margin-bottom: 0.15rem !important;
          }

          .footer-notice-text {
            font-size: 0.76rem !important;
            line-height: 1.35 !important;
          }

          .footer-main-grid {
            margin-bottom: 1rem !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }

          .footer-brand-header {
            margin-bottom: 0.45rem !important;
          }

          .footer-brand-desc {
            font-size: 0.78rem !important;
            line-height: 1.42 !important;
            margin-bottom: 0.65rem !important;
          }

          .footer-social-row {
            margin-bottom: 0.65rem !important;
            gap: 0.45rem !important;
          }

          .footer-social-btn {
            width: 32px !important;
            height: 32px !important;
            border-radius: 8px !important;
          }

          .footer-assoc-center {
            font-size: 0.74rem !important;
            line-height: 1.35 !important;
          }

          /* Two-column side-by-side links on mobile (halves link height!) */
          .footer-links-wrapper {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.75rem 1rem !important;
            width: 100% !important;
          }

          .footer-col-title {
            font-size: 0.84rem !important;
            margin-bottom: 0.35rem !important;
            padding-bottom: 0.15rem !important;
          }

          .footer-links-list {
            gap: 0.28rem !important;
            font-size: 0.76rem !important;
          }

          .footer-contact-list {
            gap: 0.4rem !important;
            font-size: 0.76rem !important;
          }

          .footer-visiting-note {
            padding: 0.35rem 0.6rem !important;
            font-size: 0.7rem !important;
            border-radius: 6px !important;
          }

          .footer-bottom-bar {
            padding-top: 0.65rem !important;
            font-size: 0.7rem !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.4rem !important;
          }

          .footer-bottom-links {
            gap: 0.75rem !important;
            justify-content: center !important;
          }

          .footer-medical-disclaimer {
            margin-top: 0.45rem !important;
            padding-top: 0.35rem !important;
            font-size: 0.65rem !important;
            line-height: 1.32 !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
