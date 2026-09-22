// Payments and Receivables Ledger for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import ExportButton from '../../../components/crm/ExportButton';

export default function PaymentList() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  useEffect(() => {
    const unsub = dbService.subscribe('orders', setOrders);
    return unsub;
  }, []);

  const totalCollected = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const pendingCollection = orders
    .filter((o) => o.paymentStatus === 'Pending' || o.paymentStatus === 'Partially Paid')
    .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q);

    const matchStatus = paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;
    return matchSearch && matchStatus;
  });

  const handleMarkAsPaid = async (orderId) => {
    await dbService.update('orders', orderId, {
      paymentStatus: 'Paid'
    });
  };

  const csvColumns = [
    { header: 'Order ID', key: 'orderId' },
    { header: 'Customer', key: 'customerName' },
    { header: 'Grand Total (₹)', key: 'grandTotal' },
    { header: 'Payment Method', key: 'paymentMethod' },
    { header: 'Payment Status', key: 'paymentStatus' },
    { header: 'Date', key: 'orderDate' }
  ];

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <CreditCard size={24} style={{ color: '#1b4d3e' }} /> Payments & Invoices Ledger
          </h1>
          <div className="crm-page-subtitle">
            Track order collections, UPI transfers, bank deposits, and pending balances
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredOrders} columns={csvColumns} filename="Sahara_Payments" />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Realized Revenue</div>
            <div className="crm-stat-value" style={{ color: '#10b981' }}>{formatCurrency(totalCollected)}</div>
            <div className="crm-stat-subtext">Paid & cleared</div>
          </div>
          <div className="crm-stat-icon-wrap success">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Pending Collection</div>
            <div className="crm-stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(pendingCollection)}</div>
            <div className="crm-stat-subtext">Awaiting clearance</div>
          </div>
          <div className="crm-stat-icon-wrap warning">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-toolbar-filters">
            <select
              className="crm-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Invoice Amount</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.orderId}</strong></td>
                  <td>{order.customerName}</td>
                  <td><strong style={{ color: '#1b4d3e' }}>{formatCurrency(order.grandTotal)}</strong></td>
                  <td>{order.paymentMethod || 'UPI / Cash'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    {order.paymentStatus !== 'Paid' ? (
                      <button
                        className="crm-btn crm-btn-primary crm-btn-sm"
                        onClick={() => handleMarkAsPaid(order.id)}
                      >
                        <CheckCircle2 size={13} /> Mark Paid
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        ✓ Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
