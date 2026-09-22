// Affiliate and Sales Team Partner Management for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Handshake, Plus, Search, CheckCircle2, XCircle, 
  Copy, ExternalLink, Award, Users, CreditCard 
} from 'lucide-react';
import { formatCurrency, formatPhone, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';
import UserAvatar from '../../../components/crm/UserAvatar';

export default function AffiliateList() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [commissionTx, setCommissionTx] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'affiliate',
    referralCode: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    upiId: '',
    bankAccount: '',
    ifsc: '',
    pan: '',
    status: 'active'
  });

  useEffect(() => {
    const unsubUsers = dbService.subscribe('users', setUsers);
    const unsubOrders = dbService.subscribe('orders', setOrders);
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);

    return () => {
      unsubUsers();
      unsubOrders();
      unsubTx();
    };
  }, []);

  const affiliates = users.filter((u) => u.role === 'affiliate' || u.role === 'sales_employee');

  const filteredAffiliates = affiliates.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      a.name.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q)) ||
      (a.referralCode && a.referralCode.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateAffiliate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const refCode = formData.referralCode || `SAHARA-${formData.name.split(' ')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    await dbService.add('users', {
      ...formData,
      referralCode: refCode,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120',
      status: formData.status || 'active'
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'affiliate',
      referralCode: '',
      city: 'Kolhapur',
      state: 'Maharashtra',
      upiId: '',
      bankAccount: '',
      ifsc: '',
      pan: '',
      status: 'active'
    });
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    await dbService.update('users', userId, { status: newStatus });
  };

  const handleCopyLink = (code) => {
    const link = `https://samarthkolhapur.com/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Handshake size={24} style={{ color: '#1b4d3e' }} /> Affiliate & Team Partner Management
          </h1>
          <div className="crm-page-subtitle">
            Manage field promoters, health clubs, referral codes, and partner accounts ({affiliates.length} partners)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredAffiliates} filename="Sahara_Affiliates" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Register Affiliate / Partner
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by partner name, phone, referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-toolbar-filters">
            <select
              className="crm-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending approval">Pending Approval</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Partner Name</th>
                <th>Role & Type</th>
                <th>Referral Code & Link</th>
                <th>Contact</th>
                <th>Total Sales Referred</th>
                <th>Total Commission</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((aff) => {
                const partnerOrders = orders.filter((o) => o.assignedAffiliate === aff.id || o.assignedEmployee === aff.id);
                const totalSales = partnerOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
                const partnerComm = commissionTx
                  .filter((tx) => tx.beneficiaryId === aff.id)
                  .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

                return (
                  <tr key={aff.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <UserAvatar
                          name={aff.name}
                          avatar={aff.avatar}
                          size={36}
                        />
                        <div>
                          <strong style={{ color: '#1e293b' }}>{aff.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{aff.city || 'Kolhapur'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {aff.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {aff.referralCode ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1b4d3e', background: '#e8f4f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {aff.referralCode}
                          </span>
                          <button
                            className="crm-icon-btn"
                            style={{ width: '26px', height: '26px' }}
                            onClick={() => handleCopyLink(aff.referralCode)}
                            title="Copy Website Referral Link"
                          >
                            <Copy size={12} color={copiedCode === aff.referralCode ? '#10b981' : '#64748b'} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Direct Staff</span>
                      )}
                    </td>
                    <td>
                      <div>{formatPhone(aff.phone)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{aff.email}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#1e293b' }}>{formatCurrency(totalSales)}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{partnerOrders.length} orders</div>
                    </td>
                    <td>
                      <strong style={{ color: '#c69214' }}>{formatCurrency(partnerComm)}</strong>
                    </td>
                    <td>
                      <select
                        className="crm-select"
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.4rem' }}
                        value={aff.status || 'active'}
                        onChange={(e) => handleUpdateStatus(aff.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="pending approval">Pending Approval</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => handleCopyLink(aff.referralCode || 'SAHARA-DIRECT')}
                      >
                        {copiedCode === aff.referralCode ? 'Copied!' : 'Copy Link'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Affiliate Modal */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Affiliate / Agent"
        size="lg"
      >
        <form onSubmit={handleCreateAffiliate}>
          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Full Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                placeholder="e.g. Suresh Patil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Mobile Number *</label>
              <input
                type="tel"
                className="crm-input"
                required
                placeholder="9423011223"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Email Address</label>
              <input
                type="email"
                className="crm-input"
                placeholder="partner@sahara.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Custom Referral Code</label>
              <input
                type="text"
                className="crm-input"
                placeholder="e.g. SAHARA-SURESH-001"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">City</label>
              <input
                type="text"
                className="crm-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">UPI ID for Payouts</label>
              <input
                type="text"
                className="crm-input"
                placeholder="partner@okaxis"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Register Affiliate</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
