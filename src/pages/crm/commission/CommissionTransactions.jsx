// Commission Transactions Ledger and Audit Trail for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Award, Search, Filter, CheckCircle2, XCircle, 
  PauseCircle, CreditCard, RotateCcw 
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import ExportButton from '../../../components/crm/ExportButton';
import CrmModal from '../../../components/crm/CrmModal';

export default function CommissionTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('ALL');

  useEffect(() => {
    const unsub = dbService.subscribe('commissionTransactions', setTransactions);
    return unsub;
  }, []);

  const filteredTx = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      tx.transactionId.toLowerCase().includes(q) ||
      tx.orderRef.toLowerCase().includes(q) ||
      tx.beneficiaryName.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchBeneficiary = beneficiaryFilter === 'ALL' || tx.beneficiaryType === beneficiaryFilter;

    return matchSearch && matchStatus && matchBeneficiary;
  });

  const handleApprove = async (id) => {
    await dbService.update('commissionTransactions', id, {
      status: 'Approved',
      approvedBy: 'Dr. Sharad Patil (Admin)',
      approvedAt: new Date().toISOString()
    });
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (reason) {
      await dbService.update('commissionTransactions', id, {
        status: 'Rejected',
        rejectionReason: reason
      });
    }
  };

  const handleHold = async (id) => {
    await dbService.update('commissionTransactions', id, {
      status: 'On Hold'
    });
  };

  const csvColumns = [
    { header: 'Transaction ID', key: 'transactionId' },
    { header: 'Order Ref', key: 'orderRef' },
    { header: 'Beneficiary', key: 'beneficiaryName' },
    { header: 'Type', key: 'beneficiaryType' },
    { header: 'Sale Value', key: 'saleAmount' },
    { header: 'Eligible Value', key: 'eligibleAmount' },
    { header: 'Rate (%)', key: 'slabRate' },
    { header: 'Commission (₹)', key: 'commissionAmount' },
    { header: 'Status', key: 'status' },
    { header: 'Created Date', key: 'createdAt' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Award size={24} style={{ color: '#1b4d3e' }} /> Commission Transactions Ledger
          </h1>
          <div className="crm-page-subtitle">
            Complete audit trail of calculated, approved, reversed, and paid commissions ({transactions.length} total entries)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredTx} columns={csvColumns} filename="Commission_Transactions" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by Tx ID, Order ID, beneficiary..."
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
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
              <option value="Reversed">Reversed</option>
            </select>

            <select
              className="crm-select"
              value={beneficiaryFilter}
              onChange={(e) => setBeneficiaryFilter(e.target.value)}
            >
              <option value="ALL">All Beneficiaries</option>
              <option value="affiliate">Affiliate Partners</option>
              <option value="employee">Sales Employees</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Order Ref</th>
                <th>Beneficiary Name</th>
                <th>Sale / Eligible</th>
                <th>Slab & Rate</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No commission transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <strong>{tx.transactionId}</strong>
                    </td>
                    <td>{tx.orderRef}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{tx.beneficiaryName}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {tx.beneficiaryType?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(tx.saleAmount)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Eligible: {formatCurrency(tx.eligibleAmount)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.slabRate}%</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.slabApplied}</div>
                    </td>
                    <td>
                      <strong style={{ color: tx.commissionAmount < 0 ? '#ef4444' : '#1b4d3e', fontSize: '0.95rem' }}>
                        {formatCurrency(tx.commissionAmount)}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td>
                      {tx.status === 'Pending Approval' ? (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="crm-btn crm-btn-primary crm-btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            onClick={() => handleApprove(tx.id)}
                            title="Approve"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                          <button
                            className="crm-btn crm-btn-secondary crm-btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            onClick={() => handleHold(tx.id)}
                            title="Hold"
                          >
                            <PauseCircle size={13} />
                          </button>
                          <button
                            className="crm-btn crm-btn-danger crm-btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            onClick={() => handleReject(tx.id)}
                            title="Reject"
                          >
                            <XCircle size={13} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {tx.approvedBy || tx.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
