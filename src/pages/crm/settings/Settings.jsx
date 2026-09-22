// System and Business Configuration Settings for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Save, RefreshCw, CheckCircle2, 
  Building, Phone, Globe, Shield, Percent, AlertTriangle, 
  Cloud, Database, HardDrive, Check, UploadCloud, Download, Server, Trash2
} from 'lucide-react';
import { dbService, COLLECTIONS } from '../../../services/db';
import { isFirebaseConfigured, testFirebaseConnection, firebaseConfig } from '../../../services/firebase';

export default function Settings() {
  const [settings, setSettings] = useState(dbService.getAll('settings'));
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [fbStatus, setFbStatus] = useState({ loading: false, result: null });
  const [seedingStatus, setSeedingStatus] = useState({ loading: false, result: null });

  const handleSave = async (e) => {
    e.preventDefault();
    await dbService.update('settings', 'company_settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearAllData = async () => {
    await dbService.clearAllOperationalData();
    setClearConfirm(false);
    alert('All operational records have been permanently deleted from both local storage and Firebase Cloud Firestore!');
  };

  const [clearConfirm, setClearConfirm] = useState(false);

  const handleTestFirebase = async () => {
    setFbStatus({ loading: true, result: null });
    const result = await testFirebaseConnection();
    setFbStatus({ loading: false, result });
  };

  const handleSeedFirestore = async () => {
    setSeedingStatus({ loading: true, result: null });
    try {
      const res = await dbService.seedFirestore();
      setSeedingStatus({
        loading: false,
        result: {
          success: true,
          message: `Successfully populated Cloud Firestore with ${res.seededCount} records across all CRM collections!`
        }
      });
    } catch (err) {
      setSeedingStatus({
        loading: false,
        result: {
          success: false,
          message: err.message
        }
      });
    }
  };

  const handleExportBackup = () => {
    const backup = {};
    COLLECTIONS.forEach((col) => {
      backup[col] = dbService.getAll(col);
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sahara_CRM_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <SettingsIcon size={24} style={{ color: '#1b4d3e' }} /> CRM System & Foundation Settings
          </h1>
          <div className="crm-page-subtitle">
            Organization branding, Kolhapur center contact numbers, Cloud Firestore backend, and commission triggers
          </div>
        </div>

        <div className="crm-header-btn-group">
          {saved && (
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} /> Settings Saved
            </span>
          )}
          <button className="crm-btn crm-btn-primary" onClick={handleSave}>
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>

      {/* Firebase Cloud Backend Integration Card */}
      <div className="crm-card" style={{ borderLeft: '5px solid #059669', marginBottom: '1.5rem' }}>
        <div className="crm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 className="crm-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#064e3b' }}>
            <Cloud size={20} style={{ color: '#059669' }} /> Firebase Cloud Backend & Database Sync
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: isFirebaseConfigured ? '#ecfdf5' : '#eff6ff',
              color: isFirebaseConfigured ? '#059669' : '#2563eb',
              border: `1px solid ${isFirebaseConfigured ? '#a7f3d0' : '#bfdbfe'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isFirebaseConfigured ? '#10b981' : '#3b82f6'
              }} />
              {isFirebaseConfigured ? 'Firebase Cloud Active' : 'Local Reactive Storage Active'}
            </span>
          </div>
        </div>

        <div className="crm-card-body">
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            This CRM features a dual-layer backend architecture. It operates with real-time <strong>Cloud Firestore</strong>, <strong>Firebase Auth</strong>, and <strong>Cloud Storage</strong> when API keys are placed in <code>.env</code>, and provides instant zero-latency offline caching.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            backgroundColor: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.25rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PROJECT ID</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {firebaseConfig.projectId || 'sahara-social-foundation'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>AUTH DOMAIN</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {firebaseConfig.authDomain || 'sahara-social-foundation.firebaseapp.com'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>STORAGE BUCKET</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {firebaseConfig.storageBucket || 'sahara-social-foundation.appspot.com'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SECURITY RULES</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                RBAC Configured (firestore.rules)
              </div>
            </div>
          </div>

          {/* Test & Seeding Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-sm"
              onClick={handleTestFirebase}
              disabled={fbStatus.loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Server size={14} />
              {fbStatus.loading ? 'Testing Connection...' : 'Test Cloud Connection'}
            </button>

            <button
              type="button"
              className="crm-btn crm-btn-primary crm-btn-sm"
              onClick={handleSeedFirestore}
              disabled={seedingStatus.loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#065f46', borderColor: '#065f46' }}
            >
              <UploadCloud size={14} />
              {seedingStatus.loading ? 'Seeding Firestore...' : 'Seed / Sync All Data to Firestore'}
            </button>

            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-sm"
              onClick={handleExportBackup}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={14} /> Export CRM Backup (JSON)
            </button>
          </div>

          {/* Connection Test Result */}
          {fbStatus.result && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: fbStatus.result.connected ? '#ecfdf5' : '#fef2f2',
              color: fbStatus.result.connected ? '#065f46' : '#991b1b',
              border: `1px solid ${fbStatus.result.connected ? '#a7f3d0' : '#fecaca'}`
            }}>
              {fbStatus.result.message}
            </div>
          )}

          {/* Seeding Result */}
          {seedingStatus.result && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: seedingStatus.result.success ? '#ecfdf5' : '#fef2f2',
              color: seedingStatus.result.success ? '#065f46' : '#991b1b',
              border: `1px solid ${seedingStatus.result.success ? '#a7f3d0' : '#fecaca'}`
            }}>
              {seedingStatus.result.message}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Organization Identity Box */}
        <div className="crm-card" style={{ marginBottom: '1.5rem' }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <Building size={18} style={{ color: '#1b4d3e' }} /> Organization & Business Identity
            </h3>
          </div>
          <div className="crm-card-body">
            <div className="crm-form-grid">
              <div className="crm-form-group">
                <label className="crm-form-label">Company / Trust Legal Name</label>
                <input
                  type="text"
                  className="crm-input"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Brand / Platform Name</label>
                <input
                  type="text"
                  className="crm-input"
                  value={settings.brandName || ''}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Registration No / Trust ID</label>
                <input
                  type="text"
                  className="crm-input"
                  value={settings.registrationNo || ''}
                  onChange={(e) => setSettings({ ...settings, registrationNo: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Helpline / Phone</label>
                <input
                  type="text"
                  className="crm-input"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">WhatsApp Helpline Number</label>
                <input
                  type="text"
                  className="crm-input"
                  value={settings.whatsappNumber || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Official Email</label>
                <input
                  type="email"
                  className="crm-input"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Kolhapur Center Physical Address</label>
              <textarea
                className="crm-textarea"
                rows="2"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Commission Engine & Business Rules */}
        <div className="crm-card" style={{ marginBottom: '1.5rem' }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <Percent size={18} style={{ color: '#c69214' }} /> Commission Trigger & Referral Settings
            </h3>
          </div>
          <div className="crm-card-body">
            <div className="crm-form-grid">
              <div className="crm-form-group">
                <label className="crm-form-label">Commission Calculation Method</label>
                <select
                  className="crm-form-select"
                  value={settings.commissionCalculationType || 'flat'}
                  onChange={(e) => setSettings({ ...settings, commissionCalculationType: e.target.value })}
                >
                  <option value="flat">Flat Slab Rate</option>
                  <option value="progressive">Progressive Tiered Slab</option>
                </select>
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Commission Eligibility Trigger</label>
                <select
                  className="crm-form-select"
                  value={settings.commissionTrigger || 'delivered_paid'}
                  onChange={(e) => setSettings({ ...settings, commissionTrigger: e.target.value })}
                >
                  <option value="delivered_paid">Order Delivered AND Payment Confirmed</option>
                  <option value="paid">Payment Confirmed Only</option>
                </select>
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Default Referral Code Prefix</label>
                <input
                  type="text"
                  className="crm-input"
                  value={settings.defaultReferralPrefix || 'SAHARA'}
                  onChange={(e) => setSettings({ ...settings, defaultReferralPrefix: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Monthly Payout Day of Month</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="crm-input"
                  value={settings.payoutDayOfMonth || 30}
                  onChange={(e) => setSettings({ ...settings, payoutDayOfMonth: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Maintenance Zone */}
        <div className="crm-card" style={{ borderColor: '#fca5a5', background: '#fff5f5' }}>
          <div className="crm-card-header" style={{ borderColor: '#fca5a5' }}>
            <h3 className="crm-card-title" style={{ color: '#991b1b' }}>
              <Trash2 size={18} /> CRM Data Purge & Maintenance
            </h3>
          </div>
          <div className="crm-card-body">
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
              Use this action to wipe all operational mock records (customers, leads, follow-ups, orders, commission transactions, payouts, support tickets, and logs) to keep your CRM completely clean for real operations.
            </p>
            {clearConfirm ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
                  Permanently delete all CRM operational data?
                </span>
                <button type="button" className="crm-btn crm-btn-danger crm-btn-sm" onClick={handleClearAllData}>
                  Yes, Delete All Dummy Records
                </button>
                <button type="button" className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setClearConfirm(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" className="crm-btn crm-btn-danger crm-btn-sm" onClick={() => setClearConfirm(true)}>
                <Trash2 size={14} /> Delete All Dummy CRM Data
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
