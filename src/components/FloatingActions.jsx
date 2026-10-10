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
        <span className="btn-ping-ring" aria-hidden="true"></span>
        <span className="floating-join-icon-wrap">
          <Users size={19} className="floating-join-icon" />
          <span className="join-live-dot" aria-hidden="true"></span>
        </span>
        <span className="floating-join-text">{language === 'mr' ? 'ग्रुप जॉईन करा' : 'Join Group'}</span>
        <span className="floating-btn-shine" aria-hidden="true"></span>
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

        /* Floating Call Button Animations */
        @keyframes callPulseGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(21, 155, 50, 0.8), 0 4px 14px rgba(0, 107, 45, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(21, 155, 50, 0), 0 6px 20px rgba(0, 107, 45, 0.6);
            transform: scale(1.06);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(21, 155, 50, 0), 0 4px 14px rgba(0, 107, 45, 0.4);
            transform: scale(1);
          }
        }

        @keyframes phoneRingWiggle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          10% {
            transform: rotate(-18deg) scale(1.2);
          }
          20% {
            transform: rotate(18deg) scale(1.2);
          }
          30% {
            transform: rotate(-14deg) scale(1.15);
          }
          40% {
            transform: rotate(14deg) scale(1.15);
          }
          50% {
            transform: rotate(-8deg) scale(1.05);
          }
          60% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes callBlinkAttention {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0));
          }
          48% {
            filter: brightness(1.22) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          }
          52% {
            filter: brightness(1.35) drop-shadow(0 0 12px rgba(255, 201, 40, 0.9));
          }
          56% {
            filter: brightness(1.22) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          }
        }

        /* Call Button */
        .floating-call-btn {
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #006B2D 0%, #159B32 50%, #04200e 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 107, 45, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.5);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          text-decoration: none;
          animation: callPulseGlow 2.4s infinite ease-in-out, callBlinkAttention 3.4s infinite ease-in-out;
        }

        .floating-call-btn svg {
          animation: phoneRingWiggle 2.6s infinite ease-in-out;
          transform-origin: center center;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }

        .floating-call-btn:hover {
          transform: scale(1.15) translateY(-3px) !important;
          box-shadow: 0 10px 24px rgba(0, 107, 45, 0.55), 0 0 16px rgba(21, 155, 50, 0.5) !important;
        }

        .floating-call-btn:active {
          transform: scale(0.94);
        }

        .floating-action-tooltip {
          position: absolute;
          right: 56px;
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

        /* Floating Join Group Button Animations */
        @keyframes groupPulseGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(21, 155, 50, 0.75), 0 6px 20px rgba(0, 107, 45, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(21, 155, 50, 0), 0 10px 26px rgba(0, 107, 45, 0.55);
            transform: scale(1.035);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(21, 155, 50, 0), 0 6px 20px rgba(0, 107, 45, 0.4);
            transform: scale(1);
          }
        }

        @keyframes groupBlinkAttention {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0));
          }
          45% {
            filter: brightness(1.15) drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
          }
          50% {
            filter: brightness(1.28) drop-shadow(0 0 10px rgba(255, 201, 40, 0.85));
          }
          55% {
            filter: brightness(1.15) drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
          }
        }

        @keyframes iconBounceWiggle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          12% {
            transform: rotate(-14deg) scale(1.18);
          }
          24% {
            transform: rotate(14deg) scale(1.18);
          }
          36% {
            transform: rotate(-8deg) scale(1.1);
          }
          48% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes shineSweep {
          0% {
            left: -120%;
          }
          35%, 100% {
            left: 150%;
          }
        }

        @keyframes liveDotBlink {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.65);
          }
        }

        /* Floating Join Group Button */
        .floating-join-group-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.72rem 1.35rem;
          border-radius: 50px;
          background: linear-gradient(135deg, #006B2D 0%, #159B32 50%, #04200e 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.94rem;
          text-decoration: none;
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          overflow: hidden;
          animation: groupPulseGlow 2.2s infinite ease-in-out, groupBlinkAttention 3.2s infinite ease-in-out;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        }

        .floating-join-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .floating-join-icon {
          display: inline-block;
          animation: iconBounceWiggle 2.8s infinite ease-in-out;
          transform-origin: center center;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));
        }

        /* Glowing green live beacon indicator */
        .join-live-dot {
          position: absolute;
          top: -2px;
          right: -3px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #4ade80;
          box-shadow: 0 0 8px #4ade80;
          animation: liveDotBlink 1.4s infinite ease-in-out;
        }

        .floating-join-text {
          position: relative;
          z-index: 2;
          letter-spacing: 0.015em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        /* Shimmer beam across the button */
        .floating-btn-shine {
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transform: skewX(-22deg);
          animation: shineSweep 3.6s infinite ease-in-out;
          pointer-events: none;
        }

        .floating-join-group-btn:hover {
          transform: scale(1.08) translateY(-3px) !important;
          box-shadow: 0 12px 28px rgba(0, 107, 45, 0.55), 0 0 20px rgba(21, 155, 50, 0.5) !important;
          background: linear-gradient(135deg, #159B32 0%, #006B2D 50%, #04200e 100%);
          color: #ffffff;
        }

        .floating-join-group-btn:active {
          transform: scale(0.96);
        }

        /* Responsive Mobile Styles */
        @media (max-width: 768px) {
          .floating-actions-container {
            bottom: calc(4.8rem + env(safe-area-inset-bottom, 0px) + 0.6rem);
            right: 0.85rem;
            gap: 0.55rem;
          }

          .floating-call-btn {
            display: none !important;
          }

          .floating-join-group-btn {
            padding: 0.58rem 1.05rem;
            font-size: 0.84rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActions;
