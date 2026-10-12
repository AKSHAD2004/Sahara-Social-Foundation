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
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);

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
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => setSelectedPaymentOrder(order)}
                        title="View Bill / Tax Invoice"
                      >
                        <FileText size={13} /> Bill
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill / Invoice Modal for Payments view */}
      {selectedPaymentOrder && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setSelectedPaymentOrder(null)}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #006B2D', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#006B2D', fontWeight: 800 }}>सहारा सोशल फाऊंडेशन, कोल्हापूर</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Reg. No. MAH/582/2014/KOP • OFFICIAL ORDER BILL</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#006B2D' }}>{selectedPaymentOrder.orderId}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatDate(selectedPaymentOrder.orderDate)}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>CUSTOMER</div>
                <div style={{ fontWeight: 700 }}>{selectedPaymentOrder.customerName}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{selectedPaymentOrder.customerMobile || selectedPaymentOrder.customerPhone || 'N/A'}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{selectedPaymentOrder.shippingAddress}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PAYMENT DETAILS</div>
                <div><strong>Mode:</strong> {selectedPaymentOrder.paymentMethod}</div>
                <div><strong>Status:</strong> <span style={{ color: selectedPaymentOrder.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{selectedPaymentOrder.paymentStatus}</span></div>
                {selectedPaymentOrder.transactionId && <div><strong>Txn ID:</strong> {selectedPaymentOrder.transactionId}</div>}
              </div>
            </div>

            <table className="crm-table" style={{ width: '100%', marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(selectedPaymentOrder.products || selectedPaymentOrder.items || []).map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name || p.nameMr || p.nameEn || 'Nutraceutical Product'}</td>
                    <td>{p.quantity || 1}</td>
                    <td>{formatCurrency(p.price || 0)}</td>
                    <td style={{ textAlign: 'right' }}><strong>{formatCurrency(p.total || ((p.price || 0) * (p.quantity || 1)))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <div style={{ minWidth: '220px', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: '#006B2D' }}>
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedPaymentOrder.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="crm-btn crm-btn-secondary" onClick={() => window.print()}>🖨️ Print Bill</button>
              <button className="crm-btn crm-btn-primary" onClick={() => setSelectedPaymentOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
