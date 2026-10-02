import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ClinicalReportSection from '../components/ClinicalReportSection';

const StudyReport = () => {
  const { language } = useLanguage();

  return (
    <div className="study-report-page">
      {/* Header Banner */}
      <div className="page-hero-header">
        <div className="container">
          <div className="section-badge">
            <FileText size={14} />
            <span>{language === 'mr' ? 'वैज्ञानिक पुरावे व चाचण्या' : 'Scientific Evidence & Clinical Trials'}</span>
          </div>

          <h1>
            {language === 'mr' ? 'क्लिनिकल रिपोर्ट (Clinical Report)' : 'Clinical Report'}
          </h1>

          <p>
            {language === 'mr'
              ? 'Antox - D फॉर्म्युलाचे अधिकृत आंतरराष्ट्रीय व शासकीय चाचणी अहवाल आणि वैज्ञानिक निष्कर्ष.'
              : 'Official clinical trial test reports, CTRI registration data, and research conclusion reports.'}
          </p>
        </div>
      </div>

      {/* Main Report Section */}
      <div style={{ backgroundColor: '#ffffff' }}>
        <ClinicalReportSection showFullPageHeader={true} />
      </div>
    </div>
  );
};

export default StudyReport;
