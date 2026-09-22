// Restricted Affiliate Portal for Logged-In Affiliates & Promoters
import React, { useState, useEffect } from 'react';
import { 
  Award, Copy, ShoppingBag, Target, Users, CreditCard, 
  ExternalLink, CheckCircle2, TrendingUp, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import { useAuth } from '../../../context/AuthContext';

export default function AffiliatePortal() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [commissionTx, setCommissionTx] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubOrders = dbService.subscribe('orders', setOrders);
    const unsubLeads = dbService.subscribe('leads', setLeads);
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);

    return () => {
      unsubOrders();
      unsubLeads();
      unsubCust();
      unsubTx();
    };
  }, []);

  // Filter ONLY this affiliate's data
  const myAffiliateId = currentUser?.id;
  const myReferralCode = currentUser?.referralCode || 'SAHARA-PARTNER-001';
  const referralLink = `https://samarthkolhapur.com/?ref=${myReferralCode}`;

  const myOrders = orders.filter((o) => o.assignedAffiliate === myAffiliateId);
  const myLeads = leads.filter((l) => l.assignedAffiliate === myAffiliateId);
  const myCustomers = customers.filter((c) => c.assignedAffiliate === myAffiliateId);
  const myTransactions = commissionTx.filter((tx) => tx.beneficiaryId === myAffiliateId);

  const totalSales = myOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const totalCommission = myTransactions
    .filter((tx) => tx.status === 'Approved' || tx.status === 'Paid')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const pendingCommission = myTransactions
    .filter((tx) => tx.status === 'Pending Approval')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const paidCommission = myTransactions
    .filter((tx) => tx.status === 'Paid')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Award size={24} style={{ color: '#1b4d3e' }} /> Welcome, {currentUser?.name || 'Partner'}
          </h1>
          <div className="crm-page-subtitle">
            Sahara Social Foundation Affiliate & Promoter Portal • Samarth Kolhapur
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-primary" onClick={handleCopyLink}>
            <Copy size={16} /> {copied ? 'Referral Link Copied!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="crm-card" style={{ background: 'linear-gradient(135deg, #1b4d3e, #12352b)', color: '#ffffff', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fde047', fontWeight: 700 }}>
              Your Unique Affiliate Referral Link
            </div>
            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 700, marginTop: '4px', wordBreak: 'break-all' }}>
              {referralLink}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
              Share this link across WhatsApp, social media, and health camps. Any customer ordering via your link is attributed to your account automatically.
            </div>
          </div>
          <button 
            className="crm-btn crm-btn-accent"
            style={{ fontWeight: 700 }}
            onClick={handleCopyLink}
          >
            <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Sales Referred</div>
            <div className="crm-stat-value">{formatCurrency(totalSales)}</div>
            <div className="crm-stat-subtext">{myOrders.length} confirmed orders</div>
          </div>
          <div className="crm-stat-icon-wrap primary">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Commission</div>
            <div className="crm-stat-value">{formatCurrency(totalCommission)}</div>
            <div className="crm-stat-subtext">Approved earnings</div>
          </div>
          <div className="crm-stat-icon-wrap accent">
            <Award size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Pending Approval</div>
            <div className="crm-stat-value">{formatCurrency(pendingCommission)}</div>
            <div className="crm-stat-subtext">Awaiting manager verification</div>
          </div>
          <div className="crm-stat-icon-wrap warning">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Paid to Account</div>
            <div className="crm-stat-value">{formatCurrency(paidCommission)}</div>
            <div className="crm-stat-subtext">Disbursed via UPI / Bank</div>
          </div>
          <div className="crm-stat-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Orders and Commission Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Referred Orders */}
        <div className="crm-card" style={{ margin: 0 }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <ShoppingBag size={18} style={{ color: '#1b4d3e' }} /> My Referred Orders ({myOrders.length})
            </h3>
          </div>
          <div className="crm-card-body" style={{ padding: 0 }}>
            {myOrders.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                No referred orders yet. Share your referral link to earn commissions!
              </div>
            ) : (
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Sale Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.orderId}</strong></td>
                        <td>{o.customerName}</td>
                        <td><strong>{formatCurrency(o.grandTotal)}</strong></td>
                        <td><span className={`badge ${getStatusBadgeClass(o.orderStatus)}`}>{o.orderStatus}</span></td>
                        <td>{formatDate(o.orderDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Commission Ledger */}
        <div className="crm-card" style={{ margin: 0 }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <Award size={18} style={{ color: '#c69214' }} /> Commission Ledger ({myTransactions.length})
            </h3>
          </div>
          <div className="crm-card-body" style={{ padding: 0 }}>
            {myTransactions.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                No commission entries recorded yet.
              </div>
            ) : (
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Order</th>
                      <th>Rate</th>
                      <th>Commission</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td><strong>{tx.transactionId}</strong></td>
                        <td>{tx.orderRef}</td>
                        <td>{tx.slabRate}%</td>
                        <td><strong style={{ color: '#1b4d3e' }}>{formatCurrency(tx.commissionAmount)}</strong></td>
                        <td><span className={`badge ${getStatusBadgeClass(tx.status)}`}>{tx.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
