import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  PhoneCall, 
  Search, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';
import WhatsAppIcon from './WhatsAppIcon';
import ClinicalStudyReportModal from './ClinicalStudyReportModal';

export const clinicalReportsData = [
  {
    srNo: 1,
    title: 'Antox - D International Clinical Trial Test Report',
    titleMr: 'Antox - D आंतरराष्ट्रीय क्लिनिकल चाचणी चाचणी अहवाल (CTRI)',
    type: 'Govt. Registry',
    status: 'Verified & Registered',
    actionTextEn: 'CTRI GOVT. WEBSITE REPORT',
    actionTextMr: 'CTRI शासकीय संकेतस्थळ अहवाल',
    actionUrl: 'https://ctri.nic.in/Clinicaltrials/pmaindet2.php?EncHid=MTQxMTA0&Enc=&userName=',
    isExternal: true,
    fileType: 'link',
    descriptionEn: 'Official registration with the Clinical Trials Registry - India (CTRI), Indian Council of Medical Research (ICMR).',
    descriptionMr: 'क्लिनिकल ट्रायल्स रजिस्ट्री - इंडिया (CTRI), ICMR भारत सरकार अंतर्गत अधिकृत नोंदणीकृत चाचणी अहवाल.'
  },
  {
    srNo: 2,
    title: 'Antox - D Conclusion Report',
    titleMr: 'Antox - D निष्कर्ष अहवाल (Conclusion Report)',
    type: 'Scientific Study',
    status: 'Completed',
    actionTextEn: 'View Report',
    actionTextMr: 'अहवाल पहा (PDF)',
    actionUrl: 'https://nutrifeel.org/wp-content/uploads/Interim_Report_IMPROVA_18.04.26.pdf',
    isExternal: true,
    fileType: 'pdf',
    descriptionEn: 'Scientific interim and conclusion efficacy study report demonstrating therapeutic outcomes for metabolic and diabetes support.',
    descriptionMr: 'स्वादुपिंड कार्यक्षमता व साखर नियंत्रणाबाबत वैज्ञानिक निष्कर्ष व अंतरिम संशोधन अहवाल.'
  },
  {
    srNo: 3,
    title: 'Antox - D Total Detail Report',
    titleMr: 'Antox - D संपूर्ण सविस्तर अहवाल (Total Detail Report)',
    type: 'Complete Dossier',
    status: 'Official 78-Page Study Report',
    actionTextEn: 'View Report (PDF)',
    actionTextMr: 'अहवाल पहा (PDF)',
    actionUrl: '/reports/Antox-D-Clinical-Study-Report.pdf',
    isExternal: false,
    fileType: 'pdf-direct',
    descriptionEn: 'Official 78-page randomized double-blind clinical study report (CTRI/2025/10/095664) with synopsis, formulation, and full efficacy tables.',
    descriptionMr: 'अधिकृत ७८-पानी दुहेरी-अंध क्लिनिकल अभ्यास अहवाल (CTRI/2025/10/095664), १३ वनस्पती घटक व संपूर्ण वैज्ञानिक निष्कर्ष.'
  }
];

