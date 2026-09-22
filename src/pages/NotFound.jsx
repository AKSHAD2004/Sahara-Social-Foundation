import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { language } = useLanguage();

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '6rem 0', textAlign: 'center', minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: '#059669', lineHeight: 1, marginBottom: '1rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#064e3b', fontWeight: 800, marginBottom: '0.75rem' }}>
          {language === 'mr' ? 'पृष्ठ सापडले नाही (Page Not Found)' : 'Page Not Found'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {language === 'mr'
            ? 'आपण शोधत असलेले पृष्ठ अस्तित्वात नाही किंवा बदलले गेले आहे.'
            : 'The page you are looking for does not exist or has been moved.'}
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} />
          <span>{language === 'mr' ? 'मुख्यपृष्ठावर परत जा' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
