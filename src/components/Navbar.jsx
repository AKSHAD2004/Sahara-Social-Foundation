import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, 
  ShoppingCart, 
  Menu, 
  X, 
  Globe, 
  ShieldCheck, 
  User,
  Heart,
  Users,
  LogOut
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MissionLogoBadge from './MissionLogoBadge';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { totalCount } = useCart();
  const { customerUser, logoutCustomer } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { nameEn: 'Home', nameMr: 'मुख्यपृष्ठ', path: '/' },
    { nameEn: 'About', nameMr: 'संस्थेविषयी', path: '/about' },
    { nameEn: 'Services', nameMr: 'सेवा', path: '/services' },
    { nameEn: 'Shop', nameMr: 'उत्पादने', path: '/shop' },
    { nameEn: 'Photos', nameMr: 'फोटो', path: '/photos' },
    { nameEn: 'Videos', nameMr: 'व्हिडिओ', path: '/videos' },
    { nameEn: 'Contact', nameMr: 'संपर्क', path: '/contact' },
  ];

  return (
    <>
      {/* Top Announcement Bar (Auto-adjusting across Mobile, Tablet, Desktop) */}
      <div className="top-announcement-bar">
        <div className="container topbar-container">
          {/* Mission Tagline (Left side in webview) */}
          <div className="topbar-mission">
            <span className="topbar-mission-text">
              <ShieldCheck size={14} className="topbar-icon" />
              <span>
                {language === 'mr' 
                  ? 'मधुमेह मुक्त भारत व व्यसनमुक्त भारत अभियान' 
                  : 'Madhumeh Mukt Bharat & Vyasanmukt Bharat Abhiyan'}
              </span>
            </span>
          </div>

          {/* Right Side Group: Affiliate + CRM + Language */}
          <div className="topbar-actions">
            {/* Affiliate Portal link */}
            <Link 
              to="/affiliate" 
              className="topbar-affiliate-link"
              title="Affiliate / समाज सेवक पोर्टल"
            >
              <Users size={12} className="topbar-affiliate-icon" />
              <span>{language === 'mr' ? 'समाज सेवक' : 'Affiliate'}</span>
            </Link>

            <span className="topbar-divider">|</span>

            {/* CRM Admin Portal link */}
            <Link 
              to="/crm" 
              className="topbar-affiliate-link"
              style={{ color: '#fde047', fontWeight: 600 }}
              title="Sahara CRM & Sales Management Portal"
            >
              <ShieldCheck size={12} className="topbar-affiliate-icon" />
              <span>{language === 'mr' ? 'प्रशासन CRM' : 'Staff CRM'}</span>
            </Link>

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="topbar-lang-btn"
              title="Change Language / भाषा बदला"
              aria-label="Toggle language"
            >
              <Globe size={13} />
              <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className={`main-header ${isScrolled ? 'main-header-scrolled' : ''}`}>
        <div className="container header-container">
          {/* Logo & Brand Identity */}
          <Link to="/" className="brand-identity-link">
            <MissionLogoBadge size={isScrolled ? 38 : 46} style={{ filter: 'none', flexShrink: 0 }} />
            <div className="brand-text-block">
              <div className="brand-title">
                {language === 'mr' ? organizationInfo.nameMr : organizationInfo.name}
              </div>
              <div className="brand-subtitle">
                {language === 'mr' ? 'मधुमेह मुक्त भारत अभियान • कोल्हापूर' : 'Mission Diabetes Free India • Kolhapur'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-menu">
            <ul className="desktop-nav-list">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`desktop-nav-item ${isActive ? 'active' : ''}`}
                    >
                      {language === 'mr' ? link.nameMr : link.nameEn}
                      {isActive && <span className="nav-active-indicator" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="header-actions">
            {/* Desktop Direct Helpline */}
            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call btn-sm desktop-action-btn"
            >
              <Phone size={15} />
              <span>{organizationInfo.contact.primaryPhone}</span>
            </a>

            {/* Desktop WhatsApp Action */}
            <a
              href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                language === 'mr'
                  ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवा आणि फॉर्म्युलाबद्दल माहिती हवी आहे.'
                  : 'Hello, I would like to know more about Sahara Social Foundation and your health services.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm desktop-action-btn"
            >
              <WhatsAppIcon size={16} animated={true} />
              <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
            </a>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="header-icon-btn"
              title={language === 'mr' ? 'कार्ट पहा' : 'View Cart'}
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={19} />
              {totalCount > 0 && (
                <span className="cart-badge-count">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Account Icon */}
            <Link
              to="/account"
              className="header-icon-btn"
              title={customerUser ? (customerUser.fullName || 'My Account') : (language === 'mr' ? 'माझे खाते' : 'My Account')}
              aria-label="User Account"
              style={{ position: 'relative' }}
            >
              <User size={19} />
              {customerUser && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '1.5px solid #ffffff'
                  }}
                  title={language === 'mr' ? 'लॉगिन केलेले आहे' : 'Logged in'}
                />
              )}
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <div className="container">
              <ul className="mobile-drawer-list">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`mobile-drawer-link ${isActive ? 'active' : ''}`}
                      >
                        {language === 'mr' ? link.nameMr : link.nameEn}
                      </Link>
                    </li>
                  );
                })}

                {/* Mobile Drawer Account & Logout Link */}
                <li style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                  <Link
                    to="/account"
                    className={`mobile-drawer-link ${location.pathname === '/account' ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} />
                      {customerUser ? (customerUser.fullName || (language === 'mr' ? 'माझे खाते' : 'My Account')) : (language === 'mr' ? 'माझे खाते / लॉगिन' : 'My Account / Login')}
                    </span>
                    {customerUser && (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        {language === 'mr' ? 'लॉगिन' : 'Active'}
                      </span>
                    )}
                  </Link>
                </li>

                {customerUser && (
                  <li>
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#fff1f2',
                        color: '#e11d48',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} />
                      <span>{language === 'mr' ? 'खाते लॉग आऊट करा' : 'Logout Account'}</span>
                    </button>
                  </li>
                )}

                {/* Mobile Call & WhatsApp quick shortcuts in drawer */}
                <li className="mobile-drawer-actions">
                  <a
                    href={`tel:${organizationInfo.contact.primaryPhone}`}
                    className="btn btn-call btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Phone size={15} />
                    <span>{language === 'mr' ? 'कॉल करा' : 'Call'}</span>
                  </a>
                  <a
                    href={`https://wa.me/${organizationInfo.contact.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-sm"
                    style={{ flex: 1 }}
                  >
                    <WhatsAppIcon size={16} animated={true} />
                    <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* Embedded CSS for Adaptive Viewport Layout */}
      <style>{`
        /* Top Announcement Bar */
        .top-announcement-bar {
          background-color: #064e3b;
          color: #d1fae5;
          font-size: 0.82rem;
          padding: 0.35rem 0;
          border-bottom: 1px solid rgba(16, 185, 129, 0.25);
          width: 100%;
        }

        .topbar-container {
          display: flex;
          justifyContent: space-between;
          align-items: center;
          width: 100%;
          gap: 1rem;
        }

        .topbar-mission {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
        }

        .topbar-mission-text {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          color: #fef3c7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-icon {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-left: auto;
          flex-shrink: 0;
        }

        .topbar-phone-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #d1fae5;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .topbar-phone-link:hover {
          color: #ffffff;
        }

        .topbar-action-icon {
          color: #34d399;
        }

        .topbar-phone-text-desktop {
          display: inline;
        }

        .topbar-phone-text-mobile {
          display: none;
        }

        .topbar-divider {
          color: rgba(255, 255, 255, 0.35);
          font-size: 0.8rem;
          user-select: none;
        }

        .topbar-affiliate-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #a7f3d0;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .topbar-affiliate-link:hover {
          color: #ffffff;
        }

        .topbar-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .topbar-lang-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: #ffffff;
        }

        /* Main Header */
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: #ffffff;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          padding: 0.75rem 0;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .main-header-scrolled {
          background-color: rgba(255, 255, 255, 0.98);
          padding: 0.5rem 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .brand-identity-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          min-width: 0;
          flex-shrink: 1;
        }

        .brand-logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(6, 95, 70, 0.2);
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .main-header-scrolled .brand-logo-img {
          width: 38px;
          height: 38px;
        }

        .brand-text-block {
          min-width: 0;
        }

        .brand-title {
          font-size: 1.08rem;
          font-weight: 800;
          color: #064e3b;
          line-height: 1.15;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .brand-subtitle {
          font-size: 0.68rem;
          color: #059669;
          font-weight: 700;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Desktop Nav */
        .desktop-nav-menu {
          display: none;
        }

        .desktop-nav-list {
          display: flex;
          align-items: center;
          list-style: none;
          gap: 0.65rem;
          margin: 0;
          padding: 0;
        }

        .desktop-nav-item {
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          position: relative;
          padding: 0.4rem 0.45rem;
          text-decoration: none;
          white-space: nowrap;
          display: inline-block;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .desktop-nav-item:hover,
        .desktop-nav-item.active {
          color: #047857;
          background-color: #f0fdf4;
          font-weight: 700;
        }

        .nav-active-indicator {
          position: absolute;
          bottom: 2px;
          left: 6px;
          right: 6px;
          height: 2.5px;
          background-color: #047857;
          border-radius: 2px;
        }

        /* Action Buttons */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .desktop-action-btn {
          display: none;
        }

        .header-icon-btn {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: #f1f5f9;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .header-icon-btn:hover {
          background-color: #e2e8f0;
          color: #064e3b;
        }

        .cart-badge-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #059669;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .mobile-hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          cursor: pointer;
          color: #1e293b;
          transition: all 0.2s ease;
        }

        .mobile-hamburger-btn:hover {
          background-color: #e2e8f0;
        }

        /* Mobile Drawer */
        .mobile-drawer {
          background-color: #ffffff;
          border-top: 1px solid #e2e8f0;
          padding: 1.25rem 0;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-drawer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mobile-drawer-link {
          display: block;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          background-color: transparent;
          color: #1e293b;
          font-weight: 500;
          font-size: 0.98rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .mobile-drawer-link:hover,
        .mobile-drawer-link.active {
          background-color: #ecfdf5;
          color: #065f46;
          font-weight: 700;
        }

        .mobile-drawer-actions {
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        /* =========================================================
           RESPONSIVE VIEWPORT BREAKPOINTS (MOBILE, TABLET, DESKTOP)
           ========================================================= */
        @media (min-width: 1024px) {
          .desktop-nav-menu {
            display: block !important;
          }
          .desktop-action-btn {
            display: inline-flex !important;
          }
          .mobile-hamburger-btn {
            display: none !important;
          }
        }

        /* Tablet View (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 768px) {
          .brand-logo-img {
            width: 40px;
            height: 40px;
          }
          .brand-title {
            font-size: 0.98rem;
          }
          .brand-subtitle {
            font-size: 0.65rem;
          }
          .topbar-mission-text {
            font-size: 0.78rem;
          }
        }

        /* Mobile View (< 768px) */
        @media (max-width: 767px) {
          .top-announcement-bar {
            padding: 0.35rem 0;
          }

          .topbar-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.3rem;
          }

          .topbar-mission {
            justify-content: center;
            width: 100%;
          }

          .topbar-mission-text {
            font-size: 0.74rem;
            text-align: center;
            white-space: normal;
            line-height: 1.25;
          }

          .topbar-actions {
            justify-content: space-between;
            width: 100%;
            margin-left: 0;
            padding: 0 0.25rem;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            padding-top: 0.3rem;
          }

          .topbar-phone-text-desktop {
            display: none;
          }

          .topbar-phone-text-mobile {
            display: inline;
            color: #fef3c7;
            font-weight: 700;
          }

          .topbar-divider {
            display: none;
          }

          .topbar-affiliate-link {
            font-size: 0.75rem;
          }

          .topbar-lang-btn {
            padding: 0.15rem 0.5rem;
            font-size: 0.72rem;
          }

          .brand-logo-img {
            width: 38px;
            height: 38px;
          }

          .brand-title {
            font-size: 0.92rem;
          }

          .brand-subtitle {
            font-size: 0.64rem;
          }
        }

        /* Very Small Mobile View (< 380px) */
        @media (max-width: 380px) {
          .brand-logo-img {
            width: 34px;
            height: 34px;
          }
          .brand-title {
            font-size: 0.82rem;
          }
          .brand-subtitle {
            display: none;
          }
          .header-icon-btn,
          .mobile-hamburger-btn {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
