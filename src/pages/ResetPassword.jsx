// Dedicated Password Reset Page for Sahara Social Foundation
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { dbService } from '../services/db';
import { useLanguage } from '../context/LanguageContext';
import MissionLogoBadge from '../components/MissionLogoBadge';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';
  const roleParam = searchParams.get('role') || 'affiliate';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanEmail) {
      setError(language === 'mr' ? 'कृपया आपला वैध ईमेल प्रविष्ट करा.' : 'Please enter your registered email address.');
      return;
    }

    if (cleanPass.length < 6) {
      setError(language === 'mr' ? 'पासवर्ड किमान ६ अक्षरांचा असावा.' : 'Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError(language === 'mr' ? 'दोन्ही पासवर्ड जुळत नाहीत.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const allUsers = dbService.getAll('users') || [];
      const user = allUsers.find(
        (u) => (u.email || '').toLowerCase().trim() === cleanEmail
      );

      if (!user) {
        throw new Error(
          language === 'mr'
            ? 'या ईमेल पत्त्यासह कोणतेही खाते सापडले नाही.'
            : 'No account found with this email address.'
        );
      }

      // Check token validity if a token was supplied
      if (token && user.resetToken && user.resetToken !== token) {
        throw new Error(
          language === 'mr'
            ? 'रीसेट टोकन अवैध किंवा कालबाह्य झाले आहे. कृपया नवीन लिंक मागवा.'
            : 'Reset link is invalid or expired. Please request a new password reset.'
        );
      }

      if (user.resetTokenExpires && Date.now() > user.resetTokenExpires) {
        throw new Error(
          language === 'mr'
            ? 'रीसेट लिंक कालबाह्य झाली आहे (१ तास मर्यादा). कृपया नवीन लिंक मागवा.'
            : 'Reset link has expired (1 hour limit). Please request a new password reset.'
        );
      }

      // Update password in dbService
      await dbService.update('users', user.id, {
        password: cleanPass,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (roleParam === 'affiliate') {
      navigate('/affiliate');
    } else {
      navigate('/crm/login');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f3f8f1 100%)'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 12px 35px rgba(0, 107, 45, 0.12)',
        border: '1px solid #E1E9DF',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <MissionLogoBadge size={52} style={{ filter: 'none' }} />
          </div>

          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#E8F5E9',
            color: '#006B2D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <KeyRound size={22} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#006B2D', margin: '0 0 0.35rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? 'पासवर्ड रीसेट करा' : 'Reset Your Password'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#5F6B61', margin: 0 }}>
            {language === 'mr' 
              ? 'आपल्या खात्यासाठी सुरक्षित नवीन पासवर्ड तयार करा.' 
              : 'Create a secure new password for your account.'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            background: '#FEF2F2',
            border: '1.5px solid #F87171',
            borderRadius: '12px',
            color: '#B91C1C',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', marginBottom: '0.5rem' }}>
              {language === 'mr' ? 'पासवर्ड यशस्वीरित्या बदलला!' : 'Password Reset Successfully!'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              {language === 'mr'
                ? 'आपला पासवर्ड यशस्वीरित्या रीसेट करण्यात आला आहे. आता आपण नवीन पासवर्ड वापरून लॉगिन करू शकता.'
                : 'Your password has been securely updated. You can now log in to your account with your new credentials.'}
            </p>

            <button
              type="button"
              onClick={handleGoToLogin}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '12px'
              }}
            >
              <ShieldCheck size={18} />
              <span>{language === 'mr' ? 'लॉगिन पृष्ठावर जा' : 'Proceed to Login'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#17251B', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'नोंदणीकृत ईमेल पत्ता' : 'Registered Email Address'}
              </label>
              <input
                type="email"
                required
                readOnly={!!emailParam}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #E1E9DF',
                  background: emailParam ? '#F3F4F6' : '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#17251B', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'नवीन पासवर्ड *' : 'New Password *'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={language === 'mr' ? 'किमान ६ अक्षरांचा पासवर्ड' : 'At least 6 characters'}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #E1E9DF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#17251B', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'नवीन पासवर्ड पुष्टी करा *' : 'Confirm New Password *'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={language === 'mr' ? 'तोच पासवर्ड पुन्हा प्रविष्ट करा' : 'Re-enter your new password'}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #E1E9DF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Lock size={18} />
              <span>
                {loading 
                  ? (language === 'mr' ? 'अपडेट होत आहे...' : 'Saving Password...') 
                  : (language === 'mr' ? 'नवीन पासवर्ड सेव्ह करा' : 'Save New Password')}
              </span>
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to={roleParam === 'affiliate' ? '/affiliate' : '/crm/login'}
                style={{
                  color: '#006B2D',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ArrowLeft size={16} />
                <span>{language === 'mr' ? 'लॉगिन पृष्ठावर परत जा' : 'Back to Login'}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
