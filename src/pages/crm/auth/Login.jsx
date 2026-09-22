// Professional CRM Login Screen for Samarth Kolhapur
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const { login, availableUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@samarthkolhapur.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const from = location.state?.from?.pathname || '/crm';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (userEmail) => {
    setEmail(userEmail);
    setPassword('Demo@123');
    setError('');
  };

  return (
    <div className="crm-auth-container">
      <div className="crm-auth-box">
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '54px', 
              height: '54px', 
              margin: '0 auto 1rem', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #c69214, #eab308)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#0f2d24',
              fontSize: '1.6rem',
              fontWeight: 900
            }}
          >
            सा
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1b4d3e' }}>
            Sahara Social Foundation
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Samarth Kolhapur CRM & Sales Management Portal
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>Password reset instructions sent to {email}.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="crm-form-group">
            <label className="crm-form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="crm-input" 
                required 
                placeholder="name@samarthkolhapur.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="crm-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="crm-form-label" style={{ margin: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => setResetSent(true)}
                style={{ background: 'none', border: 'none', color: '#1b4d3e', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              className="crm-input" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="crm-btn crm-btn-primary" 
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign in to CRM'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Quick Demo Login Roles:
          </div>
          <div className="crm-demo-pills">
            {availableUsers.map((u) => (
              <button 
                key={u.id} 
                type="button"
                className="crm-demo-pill"
                onClick={() => handleQuickSelect(u.email)}
              >
                {u.name.split(' ')[0]} ({u.role.replace('_', ' ')})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
