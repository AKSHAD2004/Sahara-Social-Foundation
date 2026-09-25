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
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="container topbar-container">
          {/* Mission Tagline with Left-to-Right moving animation */}
          <div className="topbar-mission">
            <div className="topbar-marquee-wrapper">
              <div className="topbar-marquee-track">
                <span className="topbar-mission-text">
                  <ShieldCheck size={14} className="topbar-icon" />
                  <span>
                    {language === 'mr' 
                      ? 'मधुमेह मुक्त भारत अभियान • व्यसनमुक्त भारत अभियान • मोफत समुपदेशन: ८४२११५४०९०' 
                      : 'Madhumeh Mukt Bharat & Vyasanmukt Bharat Abhiyan • Helpline: 8421154090'}
                  </span>
                </span>
                <span className="topbar-mission-text">
                  <ShieldCheck size={14} className="topbar-icon" />
                  <span>
                    {language === 'mr' 
                      ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर • नोंदणी क्र. MAH/582/2014/KOP' 
                      : 'Sahara Social Foundation, Kolhapur • Reg. No. MAH/582/2014/KOP'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Group: Affiliate + CRM + Language */}
          <div className="topbar-actions">
            {/* Affiliate Portal link */}
            <Link 
              to="/affiliate" 
              className="topbar-affiliate-link"
              title="Affiliate / समाज सेवक पोर्टल"
            >
              <Users size={13} className="topbar-affiliate-icon" />
              <span>{language === 'mr' ? 'समाज सेवक' : 'Affiliate'}</span>
            </Link>

            <span className="topbar-divider">|</span>

            {/* CRM Admin Portal link */}
            <Link 
              to="/crm" 
              className="topbar-crm-link"
              title="Sahara CRM & Sales Management Portal"
            >
              <ShieldCheck size={13} className="topbar-affiliate-icon" />
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
          <Link to="/" className="brand-identity-link" onClick={() => setMobileMenuOpen(false)}>
            <MissionLogoBadge size={isScrolled ? 38 : 44} style={{ filter: 'none', flexShrink: 0 }} />
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
          <nav className="desktop-nav-menu" aria-label="Main Navigation">
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
              <Phone size={14} />
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
              <WhatsAppIcon size={15} animated={true} />
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
            >
              <User size={19} />
              {customerUser && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '3px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '1.5px solid #ffffff'
                  }}
                  title={language === 'mr' ? 'लॉगिन केलेले आहे' : 'Logged in'}
                />
              )}
            </Link>

            {/* Mobile Hamburger Menu Toggle (Min 44x44px touch target) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen((prev) => !prev);
              }}
              className="mobile-hamburger-btn"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop (Rendered outside header to avoid backdrop-filter/stacking clipping) */}
      {mobileMenuOpen && (
        <div 
          className="mobile-drawer-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="mobile-drawer-container" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '1rem 1.15rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}>
              <div className="mobile-drawer-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1, marginRight: '0.75rem' }}>
                <MissionLogoBadge size={34} />
                <span className="mobile-drawer-brand-title" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#064e3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {language === 'mr' ? organizationInfo.nameMr : organizationInfo.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-drawer-close-btn"
                aria-label="Close menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: 'auto',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <ul className="mobile-drawer-list">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-drawer-link ${isActive ? 'active' : ''}`}
                    >
                      <span>{language === 'mr' ? link.nameMr : link.nameEn}</span>
                      {isActive && <span className="mobile-link-dot" />}
                    </Link>
                  </li>
                );
              })}

              {/* Mobile Drawer Account & Logout Link */}
              <li style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-drawer-link ${location.pathname === '/account' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                    <User size={18} style={{ color: '#059669' }} />
                    <span>{customerUser ? (customerUser.fullName || (language === 'mr' ? 'माझे खाते' : 'My Account')) : (language === 'mr' ? 'माझे खाते / लॉगिन' : 'My Account / Login')}</span>
                  </span>
                  {customerUser && (
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
                      {language === 'mr' ? 'लॉगिन' : 'Active'}
                    </span>
                  )}
                </Link>
              </li>

              {customerUser && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      logoutCustomer();
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-drawer-logout-btn"
                  >
                    <LogOut size={16} />
                    <span>{language === 'mr' ? 'खाते लॉग आऊट करा' : 'Logout Account'}</span>
                  </button>
                </li>
              )}

              {/* Language Switcher in Drawer */}
              <li style={{ paddingTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    toggleLanguage();
                  }}
                  className="mobile-drawer-lang-toggle"
                >
                  <Globe size={16} />
                  <span>{language === 'mr' ? 'Switch to English' : 'मराठी भाषेत पहा'}</span>
                </button>
              </li>

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

      {/* Embedded Styles for Header and Mobile Drawer */}
      <style>{`
        /* Top Announcement Bar */
        .top-announcement-bar {
          background: linear-gradient(90deg, #0a1b2e 0%, #12355B 50%, #087E8B 100%);
          color: #e2effc;
          font-size: 0.82rem;
          padding: 0.35rem 0;
          border-bottom: 1px solid rgba(8, 126, 139, 0.3);
          width: 100%;
        }

        .topbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 0.75rem;
        }

        .topbar-mission {
          display: flex;
          align-items: center;
          min-width: 0;
          flex: 1;
          overflow: hidden;
          margin-right: 0.75rem;
        }

        .topbar-marquee-wrapper {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          position: relative;
        }

        .topbar-marquee-track {
          display: inline-flex;
          align-items: center;
          gap: 3rem;
          white-space: nowrap;
          animation: moveRightToLeft 16s linear infinite;
          will-change: transform;
        }

        .topbar-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes moveRightToLeft {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .topbar-mission-text {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          font-size: 0.82rem;
          flex-shrink: 0;
        }

        .topbar-icon {
          color: #F4A261;
          flex-shrink: 0;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-left: auto;
          flex-shrink: 0;
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
          color: #dbf7fa;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .topbar-affiliate-link:hover {
          color: #ffffff;
        }

        .topbar-crm-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #F4A261;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .topbar-crm-link:hover {
          color: #ffffff;
        }

        .topbar-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.76rem;
          font-weight: 700;
          transition: all 0.2s ease;
          min-height: 28px;
        }

        .topbar-lang-btn:hover {
          background: rgba(255, 255, 255, 0.28);
          border-color: #ffffff;
        }

        /* Main Header */
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: #ffffff;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2eaf4;
          padding: 0.75rem 0;
          transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(18, 53, 91, 0.05);
        }

        .main-header-scrolled {
          background-color: rgba(255, 255, 255, 0.98);
          padding: 0.5rem 0;
          box-shadow: 0 4px 20px rgba(18, 53, 91, 0.08);
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

        .brand-text-block {
          min-width: 0;
        }

        .brand-title {
          font-size: 1.08rem;
          font-weight: 800;
          color: #12355B;
          line-height: 1.15;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .brand-subtitle {
          font-size: 0.68rem;
          color: #087E8B;
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
          gap: 0.5rem;
          margin: 0;
          padding: 0;
        }

        .desktop-nav-item {
          font-size: 0.88rem;
          font-weight: 600;
          color: #243048;
          position: relative;
          padding: 0.45rem 0.65rem;
          text-decoration: none;
          white-space: nowrap;
          display: inline-block;
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .desktop-nav-item:hover,
        .desktop-nav-item.active {
          color: #087E8B;
          background-color: #eefcfd;
          font-weight: 700;
        }

        .nav-active-indicator {
          position: absolute;
          bottom: 2px;
          left: 8px;
          right: 8px;
          height: 2.5px;
          background-color: #087E8B;
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
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: #f0f4f9;
          color: #172033;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2eaf4;
          text-decoration: none;
          transition: all 0.2s ease;
          touch-action: manipulation;
        }

        .header-icon-btn:hover,
        .header-icon-btn:active {
          background-color: #e2effc;
          color: #12355B;
        }

        .cart-badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #F4A261;
          color: #172033;
          font-size: 0.7rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          border: 2px solid #ffffff;
        }

        .mobile-hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #cbd7e8;
          background-color: #f8fafc;
          cursor: pointer;
          color: #12355B;
          transition: all 0.2s ease;
          touch-action: manipulation;
        }

        .mobile-hamburger-btn:hover,
        .mobile-hamburger-btn:active {
          background-color: #eefcfd;
          border-color: #087E8B;
        }

        /* Mobile Drawer */
        .mobile-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background-color: rgba(10, 27, 46, 0.75);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 999999;
          display: flex;
          justifyContent: flex-end;
          animation: fadeInOverlay 0.2s ease-out;
          touch-action: pan-y;
        }

        .mobile-drawer-container {
          background-color: #ffffff;
          width: min(85vw, 360px);
          height: 100%;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 35px rgba(10, 27, 46, 0.35);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: slideInRightDrawer 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          z-index: 1000000;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRightDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid #e2eaf4;
          background-color: #f8fafc;
        }

        .mobile-drawer-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .mobile-drawer-brand-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #12355B;
        }

        .mobile-drawer-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #cbd7e8;
          background-color: #ffffff;
          color: #172033;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mobile-drawer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 1.25rem 1rem;
        }

        .mobile-drawer-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          background-color: transparent;
          color: #172033;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        .mobile-drawer-link:active,
        .mobile-drawer-link.active {
          background-color: #eefcfd;
          color: #087E8B;
          font-weight: 700;
        }

        .mobile-link-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #087E8B;
        }

        .mobile-drawer-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          backgroundColor: #fff1f2;
          color: #e11d48;
          font-weight: 700;
          font-size: 0.92rem;
          border: 1px solid #fecdd3;
          cursor: pointer;
          text-align: left;
          min-height: 44px;
        }

        .mobile-drawer-lang-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.88rem;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          min-height: 44px;
        }

        .mobile-drawer-actions {
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        /* Breakpoints */
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

        @media (max-width: 1023px) and (min-width: 768px) {
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

        @media (max-width: 767px) {
          .top-announcement-bar {
            padding: 0.3rem 0;
            overflow: hidden;
          }

          .topbar-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.25rem;
          }

          .topbar-mission {
            width: 100%;
            margin-right: 0;
            overflow: hidden;
            justify-content: flex-start;
          }

          .topbar-marquee-wrapper {
            width: 100%;
            overflow: hidden;
          }

          .topbar-marquee-track {
            animation: moveRightToLeft 13s linear infinite;
            gap: 2rem;
          }

          .topbar-mission-text {
            font-size: 0.74rem;
            white-space: nowrap;
            line-height: 1.25;
          }

          .topbar-actions {
            justify-content: space-between;
            width: 100%;
            margin-left: 0;
            padding: 0 0.25rem;
            border-top: 1px solid rgba(255, 255, 255, 0.14);
            padding-top: 0.25rem;
          }

          .topbar-divider {
            display: none;
          }

          .topbar-affiliate-link,
          .topbar-crm-link {
            font-size: 0.75rem;
          }

          .topbar-lang-btn {
            padding: 0.15rem 0.5rem;
            font-size: 0.72rem;
          }

          .brand-title {
            font-size: 0.92rem;
          }

          .brand-subtitle {
            font-size: 0.64rem;
          }
        }

        @media (max-width: 480px) {
          .brand-title {
            font-size: clamp(0.82rem, 3.6vw, 0.92rem);
            max-width: 180px;
          }
          .brand-subtitle {
            font-size: 0.62rem;
            max-width: 180px;
          }
          .header-icon-btn,
          .mobile-hamburger-btn {
            width: 38px;
            height: 38px;
            min-width: 38px;
            min-height: 38px;
            border-radius: 10px;
          }
          .header-actions {
            gap: 0.35rem;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
