import React from 'react';
import { Phone, ChevronRight } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo, socialLinks } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const FloatingActions = () => {
  const { language } = useLanguage();
  const groupUrl = socialLinks?.whatsappGroup || "https://chat.whatsapp.com/BhxxKXLoaVLFcYXKm05EXi";

  return (
    <div className="floating-actions-container" aria-label="Quick Connect Actions">
      {/* Floating Call Helpline Button */}
      <a
        href={`tel:${organizationInfo.contact.primaryPhone}`}
        title={language === 'mr' ? `हेल्पलाईन कॉल करा: ${organizationInfo.contact.primaryPhone}` : `Call Helpline: ${organizationInfo.contact.primaryPhone}`}
        aria-label="Call Helpline"
        className="floating-call-btn"
      >
        <Phone size={20} />
        <span className="floating-call-tooltip">
          {language === 'mr' ? 'कॉल करा' : 'Call Helpline'}
        </span>
      </a>

      {/* Floating Eye-Catching "Join our WhatsApp Group" Pill */}
      <div className="whatsapp-float-wrapper">
        {/* Pulsing Radar Ring Halos */}
        <div className="wa-radar-ring" aria-hidden="true" />
        <div className="wa-radar-ring delay" aria-hidden="true" />

        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-group-pill-btn"
          title="Join our WhatsApp Group / व्हॉट्सअ‍ॅप ग्रुप जॉईन करा"
          aria-label="Join our WhatsApp Group"
        >
          {/* Animated WhatsApp Icon with Unread Badge */}
          <div className="wa-icon-container">
            <div className="wa-icon-circle">
              <WhatsAppIcon size={26} color="#ffffff" animated={true} />
            </div>
            <span className="wa-notification-badge" title="Active Community">
              1
            </span>
          </div>

          {/* Text Content */}
          <div className="wa-text-container">
            <div className="wa-tagline">
              <span className="wa-live-dot" />
              <span>{language === 'mr' ? 'मोफत मार्गदर्शन • थेट अपडेट्स' : 'FREE UPDATES • LIVE'}</span>
            </div>
            <span className="wa-headline">
              Join our WhatsApp Group
            </span>
          </div>

          {/* Action Arrow Icon */}
          <div className="wa-arrow-container" aria-hidden="true">
            <ChevronRight size={18} />
          </div>
        </a>
      </div>

      <style>{`
        .floating-actions-container {
          position: fixed;
          bottom: 2rem;
          right: 1.5rem;
          z-index: 9980;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.85rem;
          pointer-events: auto;
        }

        /* Call Button */
        .floating-call-btn {
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #006B2D 0%, #04200e 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0, 107, 45, 0.35);
          border: 2px solid rgba(255, 255, 255, 0.25);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          text-decoration: none;
        }

        .floating-call-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 107, 45, 0.45);
        }

        .floating-call-tooltip {
          position: absolute;
          right: 54px;
          background: #17251B;
          color: #ffffff;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transform: translateX(8px);
          transition: all 0.2s ease;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .floating-call-btn:hover .floating-call-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        /* WhatsApp Wrapper & Floating Breathing Animation */
        .whatsapp-float-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          animation: waFloatBreathing 3.6s ease-in-out infinite;
        }

        @keyframes waFloatBreathing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Radar Pulse Waves */
        .wa-radar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          border: 2px solid rgba(37, 211, 102, 0.65);
          pointer-events: none;
          animation: waRadarPing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 1;
        }

        .wa-radar-ring.delay {
          animation-delay: 1.2s;
        }

        @keyframes waRadarPing {
          0% {
            transform: scale(0.96);
            opacity: 0.85;
          }
          70% {
            transform: scale(1.15, 1.35);
            opacity: 0;
          }
          100% {
            transform: scale(1.22, 1.45);
            opacity: 0;
          }
        }

        /* The Main Pill Button */
        .whatsapp-group-pill-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.45rem 1.15rem 0.45rem 0.55rem;
          background: linear-gradient(135deg, #25D366 0%, #159B32 50%, #006B2D 100%);
          border-radius: 9999px;
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 10px 28px -4px rgba(37, 211, 102, 0.48), 0 4px 12px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          overflow: hidden;
          user-select: none;
        }

        /* Shimmering Light Beam Across Pill */
        .whatsapp-group-pill-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          transform: skewX(-25deg);
          animation: waShimmer 3.8s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes waShimmer {
          0% { left: -100%; }
          30% { left: 200%; }
          100% { left: 200%; }
        }

        .whatsapp-group-pill-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 16px 36px -4px rgba(37, 211, 102, 0.65), 0 6px 16px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.6);
          color: #ffffff;
        }

        .whatsapp-group-pill-btn:hover .wa-arrow-container {
          transform: translateX(4px);
          background-color: rgba(255, 255, 255, 0.3);
        }

        .whatsapp-group-pill-btn:active {
          transform: scale(0.97);
        }

        /* Icon Holder with Notification Dot */
        .wa-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wa-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        .wa-notification-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #FF3B30;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 800;
          min-width: 17px;
          height: 17px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #25D366;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
          animation: waBadgePulse 2s ease-in-out infinite;
        }

        @keyframes waBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        /* Text Content */
        .wa-text-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          line-height: 1.15;
        }

        .wa-tagline {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #FFC928;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          margin-bottom: 0.15rem;
        }

        .wa-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #A8E600;
          box-shadow: 0 0 6px #A8E600;
          display: inline-block;
          animation: waDotBlink 1.4s ease-in-out infinite;
        }

        @keyframes waDotBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .wa-headline {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
          white-space: nowrap;
          font-family: var(--font-family);
        }

        /* Right Arrow Container */
        .wa-arrow-container {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          transition: all 0.25s ease;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        /* Responsive Mobile Styles */
        @media (max-width: 768px) {
          .floating-actions-container {
            bottom: calc(4.8rem + env(safe-area-inset-bottom, 0px) + 0.6rem);
            right: 0.75rem;
            gap: 0.5rem;
          }

          .floating-call-btn {
            display: none !important; /* Mobile bottom bar already has Call button */
          }

          .whatsapp-group-pill-btn {
            padding: 0.38rem 0.9rem 0.38rem 0.45rem;
            gap: 0.55rem;
            box-shadow: 0 8px 22px rgba(37, 211, 102, 0.42);
          }

          .wa-icon-circle {
            width: 36px;
            height: 36px;
          }

          .wa-tagline {
            font-size: 0.6rem;
            margin-bottom: 0.1rem;
          }

          .wa-headline {
            font-size: 0.84rem;
          }

          .wa-arrow-container {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 380px) {
          .wa-tagline {
            display: none;
          }
          .wa-headline {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActions;
