import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  ShoppingBag, 
  Calendar 
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const QuickActionBar = ({ onOpenConsultation }) => {
  const { language } = useLanguage();

  return (
    <div className="quick-action-wrapper">
      <div className="container">
        <div className="quick-action-grid">
          {/* Action 1: Call Helpline */}
          <a
            href={`tel:${organizationInfo.contact.primaryPhone}`}
            className="quick-action-item quick-action-call"
          >
            <div className="quick-action-icon-box icon-box-call">
              <Phone size={19} />
            </div>
            <div className="quick-action-text">
              <div className="quick-action-label label-call">
                {language === 'mr' ? 'थेट फोन करा' : 'Call Helpline'}
              </div>
              <div className="quick-action-val val-call">
                {organizationInfo.contact.primaryPhone}
              </div>
            </div>
          </a>

          {/* Action 2: WhatsApp Chat */}
          <a
            href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
              language === 'mr'
                ? 'नमस्कार, मला सहारा सोशल फाऊंडेशनच्या आरोग्य सेवा आणि फॉर्म्युलाबद्दल माहिती हवी आहे.'
                : 'Hello, I would like to know more about Sahara Social Foundation and your health services.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-action-item quick-action-wa"
          >
            <div className="quick-action-icon-box icon-box-wa">
              <WhatsAppIcon size={20} color="#ffffff" animated={true} />
            </div>
            <div className="quick-action-text">
              <div className="quick-action-label label-wa">
                {language === 'mr' ? 'व्हॉट्सअ‍ॅप संवाद' : 'WhatsApp Chat'}
              </div>
              <div className="quick-action-val val-wa">
                {organizationInfo.contact.primaryPhone}
              </div>
            </div>
          </a>

          {/* Action 3: Order Online */}
          <Link
            to="/shop"
            className="quick-action-item quick-action-shop"
          >
            <div className="quick-action-icon-box icon-box-shop">
              <ShoppingBag size={19} />
            </div>
            <div className="quick-action-text">
              <div className="quick-action-label label-shop">
                {language === 'mr' ? 'ऑनलाइन ऑर्डर' : 'Online Order'}
              </div>
              <div className="quick-action-val val-shop">
                {language === 'mr' ? 'सर्व फॉर्म्युला' : 'All Formulas'}
              </div>
            </div>
          </Link>

          {/* Action 4: Counseling Booking */}
          <button
            type="button"
            onClick={onOpenConsultation}
            className="quick-action-item quick-action-counsel"
          >
            <div className="quick-action-icon-box icon-box-counsel">
              <Calendar size={19} />
            </div>
            <div className="quick-action-text">
              <div className="quick-action-label label-counsel">
                {language === 'mr' ? 'मोफत नोंदणी' : 'Free Booking'}
              </div>
              <div className="quick-action-val val-counsel">
                {language === 'mr' ? 'आरोग्य समुपदेशन' : 'Counseling Desk'}
              </div>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        .quick-action-wrapper {
          margin-top: -1.75rem;
          position: relative;
          z-index: 10;
          margin-bottom: 2.5rem;
        }

        .quick-action-grid {
          background-color: #ffffff;
          border-radius: 18px;
          padding: 1rem 1.25rem;
          box-shadow: 0 10px 30px rgba(18, 53, 91, 0.12);
          border: 1px solid #e2eaf4;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          align-items: center;
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          transition: all 0.25s ease;
          min-height: 48px;
          text-decoration: none;
        }

        .quick-action-item:active {
          transform: scale(0.98);
        }

        .quick-action-call {
          background-color: #eefcfd;
          border: 1px solid #abedf5;
        }

        .quick-action-wa {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .quick-action-shop {
          background-color: #fff3ec;
          border: 1px solid #fde1cd;
        }

        .quick-action-counsel {
          background-color: #e2effc;
          border: 1px solid #b8d4f6;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .quick-action-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-box-call { background: linear-gradient(135deg, #0da3b3, #087E8B); }
        .icon-box-wa { background-color: #25d366; }
        .icon-box-shop { background: linear-gradient(135deg, #F4A261, #dc6a1b); }
        .icon-box-counsel { background: linear-gradient(135deg, #194474, #12355B); }

        .quick-action-text {
          min-width: 0;
        }

        .quick-action-label {
          font-size: 0.74rem;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .label-call { color: #087E8B; }
        .label-wa { color: #166534; }
        .label-shop { color: #dc6a1b; }
        .label-counsel { color: #194474; }

        .quick-action-val {
          font-size: 0.92rem;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .val-call { color: #05464d; }
        .val-wa { color: #14532d; }
        .val-shop { color: #7c2d12; }
        .val-counsel { color: #12355B; }

        @media (max-width: 960px) {
          .quick-action-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
            padding: 0.85rem !important;
          }
        }

        @media (max-width: 480px) {
          .quick-action-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
            padding: 0.65rem !important;
          }
          .quick-action-item {
            padding: 0.5rem 0.6rem !important;
            gap: 0.5rem !important;
          }
          .quick-action-icon-box {
            width: 34px !important;
            height: 34px !important;
          }
          .quick-action-label {
            font-size: 0.7rem !important;
          }
          .quick-action-val {
            font-size: 0.82rem !important;
          }
        }

        @media (max-width: 340px) {
          .quick-action-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickActionBar;
