import React, { useState, useEffect } from 'react';
import { 
  Percent, Award, CheckCircle2, Clock, XCircle, 
  ArrowUpRight, Users, CreditCard, ChevronRight, AlertCircle, RefreshCw 
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';

export default function CommissionDashboard() {
  const [commissionTx, setCommissionTx] = useState([]);
  const [slabs, setSlabs] = useState([]);
  const [settings, setSettings] = useState({});
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    dbService.syncAllOrderCommissions();
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);
    const unsubSlabs = dbService.subscribe('commissionSlabs', setSlabs);
    setSettings(dbService.getAll('settings'));

    return () => {
      unsubTx();
      unsubSlabs();
    };
  }, []);

  const handleSyncCommissions = async () => {
    setSyncing(true);
    const count = await dbService.syncAllOrderCommissions();
    setSyncing(false);
    alert(`Commission synchronization complete! Generated ${count} new commission records from paid orders.`);
  };

  const totalCommission = commissionTx.reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const approvedCommission = commissionTx
    .filter((tx) => tx.status === 'Approved')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const pendingCommission = commissionTx
    .filter((tx) => tx.status === 'Pending Approval')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const paidCommission = commissionTx
    .filter((tx) => tx.status === 'Paid')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  const pendingTransactions = commissionTx.filter((tx) => tx.status === 'Pending Approval');

  const handleApprove = async (txId) => {
    await dbService.update('commissionTransactions', txId, {
      status: 'Approved',
      approvedBy: 'Dr. Sharad Patil (Admin)',
      approvedAt: new Date().toISOString()
    });
  };

  const handleReject = async (txId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason) {
      await dbService.update('commissionTransactions', txId, {
        status: 'Rejected',
        rejectionReason: reason
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Percent size={24} style={{ color: '#1b4d3e' }} /> Commission Management Dashboard
          </h1>
          <div className="crm-page-subtitle">
            Automated slab-based commission engine, approvals, and payout disbursement
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-secondary" onClick={handleSyncCommissions} disabled={syncing}>
            <RefreshCw size={14} /> {syncing ? 'Syncing...' : 'Sync Order Commissions'}
          </button>
          <a href="/crm/commission/slabs" className="crm-btn crm-btn-secondary">
            Configure Slabs <ChevronRight size={14} />
          </a>
          <a href="/crm/commission/payouts" className="crm-btn crm-btn-primary">
            Generate Payouts <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Commission Configuration Banner */}
      <div className="crm-card" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderLeft: '4px solid #1b4d3e', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b4d3e' }}>
              Active Commission Engine Mode: {settings.commissionCalculationType === 'progressive' ? 'Progressive Slab (Tiered)' : 'Flat Slab Calculation'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Trigger Rule: Triggered only when Order is <strong>Delivered</strong> and Payment is <strong>Paid</strong>. Cancelled / Refunded orders automatically reverse commissions.
            </div>
          </div>
          <span className="badge badge-success">Engine Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Generated</div>
            <div className="crm-stat-value">{formatCurrency(totalCommission)}</div>
            <div className="crm-stat-subtext">{commissionTx.length} total transactions</div>
          </div>
          <div className="crm-stat-icon-wrap primary">
            <Award size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Pending Approval</div>
            <div className="crm-stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(pendingCommission)}</div>
            <div className="crm-stat-subtext">{pendingTransactions.length} pending review</div>
          </div>
          <div className="crm-stat-icon-wrap warning">
            <Clock size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Approved Commission</div>
            <div className="crm-stat-value" style={{ color: '#10b981' }}>{formatCurrency(approvedCommission)}</div>
            <div className="crm-stat-subtext">Ready for monthly payout</div>
          </div>
          <div className="crm-stat-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Disbursed / Paid</div>
            <div className="crm-stat-value" style={{ color: '#0284c7' }}>{formatCurrency(paidCommission)}</div>
            <div className="crm-stat-subtext">Transferred to accounts</div>
          </div>
          <div className="crm-stat-icon-wrap info">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Pending Approval Queue */}
      <div className="crm-card">
        <div className="crm-card-header">
          <h3 className="crm-card-title">
            <Clock size={18} style={{ color: '#f59e0b' }} /> Pending Commission Approvals Queue ({pendingTransactions.length})
          </h3>
          <a href="/crm/commission/transactions" className="crm-btn crm-btn-secondary crm-btn-sm">
            All Transactions
          </a>
        </div>
        <div className="crm-card-body" style={{ padding: 0 }}>
          {pendingTransactions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              ✓ All commissions are reviewed and approved! No pending transactions.
            </div>
          ) : (
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Order Ref</th>
                    <th>Beneficiary</th>
                    <th>Sale Value</th>
                    <th>Applied Slab & Rate</th>
                    <th>Commission</th>
                    <th>Trigger Date</th>
                    <th>Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td><strong>{tx.transactionId}</strong></td>
                      <td><strong>{tx.orderRef}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.beneficiaryName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.beneficiaryType?.toUpperCase()}</div>
                      </td>
                      <td>{formatCurrency(tx.saleAmount)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.slabRate}%</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.slabApplied}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#1b4d3e', fontSize: '1.05rem' }}>{formatCurrency(tx.commissionAmount)}</strong>
                      </td>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="crm-btn crm-btn-primary crm-btn-sm"
                            onClick={() => handleApprove(tx.id)}
                            title="Approve Commission"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            className="crm-btn crm-btn-danger crm-btn-sm"
                            onClick={() => handleReject(tx.id)}
                            title="Reject"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Active Slabs Preview */}
      <div className="crm-card">
        <div className="crm-card-header">
          <h3 className="crm-card-title">
            <Percent size={18} style={{ color: '#1b4d3e' }} /> Active Commission Slabs
          </h3>
          <a href="/crm/commission/slabs" className="crm-btn crm-btn-secondary crm-btn-sm">Edit Slabs</a>
        </div>
        <div className="crm-card-body" style={{ padding: 0 }}>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Slab Name</th>
                  <th>Minimum Sales (₹)</th>
                  <th>Maximum Sales (₹)</th>
                  <th>Commission Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((slab) => (
                  <tr key={slab.id}>
                    <td><strong>{slab.name}</strong></td>
                    <td>{formatCurrency(slab.minAmount)}</td>
                    <td>{slab.maxAmount ? formatCurrency(slab.maxAmount) : 'Above / No Limit'}</td>
                    <td><strong style={{ color: '#1b4d3e' }}>{slab.ratePercentage}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