const ClinicalReportSection = ({ showFullPageHeader = false }) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filteredReports = clinicalReportsData.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.titleMr && item.titleMr.toLowerCase().includes(q)) ||
      item.actionTextEn.toLowerCase().includes(q)
    );
  });

  return (
    <section 
      id="report" 
      className="section clinical-report-section"
      style={{ 
        backgroundColor: showFullPageHeader ? 'transparent' : '#ffffff',
        borderTop: showFullPageHeader ? 'none' : '1px solid #E1E9DF',
        padding: showFullPageHeader ? '1.25rem 0 3.5rem' : '4rem 0'
      }}
    >
      <div className="container">
        {/* Section Header - Only shown when not on dedicated full page */}
        {!showFullPageHeader && (
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div className="section-badge">
              <ShieldCheck size={15} style={{ color: '#006B2D' }} />
              <span>{language === 'mr' ? 'शासकीय व क्लिनिकल चाचण्या' : 'Government & Clinical Trials'}</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: '#006B2D', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'क्लिनिकल रिपोर्ट (Clinical Report)' : 'Clinical Report'}
            </h2>

            <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '0.98rem', color: '#5F6B61' }}>
              {language === 'mr'
                ? 'Antox - D फॉर्म्युलाचे अधिकृत शासकीय CTRI (Clinical Trials Registry - India) व वैज्ञानिक संशोधन अहवाल.'
                : 'Official clinical trial registrations, CTRI government records, and conclusion reports for Antox - D formulation.'}
            </p>
          </div>
        )}

        {/* Trust Badges Bar */}
        <div className="report-trust-badges-bar">
          <div className="report-trust-badge-item">
            <div className="report-trust-badge-icon" style={{ backgroundColor: '#e2faea', color: '#006B2D' }}>
              <Award size={20} />
            </div>
            <div className="report-trust-badge-content">
              <div className="report-trust-badge-title">
                CTRI / ICMR Registered
              </div>
              <div className="report-trust-badge-desc">
                {language === 'mr' ? 'शासकीय नोंदणीकृत मानके' : 'Clinical Trials Registry - India'}
              </div>
            </div>
          </div>

          <div className="report-trust-badge-item">
            <div className="report-trust-badge-icon" style={{ backgroundColor: '#fff9e6', color: '#b38600' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="report-trust-badge-content">
              <div className="report-trust-badge-title" style={{ color: '#785300' }}>
                Pre-Clinically & Clinically Tested
              </div>
              <div className="report-trust-badge-desc">
                {language === 'mr' ? 'प्रमाणित परिणामकारकता' : 'Proven Herbal Safety & Efficacy'}
              </div>
            </div>
          </div>

          <div className="report-trust-badge-item">
            <div className="report-trust-badge-icon" style={{ backgroundColor: '#e2faea', color: '#006B2D' }}>
              <Clock size={20} />
            </div>
            <div className="report-trust-badge-content">
              <div className="report-trust-badge-title">
                100% Transparency
              </div>
              <div className="report-trust-badge-desc">
                {language === 'mr' ? 'पारदर्शक माहिती व पुरावे' : 'Direct Access to Government Documents'}
              </div>
            </div>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="report-search-bar-wrap" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#006B2D' }}>
            {language === 'mr' ? 'उपलब्ध अहवाल सूची (Study Report)' : 'Study Report Database'}
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '320px'
          }}>
            <Search 
              size={17} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#5F6B61'
              }} 
            />
            <input
              type="text"
              placeholder={language === 'mr' ? 'अहवाल शोधा (Search report)...' : 'Search reports...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.35rem',
                borderRadius: '10px',
                border: '1.5px solid #E1E9DF',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="report-table-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E1E9DF',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 107, 45, 0.05)',
          marginBottom: '2rem'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#006B2D',
                color: '#ffffff'
              }}>
                <th style={{ padding: '1rem 1.25rem', width: '80px', fontWeight: 700, fontSize: '0.92rem' }}>
                  {language === 'mr' ? 'क्र. (Sr. No.)' : 'Sr. No.'}
                </th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.92rem' }}>
                  {language === 'mr' ? 'शीर्षक (Title)' : 'Title'}
                </th>
                <th style={{ padding: '1rem 1.25rem', width: '320px', fontWeight: 700, fontSize: '0.92rem', textAlign: 'right' }}>
                  {language === 'mr' ? 'अहवाल (Report)' : 'Report'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <tr 
                    key={report.srNo}
                    style={{
                      backgroundColor: isEven ? '#F9FBF8' : '#ffffff',
                      borderBottom: '1px solid #E1E9DF',
                      transition: 'background-color 0.2s ease'
                    }}
                    className="report-table-row"
                  >
                    <td style={{ padding: '1.15rem 1.25rem', fontWeight: 700, color: '#006B2D', fontSize: '0.95rem' }}>
                      {report.srNo}
                    </td>

                    <td style={{ padding: '1.15rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#17251B', fontSize: '0.98rem', marginBottom: '0.2rem' }}>
                        {language === 'mr' ? report.titleMr : report.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5F6B61' }}>
                        {language === 'mr' ? report.descriptionMr : report.descriptionEn}
                      </div>
                    </td>

                    <td style={{ padding: '1.15rem 1.25rem', textAlign: 'right' }}>
                      {report.fileType === 'link' && (
                        <a
                          href={report.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.55rem 1.1rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            backgroundColor: '#006B2D',
                            color: '#ffffff',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={15} />
                          <span>{language === 'mr' ? report.actionTextMr : report.actionTextEn}</span>
                        </a>
                      )}

                      {report.fileType === 'pdf' && (
                        <a
                          href={report.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.55rem 1.1rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            borderColor: '#006B2D',
                            color: '#006B2D',
                            textDecoration: 'none'
                          }}
                        >
                          <FileText size={15} />
                          <span>{language === 'mr' ? report.actionTextMr : report.actionTextEn}</span>
                        </a>
                      )}

                      {(report.fileType === 'pdf-direct' || report.fileType === 'pdf-modal') && (
                        <a
                          href={report.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.55rem 1.1rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            backgroundColor: '#006B2D',
                            color: '#ffffff',
                            textDecoration: 'none',
                            boxShadow: '0 2px 8px rgba(0, 107, 45, 0.2)'
                          }}
                        >
                          <FileText size={15} />
                          <span>{language === 'mr' ? report.actionTextMr : report.actionTextEn}</span>
                        </a>
                      )}

                      {report.fileType === 'contact' && (
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#5F6B61', fontWeight: 600 }}>
                            {language === 'mr' ? report.actionTextMr : report.actionTextEn}
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a
                              href={`tel:${organizationInfo.contact.primaryPhone}`}
                              className="btn btn-call btn-sm"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              <PhoneCall size={13} />
                              <span>{organizationInfo.contact.primaryPhone}</span>
                            </a>
                            <a
                              href={report.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              <WhatsAppIcon size={14} animated={true} />
                              <span>PRO Desk</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#5F6B61' }}>
                    {language === 'mr' ? 'कोणताही अहवाल सापडला नाही.' : 'No reports found matching your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PRO / Regimen Contact Helper Box */}
        <div className="report-help-box" style={{
          backgroundColor: '#F3F8F1',
          borderRadius: '16px',
          padding: '1.35rem 1.5rem',
          border: '1px solid #E1E9DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <HelpCircle size={24} style={{ color: '#006B2D', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.95rem' }}>
                {language === 'mr' ? 'संशोधन व क्लिनिकल माहितीबाबत अधिक मार्गदर्शन हवे आहे?' : 'Need More Scientific Or Clinical Details?'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#5F6B61' }}>
                {language === 'mr' 
                  ? 'सहारा सोशल फाऊंडेशन, कोल्हापूर कार्यालयाशी ७७४५०६६७०७ या अधिकृत क्रमांकावर संपर्क साधा.' 
                  : 'Contact our Kolhapur counseling and medical research desk at 7745066707.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call"
            >
              <PhoneCall size={16} />
              <span>{language === 'mr' ? 'फोन करा' : 'Call Desk'}</span>
            </a>
            <a
              href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                'नमस्कार, मला Antox क्लिनिकल संशोधन व चाचणी अहवालाविषयी माहिती हवी आहे.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <WhatsAppIcon size={16} animated={true} />
              <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप' : 'WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .report-table-row:hover {
          background-color: #f1f8ee !important;
        }

        .report-trust-badges-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .report-trust-badge-item {
          background-color: #F3F8F1;
          border-radius: 12px;
          padding: 0.85rem 1.15rem;
          border: 1px solid #E1E9DF;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .report-trust-badge-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .report-trust-badge-title {
          font-weight: 800;
          color: #006B2D;
          font-size: 0.90rem;
        }

        .report-trust-badge-desc {
          font-size: 0.78rem;
          color: #5F6B61;
        }

        @media (max-width: 768px) {
          .clinical-report-section {
            padding-top: 0.45rem !important;
            padding-bottom: 1.5rem !important;
          }

          /* Compact 3-Column 1-Row Trust Badges Bar on Mobile (Takes ~50px instead of ~280px!) */
          .report-trust-badges-bar {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.35rem !important;
            margin-bottom: 0.75rem !important;
          }

          .report-trust-badge-item {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 0.45rem 0.25rem !important;
            gap: 0.25rem !important;
            border-radius: 10px !important;
          }

          .report-trust-badge-icon {
            width: 28px !important;
            height: 28px !important;
            border-radius: 7px !important;
          }

          .report-trust-badge-icon svg {
            width: 15px !important;
            height: 15px !important;
          }

          .report-trust-badge-title {
            font-size: 0.68rem !important;
            line-height: 1.15 !important;
            font-weight: 700 !important;
          }

          .report-trust-badge-desc {
            display: none !important;
          }

          /* Search Bar Spacing on Mobile */
          .report-search-bar-wrap {
            gap: 0.45rem !important;
            margin-bottom: 0.65rem !important;
          }

          .report-search-bar-wrap > div:first-child {
            font-size: 0.84rem !important;
          }

          .report-search-bar-wrap input {
            padding: 0.4rem 0.75rem 0.4rem 2.1rem !important;
            font-size: 0.82rem !important;
            min-height: 38px !important;
          }

          /* Table Card & Row Spacing on Mobile */
          .report-table-card {
            border-radius: 12px !important;
            margin-bottom: 1rem !important;
          }

          .report-table-card table,
          .report-table-card thead,
          .report-table-card tbody,
          .report-table-card th,
          .report-table-card td,
          .report-table-card tr {
            display: block;
          }

          .report-table-card thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }

          .report-table-card tr {
            border-bottom: 1px solid #E1E9DF !important;
            padding: 0.65rem 0.75rem !important;
          }

          .report-table-card td {
            border: none;
            padding: 0.15rem 0 !important;
            text-align: left !important;
          }

          .report-table-card td:first-child {
            display: inline-block;
            background: #e2faea;
            color: #006B2D;
            padding: 0.12rem 0.45rem !important;
            border-radius: 5px;
            font-size: 0.74rem;
            margin-bottom: 0.2rem;
            font-weight: 700;
          }

          .report-table-card td:nth-child(2) > div:first-child {
            font-size: 0.90rem !important;
            margin-bottom: 0.15rem !important;
          }

          .report-table-card td:nth-child(2) > div:last-child {
            font-size: 0.76rem !important;
            line-height: 1.35 !important;
          }

          .report-table-card td:last-child {
            margin-top: 0.45rem !important;
            text-align: left !important;
          }

          .report-table-card td:last-child .btn {
            padding: 0.42rem 0.85rem !important;
            font-size: 0.80rem !important;
            min-height: 36px !important;
          }

          /* Help / Contact Box on Mobile */
          .report-help-box {
            padding: 0.75rem 0.85rem !important;
            border-radius: 12px !important;
            gap: 0.65rem !important;
            margin-top: 0.5rem !important;
          }

          .report-help-box .btn {
            padding: 0.42rem 0.75rem !important;
            font-size: 0.78rem !important;
            min-height: 36px !important;
          }
        }
      `}</style>

      {/* Full 78-Page Clinical Study Report Interactive Reader Modal */}
      <ClinicalStudyReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />
    </section>
  );
};

export default ClinicalReportSection;
