// Complete Customer 360° Profile Modal for Samarth Kolhapur CRM
import React, { useState } from 'react';
import { 
  X, Phone, MessageSquare, Calendar, ShoppingBag, PlusCircle, 
  Clock, Shield, User, FileText, CheckCircle2, AlertCircle, 
  CreditCard, Award, HelpCircle, Send, Trash2 
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone, getStatusBadgeClass } from '../../utils/formatters';
import { dbService } from '../../services/db';

export default function Customer360Modal({ customer, isOpen, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newFollowupDate, setNewFollowupDate] = useState('');
  const [newFollowupPurpose, setNewFollowupPurpose] = useState('');
  const [showAddFollowup, setShowAddFollowup] = useState(false);

  if (!isOpen || !customer) return null;

  // Query related records
  const orders = dbService.getAll('orders').filter((o) => o.customerId === customer.id);
  const followups = dbService.getAll('followups').filter((f) => f.customerId === customer.id);
  const supportTickets = dbService.getAll('supportTickets').filter((t) => t.customerId === customer.id);
  const auditLogs = dbService.getAll('auditLogs').filter((l) => l.recordId === customer.id || l.description?.includes(customer.fullName));
  const commissionTx = dbService.getAll('commissionTransactions').filter((tx) => 
    orders.some((o) => o.id === tx.orderId)
  );

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const totalPaid = orders.filter((o) => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const handleWhatsApp = () => {
    const phone = (customer.whatsappNumber || customer.mobileNumber || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = encodeURIComponent(`Namaste ${customer.fullName} ji, greetings from Sahara Social Foundation / Samarth Kolhapur! How can we assist with your health and wellness journey today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${customer.mobileNumber}`, '_self');
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    const updatedNotes = customer.notes ? `${customer.notes}\n[${new Date().toLocaleDateString('en-IN')}] ${newNote}` : newNote;
    await dbService.update('customers', customer.id, {
      notes: updatedNotes,
      lastContactDate: new Date().toISOString()
    });
    setNewNote('');
    if (onRefresh) onRefresh();
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    if (!newFollowupPurpose) return;

    await dbService.add('followups', {
      customerId: customer.id,
      customerName: customer.fullName,
      employeeId: customer.assignedEmployee || 'usr_emp_akash',
      employeeName: 'Assigned Counselor',
      date: newFollowupDate || new Date().toISOString().slice(0, 10),
      time: '11:00 AM',
      purpose: newFollowupPurpose,
      priority: 'Medium',
      notes: 'Scheduled from Customer 360 profile',
      status: 'Pending'
    });

    await dbService.update('customers', customer.id, {
      nextFollowupDate: newFollowupDate || new Date().toISOString().slice(0, 10),
      lastContactDate: new Date().toISOString()
    });

    setNewFollowupPurpose('');
    setNewFollowupDate('');
    setShowAddFollowup(false);
    if (onRefresh) onRefresh();
  };

  const handleDeleteCustomer = async () => {
    if (window.confirm(`Are you sure you want to permanently delete customer "${customer.fullName}" (${customer.customerId})? All customer records will be removed.`)) {
      await dbService.delete('customers', customer.id);
      onClose();
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div 
        className="crm-modal crm-modal-lg" 
        style={{ maxWidth: '1050px', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Quick Actions */}
        <div className="crm-modal-header" style={{ background: '#f8fafc' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' }}>
                {customer.fullName}
              </h2>
              <span className={`badge ${getStatusBadgeClass(customer.customerStatus)}`}>
                {customer.customerStatus || 'Active'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {customer.customerId}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              {customer.city}, {customer.state} • Mobile: {formatPhone(customer.mobileNumber)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button className="crm-btn crm-btn-sm" style={{ background: '#25D366', color: '#fff' }} onClick={handleWhatsApp}>
              <MessageSquare size={14} /> WhatsApp
            </button>
            <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={handleCall}>
              <Phone size={14} /> Call
            </button>
            <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={() => setShowAddFollowup(true)}>
              <Calendar size={14} /> + Follow-up
            </button>
            <button 
              className="crm-btn crm-btn-danger crm-btn-sm" 
              onClick={handleDeleteCustomer}
              style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
              title="Delete Customer Profile"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button className="crm-icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ padding: '0 1.75rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="crm-tabs" style={{ margin: 0, border: 'none' }}>
            <button className={`crm-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <User size={15} /> Overview
            </button>
            <button className={`crm-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <ShoppingBag size={15} /> Orders ({orders.length})
            </button>
            <button className={`crm-tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
              <CreditCard size={15} /> Payments ({formatCurrency(totalPaid)})
            </button>
            <button className={`crm-tab-btn ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')}>
              <Clock size={15} /> Follow-ups ({followups.length})
            </button>
            <button className={`crm-tab-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
              <HelpCircle size={15} /> Support ({supportTickets.length})
            </button>
            <button className={`crm-tab-btn ${activeTab === 'commission' ? 'active' : ''}`} onClick={() => setActiveTab('commission')}>
              <Award size={15} /> Commission ({commissionTx.length})
            </button>
            <button className={`crm-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
              <FileText size={15} /> Activity Timeline
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="crm-modal-body">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TOTAL SPENT</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1b4d3e', marginTop: '4px' }}>
                    {formatCurrency(totalSpent)}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TOTAL ORDERS</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>
                    {orders.length}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>NEXT FOLLOW-UP</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#c69214', marginTop: '6px' }}>
                    {formatDate(customer.nextFollowupDate) || 'Not Scheduled'}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LEAD SOURCE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>
                    {customer.leadSource || 'Website'}
                  </div>
                </div>
              </div>

              {/* Detailed Customer Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                    Personal & Contact Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Full Name</span>
                      <strong>{customer.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mobile / Call</span>
                      <strong>{formatPhone(customer.mobileNumber)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>WhatsApp</span>
                      <strong>{formatPhone(customer.whatsappNumber || customer.mobileNumber)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Email Address</span>
                      <strong>{customer.email || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Gender & DOB</span>
                      <strong>{customer.gender || 'N/A'} ({formatDate(customer.dateOfBirth)})</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Registration Date</span>
                      <strong>{formatDate(customer.createdDate, true)}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Address & Location</span>
                      <strong>{customer.address}, {customer.city}, {customer.state} - {customer.pincode}</strong>
                    </div>
                  </div>
                </div>

                {/* Consultation Notes & Quick Note Box */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                    Health Notes & Consultation History
                  </h4>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', whiteSpace: 'pre-wrap', maxHeight: '140px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                    {customer.notes || 'No notes added yet.'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="crm-input"
                      placeholder="Add quick follow-up note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                    />
                    <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={handleSaveNote}>
                      <Send size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No orders found for this customer.</div>
              ) : (
                <div className="crm-table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Products</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                        <th>Order Status</th>
                        <th>Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td><strong>{o.orderId}</strong></td>
                          <td>
                            {o.products?.map((p, idx) => (
                              <div key={idx} style={{ fontSize: '0.82rem' }}>
                                • {p.name} × {p.quantity}
                              </div>
                            ))}
                          </td>
                          <td><strong>{formatCurrency(o.grandTotal)}</strong></td>
                          <td><span className={`badge ${getStatusBadgeClass(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
                          <td><span className={`badge ${getStatusBadgeClass(o.orderStatus)}`}>{o.orderStatus}</span></td>
                          <td>{formatDate(o.orderDate, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div>
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Total Amount</th>
                      <th>Paid Amount</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.orderId}</strong></td>
                        <td>{formatCurrency(o.grandTotal)}</td>
                        <td><strong>{o.paymentStatus === 'Paid' ? formatCurrency(o.grandTotal) : '₹0'}</strong></td>
                        <td>{o.paymentMethod || 'Online / Cash'}</td>
                        <td><span className={`badge ${getStatusBadgeClass(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
                        <td>{formatDate(o.orderDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FOLLOW-UPS TAB */}
          {activeTab === 'followups' && (
            <div>
              {followups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No follow-ups recorded.</div>
              ) : (
                <div className="crm-table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Purpose</th>
                        <th>Counselor</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followups.map((f) => (
                        <tr key={f.id}>
                          <td><strong>{formatDate(f.date)}</strong> at {f.time}</td>
                          <td>{f.purpose}</td>
                          <td>{f.employeeName}</td>
                          <td><span className={`badge ${getStatusBadgeClass(f.priority)}`}>{f.priority}</span></td>
                          <td><span className={`badge ${getStatusBadgeClass(f.status)}`}>{f.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUPPORT TICKETS TAB */}
          {activeTab === 'support' && (
            <div>
              {supportTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No support tickets created.</div>
              ) : (
                <div className="crm-table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Category</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.map((t) => (
                        <tr key={t.id}>
                          <td><strong>{t.ticketId}</strong></td>
                          <td>{t.category}</td>
                          <td style={{ maxWidth: '300px' }}>{t.issue}</td>
                          <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                          <td>{formatDate(t.createdDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* COMMISSION TAB */}
          {activeTab === 'commission' && (
            <div>
              {commissionTx.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No commission records generated for this customer orders.</div>
              ) : (
                <div className="crm-table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Order</th>
                        <th>Beneficiary</th>
                        <th>Eligible Amount</th>
                        <th>Rate</th>
                        <th>Commission</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionTx.map((tx) => (
                        <tr key={tx.id}>
                          <td><strong>{tx.transactionId}</strong></td>
                          <td>{tx.orderRef}</td>
                          <td>{tx.beneficiaryName} ({tx.beneficiaryType})</td>
                          <td>{formatCurrency(tx.eligibleAmount)}</td>
                          <td>{tx.slabRate}%</td>
                          <td><strong>{formatCurrency(tx.commissionAmount)}</strong></td>
                          <td><span className={`badge ${getStatusBadgeClass(tx.status)}`}>{tx.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ACTIVITY TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="crm-timeline" style={{ padding: '1rem 1rem 1rem 2rem' }}>
              <div className="crm-timeline-item">
                <div className="crm-timeline-dot" />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                  Customer Profile Created & Registered
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formatDate(customer.createdDate, true)} • Source: {customer.leadSource}
                </div>
              </div>
              {orders.map((o) => (
                <div key={o.id} className="crm-timeline-item">
                  <div className="crm-timeline-dot" />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    Order Placed: {o.orderId} ({formatCurrency(o.grandTotal)})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatDate(o.orderDate, true)} • Status: {o.orderStatus} • Payment: {o.paymentStatus}
                  </div>
                </div>
              ))}
              {followups.map((f) => (
                <div key={f.id} className="crm-timeline-item">
                  <div className="crm-timeline-dot" />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    Follow-up: {f.purpose}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatDate(f.date)} at {f.time} • Status: {f.status} • Counselor: {f.employeeName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Followup Inline Modal */}
        {showAddFollowup && (
          <div style={{ background: '#f8fafc', padding: '1.25rem 1.75rem', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Schedule Next Follow-up</h4>
            <form onSubmit={handleCreateFollowup} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="crm-input"
                style={{ width: '160px' }}
                value={newFollowupDate}
                onChange={(e) => setNewFollowupDate(e.target.value)}
                required
              />
              <input
                type="text"
                className="crm-input"
                placeholder="Purpose (e.g., Blood Sugar Check / Dosage Refill)"
                style={{ flex: 1, minWidth: '220px' }}
                value={newFollowupPurpose}
                onChange={(e) => setNewFollowupPurpose(e.target.value)}
                required
              />
              <button type="submit" className="crm-btn crm-btn-primary crm-btn-sm">Schedule</button>
              <button type="button" className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setShowAddFollowup(false)}>Cancel</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
