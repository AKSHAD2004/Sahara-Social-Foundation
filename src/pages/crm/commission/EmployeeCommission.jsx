// Employee and Affiliate Monthly Commission Performance View for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Award, Users, Filter, Calendar, CheckCircle2, 
  Clock, TrendingUp, ChevronRight, RefreshCw, Percent, Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import { calculateCommission } from '../../../services/commissionEngine';
import ExportButton from '../../../components/crm/ExportButton';

export default function EmployeeCommission() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [slabs, setSlabs] = useState([]);
  const [settings, setSettings] = useState({});
  const [commissionTx, setCommissionTx] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    dbService.syncAllOrderCommissions();
    const unsubUsers = dbService.subscribe('users', (u) => {
      setUsers(u);
      if (u.length > 0) {
        setSelectedUserId((prev) => (prev && u.some((user) => user.id === prev) ? prev : u[0].id));
      }
    });
    const unsubOrders = dbService.subscribe('orders', setOrders);
    const unsubSlabs = dbService.subscribe('commissionSlabs', setSlabs);
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);
    setSettings(dbService.getAll('settings'));

    return () => {
      unsubUsers();
      unsubOrders();
      unsubSlabs();
      unsubTx();
    };
  }, []);

  const handleSyncCommissions = async () => {
    setSyncing(true);
    const count = await dbService.syncAllOrderCommissions();
    setSyncing(false);
    alert(`Commission sync complete! Processed & updated ${count} commission records.`);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];
  const activeUserId = selectedUser?.id || selectedUserId;

  // Filter transactions for this user
  const userTransactions = commissionTx.filter((tx) => tx.beneficiaryId === activeUserId);
  const userOrders = orders.filter((o) => o.assignedEmployee === activeUserId || o.assignedAffiliate === activeUserId);

  const totalSales = userOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const eligibleSales = userOrders.reduce((sum, o) => sum + (Number(o.eligibleAmount || o.grandTotal) || 0), 0);

  // Live slab qualification computation
  const liveSlabResult = calculateCommission(
    eligibleSales,
    slabs,
    settings?.commissionCalculationType || 'flat',
    eligibleSales
  );

  const txTotalCommission = userTransactions.reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const totalCommission = userTransactions.length > 0 ? txTotalCommission : liveSlabResult.totalCommission;

  const approvedCommission = userTransactions
    .filter((tx) => tx.status === 'Approved')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const pendingCommission = userTransactions
    .filter((tx) => tx.status === 'Pending Approval')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);
  const paidCommission = userTransactions
    .filter((tx) => tx.status === 'Paid')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  const effectivePending = userTransactions.length > 0 ? pendingCommission : totalCommission;

  const csvColumns = [
    { header: 'Tx ID', key: 'transactionId' },
    { header: 'Order Ref', key: 'orderRef' },
    { header: 'Sale Amount', key: 'saleAmount' },
    { header: 'Eligible Amount', key: 'eligibleAmount' },
    { header: 'Rate (%)', key: 'slabRate' },
    { header: 'Commission Amount', key: 'commissionAmount' },
    { header: 'Status', key: 'status' },
    { header: 'Date', key: 'createdAt' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Award size={24} style={{ color: '#1b4d3e' }} /> Team & Partner Commission Statements
          </h1>
          <div className="crm-page-subtitle">
            Individual monthly earnings breakdown, applicable slabs, and order transactions
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-secondary" onClick={handleSyncCommissions} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? 'crm-spin' : ''} /> {syncing ? 'Calculating...' : 'Recalculate & Sync'}
          </button>
          <ExportButton data={userTransactions} columns={csvColumns} filename={`Commission_${selectedUser?.name || 'User'}`} />
        </div>
      </div>

      {/* Member Selector Bar */}
      <div className="crm-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#64748b" />
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Member:</label>
              <select
                className="crm-select"
                style={{ fontWeight: 600 }}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="#64748b" />
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Month:</label>
              <input
                type="month"
                className="crm-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Role: <strong>{selectedUser?.role?.replace('_', ' ').toUpperCase()}</strong> • Department: <strong>{selectedUser?.department || 'Field Outreach'}</strong>
          </div>
        </div>
      </div>

      {/* Active Qualifying Slab Achievement Banner */}
      <div className="crm-card" style={{ padding: '1rem 1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#14532d' }}>
                Achieved Slab Tier: {liveSlabResult.appliedSlabName} ({liveSlabResult.appliedRate}% Rate)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '2px' }}>
                Cumulative eligible sales volume of <strong>{formatCurrency(eligibleSales)}</strong> qualifies for <strong>{liveSlabResult.appliedRate}%</strong> slab commission.
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: 600 }}>Calculated Commission</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#14532d' }}>{formatCurrency(totalCommission)}</div>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Sales Volume</div>
            <div className="crm-stat-value">{formatCurrency(totalSales)}</div>
            <div className="crm-stat-subtext">{userOrders.length} orders delivered</div>
          </div>
          <div className="crm-stat-icon-wrap primary">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Eligible Sales</div>
            <div className="crm-stat-value">{formatCurrency(eligibleSales)}</div>
            <div className="crm-stat-subtext">After product exclusions</div>
          </div>
          <div className="crm-stat-icon-wrap info">
            <Award size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Commission Earned</div>
            <div className="crm-stat-value" style={{ color: '#1b4d3e' }}>{formatCurrency(totalCommission)}</div>
            <div className="crm-stat-subtext">{userTransactions.length > 0 ? `${userTransactions.length} commission events` : `${liveSlabResult.appliedRate}% slab tier`}</div>
          </div>
          <div className="crm-stat-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Pending Approval</div>
            <div className="crm-stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(effectivePending)}</div>
            <div className="crm-stat-subtext">Approved: {formatCurrency(approvedCommission)}</div>
          </div>
          <div className="crm-stat-icon-wrap warning">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="crm-card">
        <div className="crm-card-header">
          <h3 className="crm-card-title">
            <Award size={18} style={{ color: '#1b4d3e' }} /> Commission Transactions for {selectedUser?.name}
          </h3>
        </div>
        <div className="crm-card-body" style={{ padding: 0 }}>
          {userTransactions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No commission transactions recorded for this member in the selected period.
            </div>
          ) : (
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Order Ref</th>
                    <th>Sale Amount</th>
                    <th>Eligible Amount</th>
                    <th>Applicable Slab & Rate</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td><strong>{tx.transactionId}</strong></td>
                      <td>{tx.orderRef}</td>
                      <td>{formatCurrency(tx.saleAmount)}</td>
                      <td>{formatCurrency(tx.eligibleAmount)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.slabRate}%</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.slabApplied}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#1b4d3e', fontSize: '0.95rem' }}>
                          {formatCurrency(tx.commissionAmount)}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(tx.status)}`}>{tx.status}</span>
                      </td>
                      <td>{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
