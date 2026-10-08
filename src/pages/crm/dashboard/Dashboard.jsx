import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Target, ShoppingBag, CreditCard, Award, 
  Clock, LifeBuoy, TrendingUp, UserPlus, PhoneCall, 
  MessageSquare, CheckCircle2, ArrowUpRight, Plus, ExternalLink,
  RefreshCw, Globe, PackageCheck, AlertCircle, Eye, Phone
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import { SalesBarChart, LeadSourceDonut, ConversionFunnel } from '../../../components/crm/Charts';
import Customer360Modal from '../../../components/crm/Customer360Modal';
import CrmModal from '../../../components/crm/CrmModal';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [commissionTx, setCommissionTx] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  // Quick Action Modal states
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    customerName: '',
    mobile: '',
    email: '',
    source: 'Website',
    interestedProduct: 'Antox D & Antox T (Diabetes Support Kit)',
    priority: 'High',
    notes: ''
  });

  const handleRefreshLiveOrders = async () => {
    setIsSyncing(true);
    setSyncNotice('');
    try {
      const refreshedOrders = await dbService.refreshFromFirebase('orders');
      if (Array.isArray(refreshedOrders) && refreshedOrders.length > 0) {
        setOrders(refreshedOrders);
      }
      await dbService.refreshFromFirebase('customers');
      await dbService.refreshFromFirebase('leads');
      setSyncNotice('✓ All orders and customer records live-synced from Cloud Firestore!');
      setTimeout(() => setSyncNotice(''), 4500);
    } catch (e) {
      setSyncNotice('Sync note: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubLeads = dbService.subscribe('leads', setLeads);
    const unsubOrders = dbService.subscribe('orders', setOrders);
    const unsubFlw = dbService.subscribe('followups', setFollowups);
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);
    const unsubTkt = dbService.subscribe('supportTickets', setTickets);

    // Initial fresh pull from Cloud Firestore
    dbService.refreshFromFirebase('orders').then((res) => {
      if (Array.isArray(res) && res.length > 0) setOrders(res);
    }).catch(() => {});

    // Uninterrupted mobile device sync heartbeat (every 15 seconds)
    const mobileSyncTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        dbService.refreshFromFirebase('orders').then((res) => {
          if (Array.isArray(res) && res.length > 0) setOrders(res);
        }).catch(() => {});
      }
    }, 15000);

    return () => {
      clearInterval(mobileSyncTimer);
      unsubCust();
      unsubLeads();
      unsubOrders();
      unsubFlw();
      unsubTx();
      unsubTkt();
    };
  }, []);

  // Compute metrics
  const totalCustomers = customers.length;
  const newCustomersThisMonth = customers.filter((c) => {
    const d = new Date(c.createdDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalLeads = leads.length;
  const newLeadsToday = leads.filter((l) => {
    const d = new Date(l.createdDate);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const totalOrders = orders.length;
  const monthlySales = orders
    .filter((o) => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
    .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const pendingPayments = orders
    .filter((o) => o.paymentStatus === 'Pending' || o.paymentStatus === 'Partially Paid')
    .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const totalCommission = commissionTx
    .filter((tx) => tx.status === 'Approved' || tx.status === 'Paid')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  const pendingCommission = commissionTx
    .filter((tx) => tx.status === 'Pending Approval')
    .reduce((sum, tx) => sum + (Number(tx.commissionAmount) || 0), 0);

  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const pendingFollowups = followups.filter((f) => f.status === 'Pending');

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.customerName || !newLeadForm.mobile) return;

    await dbService.add('leads', {
      leadId: `LEAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newLeadForm.customerName,
      mobile: newLeadForm.mobile,
      email: newLeadForm.email,
      source: newLeadForm.source,
      interestedProduct: newLeadForm.interestedProduct,
      assignedEmployee: 'usr_emp_akash',
      leadStatus: 'New',
      priority: newLeadForm.priority,
      notes: newLeadForm.notes,
      createdDate: new Date().toISOString(),
      nextFollowup: new Date().toISOString()
    });

    setShowAddLead(false);
    setNewLeadForm({
      customerName: '',
      mobile: '',
      email: '',
      source: 'Website',
      interestedProduct: 'Antox D & Antox T (Diabetes Support Kit)',
      priority: 'High',
      notes: ''
    });
  };

  const handleMarkFollowupDone = async (fId) => {
    await dbService.update('followups', fId, { status: 'Completed' });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <TrendingUp size={24} style={{ color: '#1b4d3e' }} /> Executive Overview
          </h1>
          <div className="crm-page-subtitle">
            Sahara Social Foundation • Samarth Kolhapur Real-time Operations & Sales
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddLead(true)}>
            <Plus size={16} /> New Lead
          </button>
          <a href="/crm/leads" className="crm-btn crm-btn-secondary">
            View All Leads <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Customers</div>
            <div className="crm-stat-value">{totalCustomers}</div>
            <div className="crm-stat-subtext">+{newCustomersThisMonth} this month</div>
          </div>
          <div className="crm-stat-icon-wrap primary">
            <Users size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Leads</div>
            <div className="crm-stat-value">{totalLeads}</div>
            <div className="crm-stat-subtext">{newLeadsToday} new today</div>
          </div>
          <div className="crm-stat-icon-wrap accent">
            <Target size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Monthly Sales</div>
            <div className="crm-stat-value">{formatCurrency(monthlySales)}</div>
            <div className="crm-stat-subtext">
              {totalOrders} total ({orders.filter(o => String(o.source || '').toLowerCase().includes('website') || String(o.id || o.orderId || '').startsWith('ORD-') || String(o.id || o.orderId || '').startsWith('SSF-')).length} from website)
            </div>
          </div>
          <div className="crm-stat-icon-wrap success">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Pending Payments</div>
            <div className="crm-stat-value">{formatCurrency(pendingPayments)}</div>
            <div className="crm-stat-subtext">Awaiting clearance</div>
          </div>
          <div className="crm-stat-icon-wrap warning">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Total Commission</div>
            <div className="crm-stat-value">{formatCurrency(totalCommission)}</div>
            <div className="crm-stat-subtext">₹{pendingCommission.toLocaleString('en-IN')} pending approval</div>
          </div>
          <div className="crm-stat-icon-wrap primary">
            <Award size={24} />
          </div>
        </div>

        <div className="crm-stat-card">
          <div>
            <div className="crm-stat-label">Open Support Tickets</div>
            <div className="crm-stat-value">{openTickets}</div>
            <div className="crm-stat-subtext">{pendingFollowups.length} follow-ups due</div>
          </div>
          <div className="crm-stat-icon-wrap info">
            <LifeBuoy size={24} />
          </div>
        </div>
      </div>

      {/* Analytics & Charts Row */}
      <div className="crm-dashboard-grid-2col">
        {/* Sales Trend Bar Chart */}
        <div className="crm-card" style={{ margin: 0 }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <TrendingUp size={18} style={{ color: '#1b4d3e' }} /> Monthly Revenue & Sales Growth
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>FY 2026-27</span>
          </div>
          <div className="crm-card-body">
            <SalesBarChart />
          </div>
        </div>

        {/* Lead Sources & Conversion Funnel */}
        <div className="crm-card" style={{ margin: 0 }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <Target size={18} style={{ color: '#c69214' }} /> Lead Source Distribution
            </h3>
          </div>
          <div className="crm-card-body">
            <LeadSourceDonut />
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Sales Conversion Funnel
              </div>
              <ConversionFunnel />
            </div>
          </div>
        </div>
      </div>

      {/* Live Website & CRM Orders Feed */}
      <div className="crm-card" style={{ marginBottom: '1.5rem', borderTop: '3px solid #006B2D' }}>
        <div className="crm-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 className="crm-card-title" style={{ color: '#006B2D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} style={{ color: '#006B2D' }} /> Live Website & CRM Orders
            </h3>
            <span style={{ 
              backgroundColor: '#e6f4ea', 
              color: '#006B2D', 
              fontSize: '0.76rem', 
              fontWeight: 700, 
              padding: '0.2rem 0.55rem', 
              borderRadius: '999px',
              border: '1px solid #b7e1cd'
            }}>
              {orders.length} Total ({orders.filter((o) => o.source === 'Website Checkout' || (o.paymentMethod && o.paymentMethod.includes('Razorpay')) || (o.orderId && o.orderId.startsWith('ORD-'))).length} from Website)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {syncNotice && (
              <span style={{ fontSize: '0.78rem', color: '#006B2D', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
                {syncNotice}
              </span>
            )}
            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-sm"
              onClick={handleRefreshLiveOrders}
              disabled={isSyncing}
              title="Sync live orders from Firebase Cloud Firestore"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={13} className={isSyncing ? 'spin-anim' : ''} />
              <span>{isSyncing ? 'Syncing Cloud...' : 'Live Sync'}</span>
            </button>
            <Link to="/crm/orders" className="crm-btn crm-btn-primary crm-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Order Management</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="crm-card-body" style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <ShoppingBag size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#334155' }}>No Orders Recorded Yet</div>
              <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0.4rem auto 0', color: '#64748b' }}>
                When customers purchase from the website checkout, their order data automatically syncs to Firebase Cloud and appears here in real-time across all mobile and desktop devices.
              </p>
            </div>
          ) : (
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Order & Channel</th>
                    <th>Customer Details</th>
                    <th>Ordered Products</th>
                    <th>Amount & Payment</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Date / Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((order) => {
                    const isWebsite = order.source === 'Website Checkout' || (order.paymentMethod && order.paymentMethod.includes('Razorpay')) || (order.orderId && order.orderId.startsWith('ORD-'));
                    const isPaidFull = order.paymentStatus === 'Paid';
                    const isPartiallyPaid = order.paymentStatus === 'Partially Paid';
                    const cleanPhone = (order.customerMobile || '').replace(/\D/g, '').slice(-10);

                    return (
                      <tr key={order.id || order.orderId} style={{ transition: 'background-color 0.2s' }}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                              #{order.orderId || order.id}
                            </strong>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: isWebsite ? (isPaidFull ? '#006B2D' : '#b45309') : '#475569',
                              backgroundColor: isWebsite ? (isPaidFull ? '#e6f4ea' : '#fef3c7') : '#f1f5f9',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              width: 'fit-content'
                            }}>
                              <Globe size={11} />
                              {isWebsite ? (isPaidFull ? 'Website Online' : 'Website COD') : 'CRM Direct'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                              {order.customerName || 'Customer'}
                            </strong>
                            {cleanPhone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                                <a 
                                  href={`tel:${cleanPhone}`} 
                                  style={{ fontSize: '0.78rem', color: '#006B2D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <Phone size={11} />
                                  {cleanPhone}
                                </a>
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Namaste ${order.customerName || ''} ji, regarding your Sahara Social Foundation Order #${order.orderId}...`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#25D366' }}
                                  title="WhatsApp Customer"
                                >
                                  <MessageSquare size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.82rem', maxWidth: '220px' }}>
                            {Array.isArray(order.products) && order.products.length > 0 ? (
                              order.products.map((p, idx) => (
                                <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  • {p.name || 'Product'} <span style={{ fontWeight: 700, color: '#006B2D' }}>× {p.quantity || 1}</span>
                                </div>
                              ))
                            ) : (
                              <span style={{ color: '#64748b' }}>Nutraceutical Order</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                              {formatCurrency(order.grandTotal || 0)}
                            </strong>
                            {Number(order.advancePaid || 0) > 0 && Number(order.balanceDue || 0) > 0 && (
                              <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 600 }}>
                                ₹{order.advancePaid} Paid • ₹{order.balanceDue} Due
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.paymentStatus || 'Pending')}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.orderStatus || 'Confirmed')}`}>
                            {order.orderStatus || 'Confirmed'}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {formatDate(order.orderDate || order.createdAt || new Date())}
                          </div>
                        </td>

                        <td>
                          <Link 
                            to="/crm/orders" 
                            className="crm-btn crm-btn-secondary crm-btn-sm"
                            style={{ padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="View order details"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Today's Follow-ups & Recent Customers Row */}
      <div className="crm-dashboard-grid-split">
        {/* Follow-ups List */}
        <div className="crm-card" style={{ margin: 0 }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <Clock size={18} style={{ color: '#1b4d3e' }} /> Today's Scheduled Follow-ups ({pendingFollowups.length})
            </h3>
            <a href="/crm/followups" className="crm-btn crm-btn-secondary crm-btn-sm">View All</a>
          </div>
          <div className="crm-card-body" style={{ padding: 0 }}>
            {pendingFollowups.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No pending follow-ups for today.</div>
            ) : (
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Time & Purpose</th>
                      <th>Counselor</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFollowups.slice(0, 5).map((f) => (
                      <tr key={f.id}>
                        <td>
                          <strong>{f.customerName}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{f.time}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{f.purpose}</div>
                        </td>
                        <td>{f.employeeName}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(f.priority)}`}>{f.priority}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              className="crm-btn crm-btn-sm" 
                              style={{ background: '#25D366', color: '#fff', padding: '0.3rem 0.5rem' }}
                              onClick={() => {
                                window.open(`https://wa.me/?text=${encodeURIComponent(`Namaste ${f.customerName} ji, from Sahara Social Foundation...`)}`, '_blank');
                              }}
                              title="WhatsApp"
                            >
                              <MessageSquare size={13} />
                            </button>
                            <button 
                              className="crm-btn crm-btn-primary crm-btn-sm"
                              style={{ padding: '0.3rem 0.6rem' }}
                              onClick={() => handleMarkFollowupDone(f.id)}
                              title="Mark Complete"
                            >
                              <CheckCircle2 size={13} />
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

        {/* Recent Customers */}
        <div className="crm-card" style={{ margin: 0 }}>
          <div className="crm-card-header">
            <h3 className="crm-card-title">
              <Users size={18} style={{ color: '#1b4d3e' }} /> Active Customers
            </h3>
            <a href="/crm/customers" className="crm-btn crm-btn-secondary crm-btn-sm">All Customers</a>
          </div>
          <div className="crm-card-body" style={{ padding: 0 }}>
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.fullName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.customerId}</div>
                      </td>
                      <td>{c.city}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(c.customerStatus)}`}>
                          {c.customerStatus}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="crm-btn crm-btn-secondary crm-btn-sm"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          360° Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <Customer360Modal
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onRefresh={() => setSelectedCustomer(dbService.getById('customers', selectedCustomer.id))}
        />
      )}

      {/* Quick Add Lead Modal */}
      <CrmModal
        isOpen={showAddLead}
        onClose={() => setShowAddLead(false)}
        title="Add New Sales Lead"
      >
        <form onSubmit={handleCreateLead}>
          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Full Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={newLeadForm.customerName}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, customerName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Mobile Number *</label>
              <input
                type="tel"
                className="crm-input"
                required
                value={newLeadForm.mobile}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, mobile: e.target.value })}
              />
            </div>
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Lead Source</label>
              <select
                className="crm-form-select"
                value={newLeadForm.source}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
              >
                <option value="Website">Website Form</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
                <option value="Affiliate">Affiliate Partner</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Interested Product / Campaign</label>
              <select
                className="crm-form-select"
                value={newLeadForm.interestedProduct}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, interestedProduct: e.target.value })}
              >
                <option value="Antox D & Antox T (Diabetes Support Kit)">Antox D & Antox T (Diabetes Support Kit)</option>
                <option value="Antox HLK (Heart, Liver, Kidney Formula)">Antox HLK (Heart, Liver, Kidney Formula)</option>
                <option value="Antox X & Antox T (Addiction Recovery Kit)">Antox X & Antox T (Addiction Recovery Kit)</option>
                <option value="Antox PN Powder & PN Oil (Joint & Bone Care)">Antox PN Powder & PN Oil (Joint & Bone Care)</option>
                <option value="Samarth Panchakarm Detox Elixir">Samarth Panchakarm Detox Elixir</option>
                <option value="Pitta Shamak & Acidity Relief Churna">Pitta Shamak & Acidity Relief Churna</option>
                <option value="Rasayan Vitality Gold Capsule">Rasayan Vitality Gold Capsule</option>
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Counseling Notes / Patient Condition</label>
            <textarea
              className="crm-textarea"
              rows="3"
              placeholder="e.g. Fasting sugar 190, interested in 3 month package..."
              value={newLeadForm.notes}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddLead(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Create Lead</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
