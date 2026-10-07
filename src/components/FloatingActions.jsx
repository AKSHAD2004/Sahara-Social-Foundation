import React from 'react';
import { Phone } from 'lucide-react';
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
        <Phone size={18} />
        <span className="floating-action-tooltip">
          {language === 'mr' ? 'कॉल करा' : 'Call Helpline'}
        </span>
      </a>

      {/* Floating WhatsApp Logo Button (Logo Only, Clean & Simple) */}
      <div className="whatsapp-float-wrapper">
        {/* Pulsing Radar Ring Halos */}
        <div className="wa-radar-ring" aria-hidden="true" />
        <div className="wa-radar-ring delay" aria-hidden="true" />

        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-whatsapp-btn"
          title={language === 'mr' ? 'ग्रुप जॉईन करा' : 'Join Group'}
          aria-label="Join Group"
        >
          <WhatsAppIcon size={30} color="#ffffff" animated={true} />
          
          {/* Subtle notification badge */}
          <span className="wa-notification-badge" title="Active Community">
            1
          </span>

          {/* Desktop Hover Tooltip */}
          <span className="floating-action-tooltip">
            {language === 'mr' ? 'ग्रुप जॉईन करा' : 'Join Group'}
          </span>
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
          gap: 0.75rem;
          pointer-events: auto;
        }

        /* Call Button */
        .floating-call-btn {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #006B2D 0%, #04200e 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 107, 45, 0.35);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          text-decoration: none;
        }

        .floating-call-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 18px rgba(0, 107, 45, 0.45);
        }

        /* Tooltip shared by both buttons */
        .floating-action-tooltip {
          position: absolute;
          right: 52px;
          background: #17251B;
          color: #ffffff;
          padding: 0.35rem 0.75rem;
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
          font-family: var(--font-family);
        }

        .floating-call-btn:hover .floating-action-tooltip,
        .floating-whatsapp-btn:hover .floating-action-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        /* WhatsApp Floating Wrapper */
        .whatsapp-float-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: waFloatBreathing 3.6s ease-in-out infinite;
        }

        @keyframes waFloatBreathing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Radar Pulse Waves */
        .wa-radar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
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
            transform: scale(0.95);
            opacity: 0.85;
          }
          70% {
            transform: scale(1.28);
            opacity: 0;
          }
          100% {
            transform: scale(1.36);
            opacity: 0;
          }
        }

        /* Circular WhatsApp Logo Button */
        .floating-whatsapp-btn {
          position: relative;
          z-index: 2;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45), 0 4px 12px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.35);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          user-select: none;
        }

        .floating-whatsapp-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 12px 28px rgba(37, 211, 102, 0.6), 0 6px 16px rgba(0, 0, 0, 0.22);
          color: #ffffff;
        }

        .floating-whatsapp-btn:active {
          transform: scale(0.95);
        }

        /* Notification Badge */
        .wa-notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #FF3B30;
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid #25D366;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
          animation: waBadgePulse 2s ease-in-out infinite;
        }

        @keyframes waBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        /* Responsive Mobile Styles */
        @media (max-width: 768px) {
          .floating-actions-container {
            bottom: calc(4.8rem + env(safe-area-inset-bottom, 0px) + 0.6rem);
            right: 0.85rem;
            gap: 0.5rem;
          }

          .floating-call-btn {
            display: none !important; /* Mobile bottom bar already has Call button */
          }

          .floating-whatsapp-btn {
            width: 48px;
            height: 48px;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.42);
          }

          .floating-whatsapp-btn svg {
            width: 27px;
            height: 27px;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActions;
