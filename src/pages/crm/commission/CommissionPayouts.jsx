// Commission Payout Management & Batch Disbursement for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, CheckCircle2, Search, Filter, 
  Printer, Download, ArrowUpRight, Check 
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function CommissionPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [commissionTx, setCommissionTx] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [payoutForm, setPayoutForm] = useState({
    beneficiaryId: '',
    beneficiaryType: 'employee',
    periodMonth: 'September 2026',
    paymentMethod: 'UPI',
    transactionReference: '',
    taxDeduction: 0,
    notes: ''
  });

  useEffect(() => {
    const unsubPayouts = dbService.subscribe('commissionPayouts', setPayouts);
    const unsubUsers = dbService.subscribe('users', setUsers);
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);

    return () => {
      unsubPayouts();
      unsubUsers();
      unsubTx();
    };
  }, []);

  const totalPayoutDisbursed = payouts.reduce((sum, p) => sum + (Number(p.netPayout) || 0), 0);

  // Eligible members with approved commission
  const approvedTx = commissionTx.filter((tx) => tx.status === 'Approved');

  const selectedMemberApprovedTx = approvedTx.filter((tx) => tx.beneficiaryId === payoutForm.beneficiaryId);
  const selectedMemberApprovedTotal = selectedMemberApprovedTx.reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  const handleGeneratePayout = async (e) => {
    e.preventDefault();
    if (!payoutForm.beneficiaryId) return;

    const user = users.find((u) => u.id === payoutForm.beneficiaryId);
    const net = selectedMemberApprovedTotal - Number(payoutForm.taxDeduction || 0);

    const newPayout = await dbService.add('commissionPayouts', {
      payoutId: `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      beneficiaryId: payoutForm.beneficiaryId,
      beneficiaryName: user ? user.name : 'Beneficiary Partner',
      beneficiaryType: user?.role === 'affiliate' ? 'affiliate' : 'employee',
      periodMonth: payoutForm.periodMonth,
      totalSales: selectedMemberApprovedTx.reduce((sum, tx) => sum + Number(tx.saleAmount || 0), 0),
      commissionAmount: selectedMemberApprovedTotal,
      taxDeduction: Number(payoutForm.taxDeduction || 0),
      netPayout: net,
      status: 'Paid',
      paymentMethod: payoutForm.paymentMethod,
      transactionReference: payoutForm.transactionReference || `UPI/TXN/${Date.now()}`,
      paidDate: new Date().toISOString(),
      paidBy: 'Dr. Sharad Patil (Super Admin)',
      notes: payoutForm.notes || `${payoutForm.periodMonth} Commission Payout`
    });

    // Mark these transactions as Paid
    for (const tx of selectedMemberApprovedTx) {
      await dbService.update('commissionTransactions', tx.id, {
        status: 'Paid',
        payoutId: newPayout.id
      });
    }

    setShowGenerateModal(false);
  };

  const csvColumns = [
    { header: 'Payout ID', key: 'payoutId' },
    { header: 'Beneficiary', key: 'beneficiaryName' },
    { header: 'Type', key: 'beneficiaryType' },
    { header: 'Period', key: 'periodMonth' },
    { header: 'Commission (₹)', key: 'commissionAmount' },
    { header: 'Tax (₹)', key: 'taxDeduction' },
    { header: 'Net Paid (₹)', key: 'netPayout' },
    { header: 'Payment Method', key: 'paymentMethod' },
    { header: 'Reference', key: 'transactionReference' },
    { header: 'Date', key: 'paidDate' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <CreditCard size={24} style={{ color: '#1b4d3e' }} /> Commission Payout Management
          </h1>
          <div className="crm-page-subtitle">
            Disburse approved monthly commissions to affiliates and field counselors ({payouts.length} disbursements)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={payouts} columns={csvColumns} filename="Commission_Payouts" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowGenerateModal(true)}>
            <Plus size={16} /> Disburse Approved Payout
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Payouts Disbursed</div>
            <div className="crm-stat-value">{formatCurrency(totalPayoutDisbursed)}</div>
            <div className="crm-stat-subtext">{payouts.length} payout batches processed</div>
          </div>
          <div className="crm-stat-icon-wrap primary">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Approved & Ready to Disburse</div>
            <div className="crm-stat-value" style={{ color: '#10b981' }}>
              {formatCurrency(approvedTx.reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0))}
            </div>
            <div className="crm-stat-subtext">{approvedTx.length} approved transactions</div>
          </div>
          <div className="crm-stat-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Main Payouts Table */}
      <div className="crm-card">
        <div className="crm-card-header">
          <h3 className="crm-card-title">
            <CreditCard size={18} style={{ color: '#1b4d3e' }} /> Payout Disbursement Ledger
          </h3>
        </div>
        <div className="crm-card-body" style={{ padding: 0 }}>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Beneficiary Name</th>
                  <th>Period</th>
                  <th>Gross Commission</th>
                  <th>Tax / TDS</th>
                  <th>Net Paid</th>
                  <th>Method & Ref</th>
                  <th>Disbursed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.payoutId}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.beneficiaryName}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {p.beneficiaryType?.toUpperCase()}
                      </span>
                    </td>
                    <td>{p.periodMonth}</td>
                    <td>{formatCurrency(p.commissionAmount)}</td>
                    <td>{p.taxDeduction ? formatCurrency(p.taxDeduction) : '₹0'}</td>
                    <td>
                      <strong style={{ color: '#1b4d3e', fontSize: '1.05rem' }}>
                        {formatCurrency(p.netPayout)}
                      </strong>
                    </td>
                    <td>
                      <div>{p.paymentMethod}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.transactionReference}</div>
                    </td>
                    <td>{formatDate(p.paidDate)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Payout Modal */}
      <CrmModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Disburse Commission Payout"
        size="lg"
      >
        <form onSubmit={handleGeneratePayout}>
          <div className="crm-form-group">
            <label className="crm-form-label">Select Partner / Employee with Approved Commission *</label>
            <select
              className="crm-form-select"
              required
              value={payoutForm.beneficiaryId}
              onChange={(e) => setPayoutForm({ ...payoutForm, beneficiaryId: e.target.value })}
            >
              <option value="">-- Choose Beneficiary --</option>
              {users.map((u) => {
                const userApproved = approvedTx
                  .filter((tx) => tx.beneficiaryId === u.id)
                  .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ').toUpperCase()}) - Approved: {formatCurrency(userApproved)}
                  </option>
                );
              })}
            </select>
          </div>

          {payoutForm.beneficiaryId && (
            <div style={{ padding: '1.25rem', background: '#e8f4f0', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(27,77,62,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#1b4d3e', fontWeight: 700, textTransform: 'uppercase' }}>
                    Available Approved Commission
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b4d3e' }}>
                    {formatCurrency(selectedMemberApprovedTotal)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  <div>{selectedMemberApprovedTx.length} approved transaction(s)</div>
                </div>
              </div>
            </div>
          )}

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Payout Period / Month *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={payoutForm.periodMonth}
                onChange={(e) => setPayoutForm({ ...payoutForm, periodMonth: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Payment Method</label>
              <select
                className="crm-form-select"
                value={payoutForm.paymentMethod}
                onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI Transfer</option>
                <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                <option value="Bank Transfer (IMPS)">Bank Transfer (IMPS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash Handover</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Bank / UPI Reference No. *</label>
              <input
                type="text"
                className="crm-input"
                required
                placeholder="e.g. UPI/6238129038/SBIN..."
                value={payoutForm.transactionReference}
                onChange={(e) => setPayoutForm({ ...payoutForm, transactionReference: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">TDS / Tax Deduction (₹)</label>
              <input
                type="number"
                className="crm-input"
                value={payoutForm.taxDeduction}
                onChange={(e) => setPayoutForm({ ...payoutForm, taxDeduction: e.target.value })}
              />
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Disbursement Remarks</label>
            <input
              type="text"
              className="crm-input"
              placeholder="e.g. Cleared by Dr. Sharad Patil"
              value={payoutForm.notes}
              onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary" disabled={selectedMemberApprovedTotal <= 0}>
              Confirm & Record Payout
            </button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
