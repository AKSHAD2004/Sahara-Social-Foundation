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
  LogOut, 
  ChevronDown,
  Sparkles,
  Heart
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MissionLogoBadge from './MissionLogoBadge';
import LanguageModal from './LanguageModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { 
    language, 
    openLanguageModal, 
    selectLanguage, 
    currentLanguageObj, 
    languagesList 
  } = useLanguage();
  const { totalCount } = useCart();
  const { customerUser, logoutCustomer } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let lastScrolled = false;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || window.pageYOffset || 0;
          // Hysteresis threshold to completely eliminate jitter / stuck loop:
          // Activates scrolled mode once past 60px down; only resets when scrolled back up past 20px
          let nextScrolled = lastScrolled;
          if (!lastScrolled && currentY > 60) {
            nextScrolled = true;
          } else if (lastScrolled && currentY < 20) {
            nextScrolled = false;
          }

          if (nextScrolled !== lastScrolled) {
            lastScrolled = nextScrolled;
            setIsScrolled(nextScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
    { nameEn: 'Products', nameMr: 'उत्पादने', path: '/shop' },
    { nameEn: 'Clinical Report', nameMr: 'क्लिनिकल रिपोर्ट', path: '/study-report' },
    { nameEn: 'Photos', nameMr: 'फोटो', path: '/photos' },
    { nameEn: 'Videos', nameMr: 'व्हिडिओ', path: '/videos' },
    { nameEn: 'Contact', nameMr: 'संपर्क', path: '/contact' },
  ];

  return (
    <>
      <div className={`theme-header-wrapper ${isScrolled ? 'theme-header-wrapper--scrolled' : ''}`}>
        {/* Top Navbar (Yess Infotech top bar style with brand theme) */}
        <div className="theme-header__top-navbar">
          <div className="container theme-header__top-container">
            {/* Left: Direct Phone Helpline */}
            <div className="theme-header__top-left">
              <a 
                href={`tel:${organizationInfo.contact.primaryPhone}`} 
                className="top-phone-link"
                title="Call Helpline"
              >
                <Phone size={14} className="top-phone-icon" />
                <span className="top-phone-number">+91 {organizationInfo.contact.primaryPhone}</span>
              </a>
            </div>

            {/* Center: Mission Tagline Marquee */}
            <div className="theme-header__top-center">
              <div className="topbar-marquee-wrapper">
                <div className="topbar-marquee-track">
                  <span className="topbar-mission-text">
                    <ShieldCheck size={14} className="topbar-badge-icon" />
                    <span>
                      {language === 'mr' 
                        ? 'मधुमेह मुक्त भारत अभियान • व्यसनमुक्त भारत अभियान • मोफत समुपदेशन: ८४२११५४०९०' 
                        : 'Diabetes Free India & Vyasan Free India Campaign • Helpline: 8421154090'}
                    </span>
                  </span>
                  <span className="topbar-mission-text">
                    <ShieldCheck size={14} className="topbar-badge-icon" />
                    <span>
                      {language === 'mr' 
                        ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर • नोंदणी क्र. MAH/582/2014/KOP • अधिकृत आयुर्वेदिक मार्गदर्शन' 
                        : 'Sahara Social Foundation, Kolhapur • Reg. No. MAH/582/2014/KOP • Authentic Nutraceutical Guidance'}
                    </span>
                  </span>

                  {/* Duplicate set for seamless continuous marquee on desktop */}
                  <span className="topbar-mission-text" aria-hidden="true">
                    <ShieldCheck size={14} className="topbar-badge-icon" />
                    <span>
                      {language === 'mr' 
                        ? 'मधुमेह मुक्त भारत अभियान • व्यसनमुक्त भारत अभियान • मोफत समुपदेशन: ८४२११५४०९०' 
                        : 'Diabetes Free India & Vyasan Free India Campaign • Helpline: 8421154090'}
                    </span>
                  </span>
                  <span className="topbar-mission-text" aria-hidden="true">
                    <ShieldCheck size={14} className="topbar-badge-icon" />
                    <span>
                      {language === 'mr' 
                        ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर • नोंदणी क्र. MAH/582/2014/KOP • अधिकृत आयुर्वेदिक मार्गदर्शन' 
                        : 'Sahara Social Foundation, Kolhapur • Reg. No. MAH/582/2014/KOP • Authentic Nutraceutical Guidance'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: WhatsApp Support Action */}
            <div className="theme-header__top-right">
              <a
                href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                  language === 'mr'
                    ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवांबद्दल माहिती हवी आहे.'
                    : 'Hello, I want details regarding Sahara Social Foundation services.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="top-wa-pill"
                title="WhatsApp Support"
              >
                <WhatsAppIcon size={14} animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Floating Rounded Header (Yess Infotech Rounded-24 Island Card Style) */}
        <header className={`theme-header__main ${isScrolled ? 'theme-header__main--scrolled' : ''}`}>
          <div className="container theme-header-container">
            <div className="theme-header-card">
              {/* Brand Logo & Title on Left */}
              <div className="theme-header-brand-col">
                <Link to="/" className="brand-link" onClick={() => setMobileMenuOpen(false)}>
                  <div className="brand-logo-wrap">
                    <MissionLogoBadge size={44} className="brand-logo-emblem" style={{ flexShrink: 0 }} />
                  </div>
                  <div className="brand-text-block">
                    <div className="brand-title">
                      {language === 'mr' ? organizationInfo.nameMr : organizationInfo.name}
                    </div>
                    <div className="brand-subtitle">
                      {language === 'mr' ? 'मधुमेह मुक्त भारत अभियान • कोल्हापूर' : 'Mission Diabetes Free India • Kolhapur'}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Desktop Menu Section (Pill-shaped Navigation Links) */}
              <nav className="desktop-menu-section" aria-label="Main Navigation">
                <div className="desktop-main-nav">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`header-main-nav-link ${isActive ? 'header-main-nav-link--active' : ''}`}
                      >
                        <span>{language === 'mr' ? link.nameMr : link.nameEn}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Right Action Buttons: Cart + Account + Hamburger */}
              <div className="theme-header-actions-col">

                {/* Shopping Cart Icon with Badge */}
                <Link
                  to="/cart"
                  className="header-icon-btn header-icon-btn--cart"
                  title={language === 'mr' ? 'कार्ट पहा' : 'View Cart'}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={20} />
                  {totalCount > 0 && (
                    <span className="cart-badge-count">{totalCount}</span>
                  )}
                </Link>

                {/* User Account Icon */}
                <Link
                  to="/account"
                  className="header-icon-btn header-icon-btn--account"
                  title={customerUser ? (customerUser.fullName || 'My Account') : (language === 'mr' ? 'माझे खाते' : 'My Account')}
                  aria-label="User Account"
                >
                  <User size={20} />
                  {customerUser && (
                    <span className="user-active-dot" title={language === 'mr' ? 'लॉगिन केलेले आहे' : 'Logged in'} />
                  )}
                </Link>

                {/* Mobile Menu Toggle (Yess Infotech clean rounded hamburger style) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="mobile-menu-toggle"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sub-Navbar Moving Announcement Marquee (Always mounted, smoothly transitions height on scroll) */}
        <div className={`mobile-subnav-ticker ${isScrolled ? 'mobile-subnav-ticker--scrolled' : ''}`} aria-label="Announcement ticker">
          <div className="mobile-ticker-track">
            {/* Group 1 */}
            <div className="mobile-ticker-group">
              <span className="mobile-ticker-item">
                <ShieldCheck size={13} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? 'मधुमेह मुक्त भारत अभियान • व्यसनमुक्त भारत अभियान' 
                    : 'Diabetes Free India & Vyasan Free India Campaign'}
                </span>
              </span>
              <span className="mobile-ticker-dot">•</span>
              <a href={`tel:${organizationInfo.contact.primaryPhone}`} className="mobile-ticker-item mobile-ticker-link" title="Call Helpline">
                <Phone size={12} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? 'हेल्पलाइन: ८४२११५४०९०' 
                    : 'Helpline: 8421154090'}
                </span>
              </a>
              <span className="mobile-ticker-dot">•</span>
              <span className="mobile-ticker-item">
                <ShieldCheck size={13} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर • नोंदणी क्र. MAH/582/2014/KOP' 
                    : 'Sahara Social Foundation, Kolhapur • Reg. No. MAH/582/2014/KOP'}
                </span>
              </span>
              <span className="mobile-ticker-dot">•</span>
              <span className="mobile-ticker-item">
                <Sparkles size={12} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? '१००% आयुर्वेदिक संशोधन व मार्गदर्शन' 
                    : '100% Nutraceutical Research & Guidance'}
                </span>
              </span>
              <span className="mobile-ticker-dot">•</span>
            </div>

            {/* Group 2 (Exact duplicate for seamless continuous infinite loop) */}
            <div className="mobile-ticker-group" aria-hidden="true">
              <span className="mobile-ticker-item">
                <ShieldCheck size={13} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? 'मधुमेह मुक्त भारत अभियान • व्यसनमुक्त भारत अभियान' 
                    : 'Diabetes Free India & Vyasan Free India Campaign'}
                </span>
              </span>
              <span className="mobile-ticker-dot">•</span>
              <a href={`tel:${organizationInfo.contact.primaryPhone}`} className="mobile-ticker-item mobile-ticker-link" title="Call Helpline">
                <Phone size={12} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? 'हेल्पलाइन: ८४२११५४०९०' 
                    : 'Helpline: 8421154090'}
                </span>
              </a>
              <span className="mobile-ticker-dot">•</span>
              <span className="mobile-ticker-item">
                <ShieldCheck size={13} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर • नोंदणी क्र. MAH/582/2014/KOP' 
                    : 'Sahara Social Foundation, Kolhapur • Reg. No. MAH/582/2014/KOP'}
                </span>
              </span>
              <span className="mobile-ticker-dot">•</span>
              <span className="mobile-ticker-item">
                <Sparkles size={12} className="mobile-ticker-icon" />
                <span>
                  {language === 'mr' 
                    ? '१००% आयुर्वेदिक संशोधन व मार्गदर्शन' 
                    : '100% Nutraceutical Research & Guidance'}
                </span>
              </span>
              <span className="mobile-ticker-dot">•</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Menu (Yess Infotech mobile-menu-wrapper & panel) */}
      <div 
        className={`mobile-menu-wrapper ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className="mobile-menu-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header with Brand & Close Button */}
          <div className="mobile-menu-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MissionLogoBadge size={34} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#006B2D' }}>
                  {language === 'mr' ? organizationInfo.nameMr : organizationInfo.name}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#159B32', fontWeight: 700 }}>
                  {language === 'mr' ? 'कोल्हापूर • नोंदणीकृत' : 'Kolhapur • Regd.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-menu-close"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="mobile-menu-content">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive ? 'header-main-nav-link--active' : ''}`}
                >
                  <span>{language === 'mr' ? link.nameMr : link.nameEn}</span>
                </Link>
              );
            })}

            {/* Mobile Recruiter / Shop CTA Banner */}
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-cta-pill"
            >
              <Sparkles size={16} />
              <span>{language === 'mr' ? 'आयुर्वेदिक उत्पादने ऑर्डर करा' : 'Explore & Order Products'}</span>
            </Link>

            {/* Cart & Account Items in Drawer */}
            <div style={{ borderTop: '1px solid #e9edf3', marginTop: '1rem', paddingTop: '0.75rem' }}>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShoppingCart size={18} style={{ color: '#006B2D' }} />
                  <span>{language === 'mr' ? 'माझी कार्ट (खरेदी)' : 'My Cart'}</span>
                </span>
                {totalCount > 0 && (
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FFC928', color: '#17251B', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 800 }}>
                    {totalCount}
                  </span>
                )}
              </Link>

              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <User size={18} style={{ color: '#006B2D' }} />
                  <span>{customerUser ? (customerUser.fullName || (language === 'mr' ? 'माझे खाते' : 'My Account')) : (language === 'mr' ? 'माझे खाते / लॉगिन' : 'My Account / Login')}</span>
                </span>
                {customerUser && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#e2faea', color: '#006B2D', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                    {language === 'mr' ? 'सक्रिय' : 'Active'}
                  </span>
                )}
              </Link>

              {customerUser && (
                <button
                  type="button"
                  onClick={() => {
                    logoutCustomer();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-logout-btn"
                >
                  <LogOut size={16} />
                  <span>{language === 'mr' ? 'खाते लॉग आऊट करा' : 'Logout Account'}</span>
                </button>
              )}
            </div>

            {/* Language Selector in Drawer */}
            <div style={{ borderTop: '1px solid #e9edf3', marginTop: '1rem', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#5F6B61', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={14} style={{ color: '#006B2D' }} />
                <span>भाषा बदला / SELECT LANGUAGE</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {languagesList.slice(0, 6).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: language === lang.code ? '1.5px solid #006B2D' : '1px solid #e9edf3',
                      backgroundColor: language === lang.code ? '#e2faea' : '#ffffff',
                      color: language === lang.code ? '#006B2D' : '#17251B',
                      cursor: 'pointer'
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Contact Action Buttons at Bottom */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e9edf3' }}>
              <a
                href={`tel:${organizationInfo.contact.primaryPhone}`}
                className="btn btn-call btn-sm"
                style={{ flex: 1, padding: '0.65rem', justifyContent: 'center' }}
              >
                <Phone size={15} />
                <span>{language === 'mr' ? 'कॉल करा' : 'Call'}</span>
              </a>
              <a
                href={`https://wa.me/${organizationInfo.contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ flex: 1, padding: '0.65rem', justifyContent: 'center' }}
              >
                <WhatsAppIcon size={16} animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <LanguageModal />

      {/* Embedded Styles Replicating Yess Infotech's 2-Tier Floating Card Structure */}
      <style>{`
        /* Wrapper */
        .theme-header-wrapper {
          position: -webkit-sticky;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 9995;
          transition: all 0.25s ease;
        }

        /* 1. Top Navbar (Deep Emerald Green Bar) */
        .theme-header__top-navbar {
          background: linear-gradient(90deg, #04200e 0%, #006B2D 50%, #08481c 100%);
          color: #ffffff;
          padding: 6px 0 26px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 10;
          max-height: 80px;
          opacity: 1;
          overflow: hidden;
          transform: translateY(0);
          transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.25s ease,
                      padding 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: max-height, opacity, transform;
        }

        /* Smooth collapse of upper green section when scrolled on desktop */
        .theme-header-wrapper--scrolled .theme-header__top-navbar {
          max-height: 0;
          opacity: 0;
          padding-top: 0;
          padding-bottom: 0;
          transform: translateY(-100%);
          border-bottom-color: transparent;
          pointer-events: none;
        }

        .theme-header-wrapper--scrolled .theme-header__main {
          margin-top: 0 !important;
          padding-top: 6px !important;
          padding-bottom: 6px !important;
        }

        .theme-header__top-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* Top Left: Phone Helpline */
        .theme-header__top-left {
          flex-shrink: 0;
        }

        .top-phone-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #ffffff;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.12);
          transition: all 0.2s ease;
        }

        .top-phone-link:hover {
          background: rgba(255, 255, 255, 0.22);
          color: #FFC928;
        }

        .top-phone-icon {
          color: #FFC928;
          flex-shrink: 0;
        }

        /* Top Center: Marquee */
        .theme-header__top-center {
          flex: 1;
          overflow: hidden;
          min-width: 0;
        }

        .topbar-marquee-wrapper {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }

        .topbar-marquee-track {
          display: flex;
          gap: 3rem;
          width: max-content;
          animation: marqueeLeftToRight 28s linear infinite;
        }

        .topbar-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marqueeLeftToRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .topbar-mission-text {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.80rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
        }

        .topbar-badge-icon {
          color: #FFC928;
          flex-shrink: 0;
        }

        /* Top Right: Language & WhatsApp */
        .theme-header__top-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .top-lang-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .top-lang-pill:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .top-wa-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #159B32;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 11px;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .top-wa-pill:hover {
          background: #006B2D;
          transform: translateY(-1px);
        }

        /* 2. Main Header (Floating Island Card - Rock-solid flexible & auto-adjusting) */
        .theme-header__main {
          position: relative;
          z-index: 20;
          margin-top: -18px;
          padding-top: 0;
          padding-bottom: 0;
          transition: margin-top 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      padding 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }

        .theme-header-container {
          max-width: 1400px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(10px, 2vw, 24px);
          padding-right: clamp(10px, 2vw, 24px);
        }

        .theme-header-card {
          background-color: #ffffff;
          border-radius: 9999px;
          box-shadow: 0 10px 30px rgba(0, 107, 45, 0.10), 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1.5px solid #E1E9DF;
          padding: 8px clamp(12px, 1.6vw, 24px);
          min-height: clamp(56px, 5.2vw, 68px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(8px, 1.2vw, 20px);
          width: 100%;
          position: relative;
          z-index: 25;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .theme-header-wrapper--scrolled .theme-header-card,
        .theme-header__main--scrolled .theme-header-card {
          box-shadow: 0 12px 34px rgba(0, 107, 45, 0.14), 0 3px 10px rgba(0, 0, 0, 0.05);
          background-color: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-color: rgba(0, 107, 45, 0.18);
        }

        /* Brand Column on Left - Auto-Adjusting & Responsive */
        .theme-header-brand-col {
          flex: 0 1 auto;
          min-width: 0;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: clamp(6px, 0.8vw, 12px);
          text-decoration: none;
          min-width: 0;
        }

        .brand-logo-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo-emblem {
          width: clamp(34px, 3.6vw, 44px) !important;
          height: clamp(34px, 3.6vw, 44px) !important;
        }

        .brand-text-block {
          flex: 0 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-title {
          font-size: clamp(0.78rem, 1.1vw, 1.05rem);
          font-weight: 800;
          color: #006B2D;
          line-height: 1.25;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .brand-subtitle {
          font-size: clamp(0.60rem, 0.7vw, 0.72rem);
          color: #159B32;
          font-weight: 700;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Desktop Menu (Fluid Auto-Scaling Pill Navigation) */
        .desktop-menu-section {
          display: none;
          flex: 1 1 auto;
          justify-content: center;
          min-width: 0;
        }

        .desktop-main-nav {
          display: flex;
          align-items: center;
          gap: clamp(2px, 0.4vw, 7px);
          flex-wrap: nowrap;
          justify-content: center;
          max-width: 100%;
        }

        .header-main-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: clamp(6px, 0.55vw, 8px) clamp(8px, 0.8vw, 15px);
          border-radius: 9999px;
          text-decoration: none;
          font-size: clamp(0.78rem, 0.86vw, 0.92rem);
          font-weight: 600;
          color: #17251B;
          white-space: nowrap;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .header-main-nav-link:hover:not(.header-main-nav-link--active) {
          color: #006B2D;
          background-color: #F3F8F1;
        }

        /* Active item: Solid brand green background, white text (pill shape) */
        .header-main-nav-link--active {
          background-color: #006B2D !important;
          color: #ffffff !important;
          font-weight: 700;
          padding: clamp(6px, 0.55vw, 8px) clamp(12px, 1.1vw, 20px);
          box-shadow: 0 3px 10px rgba(0, 107, 45, 0.28);
        }

        /* Right Action Items */
        .theme-header-actions-col {
          display: flex;
          align-items: center;
          gap: clamp(5px, 0.8vw, 10px);
          flex-shrink: 0;
        }

        /* Header Icon Buttons (Cart & Account) */
        .header-icon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(36px, 2.8vw, 42px);
          height: clamp(36px, 2.8vw, 42px);
          border-radius: 50%;
          background-color: #F3F8F1;
          color: #006B2D;
          text-decoration: none;
          border: 1px solid #E1E9DF;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .header-icon-btn:hover {
          background-color: #e2faea;
          border-color: #006B2D;
          transform: translateY(-1px);
        }

        .cart-badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #FFC928;
          color: #17251B;
          font-size: 0.70rem;
          font-weight: 800;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #ffffff;
        }

        .user-active-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #10b981;
          border: 1.5px solid #ffffff;
        }

        /* Mobile Hamburger Toggle */
        .mobile-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: clamp(36px, 2.8vw, 42px);
          height: clamp(36px, 2.8vw, 42px);
          border-radius: 50%;
          background: #006B2D;
          border: none;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 107, 45, 0.2);
          flex-shrink: 0;
        }

        .mobile-menu-toggle:hover {
          background: #08481c;
        }

        /* Mobile Drawer */
        .mobile-menu-wrapper {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: none;
        }

        .mobile-menu-wrapper.active {
          display: block;
        }

        .mobile-menu-panel {
          position: fixed;
          top: 0;
          right: -100%;
          width: 82%;
          max-width: 320px;
          height: 100%;
          background: #ffffff;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-wrapper.active .mobile-menu-panel {
          right: 0;
        }

        .mobile-menu-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e9edf3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F3F8F1;
        }

        .mobile-menu-close {
          background: #ffffff;
          border: 1px solid #E1E9DF;
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #5F6B61;
        }

        .mobile-menu-content {
          padding: 16px 20px;
          flex: 1;
        }

        .mobile-nav-link {
          display: block;
          padding: 12px 14px;
          color: #17251B;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .mobile-nav-link:hover {
          background: #F3F8F1;
          color: #006B2D;
        }

        .mobile-cta-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #FFC928 0%, #F5B000 100%);
          color: #17251B;
          font-weight: 800;
          text-decoration: none;
          padding: 12px;
          border-radius: 12px;
          margin: 12px 0 6px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(255, 201, 40, 0.3);
        }

        .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background-color: #fff1f2;
          color: #e11d48;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
        }

        /* Mobile Sub-Navbar Moving Announcement Marquee */
        .mobile-subnav-ticker {
          display: none;
          background: linear-gradient(90deg, #02200d 0%, #006B2D 50%, #02200d 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          border-bottom: 2px solid #FFC928;
          box-shadow: 0 4px 14px rgba(0, 32, 14, 0.28);
          overflow: hidden;
          width: 100%;
          position: relative;
          z-index: 10;
          padding: 6px 0;
          max-height: 48px;
          opacity: 1;
          transform: translateY(0);
          transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.25s ease,
                      padding 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      margin 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          touch-action: pan-y;
          will-change: max-height, opacity, transform;
        }

        .theme-header-wrapper--scrolled .mobile-subnav-ticker,
        .mobile-subnav-ticker--scrolled {
          max-height: 0 !important;
          opacity: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          margin-top: 0 !important;
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
          transform: translateY(-8px);
          pointer-events: none;
        }

        .mobile-ticker-track {
          display: flex;
          width: max-content;
          animation: mobileTickerScroll 22s linear infinite;
          will-change: transform;
          -webkit-transform: translateZ(0);
        }

        .mobile-ticker-track:active,
        .mobile-ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes mobileTickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .mobile-ticker-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding-right: 0.85rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mobile-ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .mobile-ticker-link {
          text-decoration: none;
          color: #17251B;
          background: #FFC928;
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease;
        }

        .mobile-ticker-link:active {
          transform: scale(0.96);
        }

        .mobile-ticker-icon {
          color: #FFC928;
          flex-shrink: 0;
        }

        .mobile-ticker-link .mobile-ticker-icon {
          color: #17251B;
        }

        .mobile-ticker-dot {
          color: #FFC928;
          font-size: 0.85rem;
          line-height: 1;
          opacity: 0.85;
        }

        /* =========================================================
           RESPONSIVE SYSTEM - AUTO-ADJUSTS ACROSS ALL SCREENS
           ========================================================= */

        /* 1. Large Desktops & Laptops (>= 1160px) */
        @media (min-width: 1160px) {
          .desktop-menu-section {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }

        /* 2. Tablets in Landscape, Small Laptops & Surface Devices (<= 1159px) */
        @media (max-width: 1159px) {
          /* Hide upper green bar on tablets and mobile */
          .theme-header__top-navbar {
            display: none !important;
          }
          .theme-header-wrapper {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 9995 !important;
          }
          .theme-header__main {
            margin-top: 0 !important;
            padding: 6px 0 !important;
          }
          .desktop-menu-section {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: inline-flex !important;
          }
          .mobile-subnav-ticker {
            display: block;
            margin-top: 4px;
          }
        }

        /* 3. Tablets in Portrait & Mid Screens (<= 992px) */
        @media (max-width: 992px) {
          .theme-header-card {
            border-radius: 9999px;
            padding: 6px clamp(10px, 1.8vw, 18px);
            min-height: 56px;
          }
        }

        /* 4. Mobile Devices (<= 768px) */
        @media (max-width: 768px) {
          .theme-header-container {
            padding-left: clamp(8px, 1.5vw, 16px);
            padding-right: clamp(8px, 1.5vw, 16px);
          }

          .theme-header-card {
            border-radius: 9999px;
            padding: 6px 12px;
            min-height: 54px;
            gap: 8px;
          }

          .brand-subtitle {
            font-size: 0.64rem;
          }
        }

        /* 5. Phones (<= 640px) */
        @media (max-width: 640px) {
          .theme-header__main {
            padding: 4px 0 !important;
          }

          .theme-header-container {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .theme-header-card {
            padding: 5px 10px;
            border-radius: 9999px;
            gap: 6px;
            min-height: 50px;
          }

          .brand-subtitle {
            display: none;
          }

          .brand-title {
            font-size: clamp(0.74rem, 3.2vw, 0.88rem);
            white-space: normal;
            line-height: 1.15;
            max-width: 165px;
          }

          .header-icon-btn {
            width: 36px;
            height: 36px;
          }

          .mobile-menu-toggle {
            width: 36px;
            height: 36px;
          }
        }

        /* 6. Compact & Foldable Phones (<= 375px) */
        @media (max-width: 375px) {
          .theme-header-container {
            padding-left: 0.35rem;
            padding-right: 0.35rem;
          }

          .theme-header-card {
            padding: 4px 8px;
            gap: 4px;
            min-height: 48px;
          }

          .brand-logo-emblem {
            width: 32px !important;
            height: 32px !important;
          }

          .brand-title {
            font-size: 0.72rem;
            max-width: 125px;
          }

          .header-icon-btn,
          .mobile-menu-toggle {
            width: 33px;
            height: 33px;
          }

          .cart-badge-count {
            width: 17px;
            height: 17px;
            font-size: 0.65rem;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
