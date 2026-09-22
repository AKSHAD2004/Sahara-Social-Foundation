// Support Ticket Helpdesk Module for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, Plus, Search, Filter, MessageSquare, 
  CheckCircle2, Clock, AlertCircle, Edit, Trash2 
} from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function SupportTicketList() {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  const [newTicketForm, setNewTicketForm] = useState({
    customerId: '',
    customerName: '',
    category: 'Product Dosage Enquiry',
    priority: 'Medium',
    issue: '',
    assignedTo: 'usr_emp_akash'
  });

  useEffect(() => {
    const unsubTickets = dbService.subscribe('supportTickets', setTickets);
    const unsubCustomers = dbService.subscribe('customers', setCustomers);
    const unsubUsers = dbService.subscribe('users', (users) => {
      setEmployees(users.filter((u) => u.role === 'sales_employee' || u.role === 'manager'));
    });

    return () => {
      unsubTickets();
      unsubCustomers();
      unsubUsers();
    };
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      t.ticketId.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.customerName || !newTicketForm.issue) return;

    await dbService.add('supportTickets', {
      ticketId: `TCK-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      ...newTicketForm,
      status: 'Open',
      createdDate: new Date().toISOString(),
      closedDate: null
    });

    setShowAddModal(false);
    setNewTicketForm({
      customerId: '',
      customerName: '',
      category: 'Product Dosage Enquiry',
      priority: 'Medium',
      issue: '',
      assignedTo: 'usr_emp_akash'
    });
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    await dbService.update('supportTickets', selectedTicket.id, {
      status: 'Resolved',
      resolution: resolutionText,
      closedDate: new Date().toISOString()
    });
    setSelectedTicket(null);
  };

  const handleDeleteTicket = async (ticket) => {
    if (window.confirm(`Are you sure you want to delete Ticket #${ticket.ticketId || ticket.id} for "${ticket.customerName}"? This will delete it from Firebase as well.`)) {
      await dbService.delete('supportTickets', ticket.id);
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <LifeBuoy size={24} style={{ color: '#1b4d3e' }} /> Patient Support & Helpdesk
          </h1>
          <div className="crm-page-subtitle">
            Manage inquiries regarding dosage, courier tracking, and dietary advice ({tickets.length} tickets)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredTickets} filename="Support_Tickets" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Support Ticket
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by ticket ID, patient name, category..."
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
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Customer">Waiting for Customer</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Patient Name</th>
                <th>Category</th>
                <th>Issue Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.ticketId}</strong></td>
                  <td>{t.customerName}</td>
                  <td><span className="badge badge-neutral">{t.category}</span></td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{t.issue}</div>
                    {t.resolution && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
                        ✓ {t.resolution}
                      </div>
                    )}
                  </td>
                  <td><span className={`badge ${getStatusBadgeClass(t.priority)}`}>{t.priority}</span></td>
                  <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                  <td>{formatDate(t.createdDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => {
                          setSelectedTicket(t);
                          setResolutionText(t.resolution || '');
                        }}
                      >
                        <Edit size={13} /> Manage
                      </button>
                      <button
                        className="crm-icon-btn"
                        style={{
                          width: '28px',
                          height: '28px',
                          color: '#ef4444',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          backgroundColor: '#fff'
                        }}
                        onClick={() => handleDeleteTicket(t)}
                        title="Delete Ticket"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <CrmModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketId} - ${selectedTicket.customerName}`}
        >
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CATEGORY: {selectedTicket.category}</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{selectedTicket.issue}</div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Resolution / Counselor Notes</label>
            <textarea
              className="crm-textarea"
              rows="3"
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="e.g. Advised to take capsule after warm milk before bed..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setSelectedTicket(null)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={handleResolveTicket}>
              <CheckCircle2 size={15} /> Mark Resolved & Save
            </button>
          </div>
        </CrmModal>
      )}

      {/* Create Ticket Modal */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Support Ticket"
      >
        <form onSubmit={handleCreateTicket}>
          <div className="crm-form-group">
            <label className="crm-form-label">Select Patient / Customer</label>
            <select
              className="crm-form-select"
              value={newTicketForm.customerId}
              onChange={(e) => {
                const c = customers.find((cust) => cust.id === e.target.value);
                setNewTicketForm({
                  ...newTicketForm,
                  customerId: e.target.value,
                  customerName: c ? c.fullName : ''
                });
              }}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.customerId})</option>
              ))}
            </select>
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Patient Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={newTicketForm.customerName}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Issue Category</label>
              <select
                className="crm-form-select"
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
              >
                <option value="Product Dosage Enquiry">Product Dosage Enquiry</option>
                <option value="Delivery Tracking">Delivery Tracking</option>
                <option value="Dietary & Lifestyle Advice">Dietary & Lifestyle Advice</option>
                <option value="Payment & Invoicing">Payment & Invoicing</option>
                <option value="De-addiction Counselling">De-addiction Counselling</option>
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Detailed Issue Description *</label>
            <textarea
              className="crm-textarea"
              rows="3"
              required
              placeholder="Describe the query or issue reported by the patient..."
              value={newTicketForm.issue}
              onChange={(e) => setNewTicketForm({ ...newTicketForm, issue: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Create Ticket</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
