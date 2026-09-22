// CRM Master Dashboard for Samarth Kolhapur
import React, { useState, useEffect } from 'react';
import { 
  Users, Target, ShoppingBag, CreditCard, Award, 
  Clock, LifeBuoy, TrendingUp, UserPlus, PhoneCall, 
  MessageSquare, CheckCircle2, ArrowUpRight, Plus, ExternalLink 
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

  useEffect(() => {
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubLeads = dbService.subscribe('leads', setLeads);
    const unsubOrders = dbService.subscribe('orders', setOrders);
    const unsubFlw = dbService.subscribe('followups', setFollowups);
    const unsubTx = dbService.subscribe('commissionTransactions', setCommissionTx);
    const unsubTkt = dbService.subscribe('supportTickets', setTickets);

    return () => {
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
            <div className="crm-stat-subtext">{totalOrders} total orders</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
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

      {/* Today's Follow-ups & Recent Customers Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
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
