import React from 'react';
import { Phone, Users } from 'lucide-react';
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

      {/* Floating Join Group Button */}
      <a
        href={groupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-join-group-btn"
        title={language === 'mr' ? 'ग्रुप जॉईन करा' : 'Join Group'}
        aria-label="Join Group"
      >
        <Users size={18} />
        <span>{language === 'mr' ? 'ग्रुप जॉईन करा' : 'Join Group'}</span>
      </a>

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

        .floating-call-btn:hover .floating-action-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        /* Floating Join Group Button */
        .floating-join-group-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          border-radius: 50px;
          background: linear-gradient(135deg, #006B2D 0%, #15803d 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0, 107, 45, 0.38), 0 2px 6px rgba(0, 0, 0, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }

        .floating-join-group-btn:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 107, 45, 0.48), 0 4px 10px rgba(0, 0, 0, 0.16);
          color: #ffffff;
          background: linear-gradient(135deg, #08481c 0%, #166534 100%);
        }

        .floating-join-group-btn:active {
          transform: scale(0.97);
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

          .floating-join-group-btn {
            padding: 0.55rem 1rem;
            font-size: 0.82rem;
            box-shadow: 0 4px 14px rgba(0, 107, 45, 0.35);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActions;
