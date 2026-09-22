// Complete Lead Management Module for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Search, Filter, Phone, MessageSquare, 
  UserPlus, Edit2, Trash2, CheckCircle2, UserCheck, 
  AlertTriangle, Sparkles, User, Calendar
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);

  // Add Form State
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    mobile: '',
    email: '',
    source: 'Website',
    interestedProduct: 'Antox D & Antox T (Diabetes Support Kit)',
    assignedEmployee: '',
    assignedAffiliate: '',
    leadStatus: 'New',
    priority: 'High',
    notes: '',
    estimatedValue: 2800
  });

  // Assign Form State
  const [assigneeData, setAssigneeData] = useState({
    assignedEmployee: '',
    assignedAffiliate: ''
  });

  useEffect(() => {
    const unsubLeads = dbService.subscribe('leads', setLeads);
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubUsers = dbService.subscribe('users', (users) => {
      const activeEmps = users.filter((u) => u.role !== 'affiliate');
      const activeAffs = users.filter((u) => u.role === 'affiliate');
      setEmployees(activeEmps);
      setAffiliates(activeAffs);
      if (activeEmps.length > 0) {
        setFormData((prev) => ({
          ...prev,
          assignedEmployee: prev.assignedEmployee || activeEmps[0].id
        }));
      }
    });

    return () => {
      unsubLeads();
      unsubCust();
      unsubUsers();
    };
  }, []);

  const handleCustomerSelect = (custId) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.fullName,
        mobile: cust.mobileNumber,
        email: cust.email || '',
        source: cust.leadSource || prev.source || 'Website',
        assignedEmployee: cust.assignedEmployee || prev.assignedEmployee || employees[0]?.id || '',
        assignedAffiliate: cust.assignedAffiliate || prev.assignedAffiliate || ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: ''
      }));
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      l.customerName.toLowerCase().includes(q) ||
      l.mobile.includes(q) ||
      l.leadId.toLowerCase().includes(q) ||
      l.interestedProduct.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || l.leadStatus === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  // Create Lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile) return;

    const emp = employees.find((u) => u.id === formData.assignedEmployee);
    const aff = affiliates.find((u) => u.id === formData.assignedAffiliate);

    await dbService.add('leads', {
      leadId: `LEAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      ...formData,
      assignedEmployee: formData.assignedEmployee || employees[0]?.id || '',
      assignedAffiliate: formData.assignedAffiliate || '',
      employeeName: emp ? emp.name : employees[0]?.name || '',
      affiliateName: aff ? aff.name : '',
      createdDate: new Date().toISOString(),
      nextFollowup: new Date().toISOString()
    });

    setShowAddModal(false);
    setFormData({
      customerId: '',
      customerName: '',
      mobile: '',
      email: '',
      source: 'Website',
      interestedProduct: 'Antox D & Antox T (Diabetes Support Kit)',
      assignedEmployee: employees[0]?.id || '',
      assignedAffiliate: '',
      leadStatus: 'New',
      priority: 'High',
      notes: '',
      estimatedValue: 2800
    });
  };

  // Open Assign Modal
  const handleOpenAssign = (lead) => {
    setAssigningLead(lead);
    setAssigneeData({
      assignedEmployee: lead.assignedEmployee || (employees[0]?.id || 'usr_emp_akash'),
      assignedAffiliate: lead.assignedAffiliate || ''
    });
  };

  // Confirm Assign
  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!assigningLead) return;

    const emp = employees.find((u) => u.id === assigneeData.assignedEmployee);
    const aff = affiliates.find((u) => u.id === assigneeData.assignedAffiliate);

    await dbService.update('leads', assigningLead.id, {
      assignedEmployee: assigneeData.assignedEmployee,
      assignedAffiliate: assigneeData.assignedAffiliate,
      employeeName: emp ? emp.name : '',
      affiliateName: aff ? aff.name : ''
    });

    dbService.logAudit({
      userId: 'usr_active',
      userName: 'Admin / Manager',
      action: 'ASSIGN_LEAD',
      module: 'Leads',
      recordId: assigningLead.id,
      description: `Assigned Lead "${assigningLead.customerName}" to Counselor ${emp?.name || 'Staff'}${aff ? ` (Affiliate: ${aff.name})` : ''}`,
      oldValue: assigningLead.assignedEmployee,
      newValue: assigneeData.assignedEmployee
    });

    setAssigningLead(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (lead) => {
    setEditingLead({ ...lead });
  };

  // Confirm Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLead) return;

    await dbService.update('leads', editingLead.id, {
      customerName: editingLead.customerName,
      mobile: editingLead.mobile,
      email: editingLead.email,
      source: editingLead.source,
      interestedProduct: editingLead.interestedProduct,
      priority: editingLead.priority,
      leadStatus: editingLead.leadStatus,
      notes: editingLead.notes,
      assignedEmployee: editingLead.assignedEmployee,
      assignedAffiliate: editingLead.assignedAffiliate
    });

    setEditingLead(null);
  };

  // Open Delete Modal
  const handleOpenDelete = (lead) => {
    setDeletingLead(lead);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    await dbService.delete('leads', deletingLead.id);
    setDeletingLead(null);
  };

  // Convert to Customer
  const handleConvertToCustomer = async (lead) => {
    // Check if customer already exists (by linked customerId or by mobile match)
    let existingCust = null;
    if (lead.customerId) {
      existingCust = customers.find((c) => c.id === lead.customerId);
    }
    if (!existingCust && lead.mobile) {
      existingCust = customers.find((c) => c.mobileNumber === lead.mobile || c.whatsappNumber === lead.mobile);
    }

    let activeCust;
    if (existingCust) {
      // Utilize and update existing customer
      const existingNotes = existingCust.notes ? `${existingCust.notes}\n` : '';
      await dbService.update('customers', existingCust.id, {
        customerStatus: 'Active',
        notes: `${existingNotes}Converted Lead (${lead.leadId}): Interested in ${lead.interestedProduct}. ${lead.notes || ''}`,
        lastContactDate: new Date().toISOString()
      });
      activeCust = existingCust;
    } else {
      // Create new customer record
      activeCust = await dbService.add('customers', {
        customerId: `CUST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        fullName: lead.customerName,
        mobileNumber: lead.mobile,
        whatsappNumber: lead.mobile,
        email: lead.email || '',
        gender: 'Male',
        city: 'Kolhapur',
        state: 'Maharashtra',
        pincode: '416001',
        leadSource: lead.source,
        assignedEmployee: lead.assignedEmployee,
        assignedAffiliate: lead.assignedAffiliate || '',
        customerStatus: 'Active',
        notes: `Converted from Lead ${lead.leadId}. Interested in ${lead.interestedProduct}.\nNotes: ${lead.notes || ''}`,
        createdDate: new Date().toISOString(),
        lastContactDate: new Date().toISOString()
      });
    }

    await dbService.update('leads', lead.id, {
      leadStatus: 'Converted',
      convertedCustomerId: activeCust.id
    });

    dbService.addNotification({
      title: 'Lead Converted!',
      message: `Lead ${lead.customerName} linked to Customer ${activeCust.customerId || activeCust.fullName}.`,
      type: 'lead',
      link: '/crm/customers'
    });
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    await dbService.update('leads', leadId, { leadStatus: newStatus });
  };

  const csvColumns = [
    { header: 'Lead ID', key: 'leadId' },
    { header: 'Name', key: 'customerName' },
    { header: 'Mobile', key: 'mobile' },
    { header: 'Source', key: 'source' },
    { header: 'Product', key: 'interestedProduct' },
    { header: 'Status', key: 'leadStatus' },
    { header: 'Priority', key: 'priority' },
    { header: 'Created', key: 'createdDate' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Target size={24} style={{ color: '#1b4d3e' }} /> Lead Management
          </h1>
          <div className="crm-page-subtitle">
            Track patient inquiries, website consultation requests, and campaign responses ({leads.length} total)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredLeads} columns={csvColumns} filename="Sahara_Leads" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by lead name, phone, product, ID..."
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
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Order Pending">Order Pending</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              className="crm-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Patient / Inquirer</th>
                <th>Contact</th>
                <th>Interested Product</th>
                <th>Source</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Counselor</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const assignedEmp = employees.find((e) => e.id === lead.assignedEmployee);
                  const assignedAff = affiliates.find((a) => a.id === lead.assignedAffiliate);

                  return (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.leadId}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{lead.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Created {formatDate(lead.createdDate)}
                        </div>
                      </td>
                      <td>
                        <div>{formatPhone(lead.mobile)}</div>
                        {lead.email && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lead.email}</div>}
                      </td>
                      <td style={{ maxWidth: '220px' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>{lead.interestedProduct}</div>
                        {lead.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{lead.source}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(lead.priority)}`}>{lead.priority}</span>
                      </td>
                      <td>
                        <select
                          className="crm-select"
                          style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                          value={lead.leadStatus}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Order Pending">Order Pending</option>
                          <option value="Converted">Converted</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                          {assignedEmp ? assignedEmp.name : 'Akash Shinde'}
                        </div>
                        {assignedAff && (
                          <div style={{ fontSize: '0.72rem', color: '#c69214', fontWeight: 500 }}>
                            Ref: {assignedAff.name.split(' ')[0]}
                          </div>
                        )}
                      </td>
                      <td>
                        {/* THE EXACT ACTION PILL BUTTON GROUP: ASSIGN | EDIT | DELETE */}
                        <div className="crm-lead-actions">
                          <button
                            className="btn-pill-assign"
                            onClick={() => handleOpenAssign(lead)}
                            title="Assign to Counselor / Affiliate"
                          >
                            <UserPlus size={14} /> Assign
                          </button>

                          <button
                            className="btn-pill-edit"
                            onClick={() => handleOpenEdit(lead)}
                            title="Edit Lead Information"
                          >
                            <Edit2 size={14} /> Edit
                          </button>

                          <button
                            className="btn-pill-delete"
                            onClick={() => handleOpenDelete(lead)}
                            title="Delete Lead"
                          >
                            <Trash2 size={14} /> Delete
                          </button>

                          {/* Quick Convert Button */}
                          {lead.leadStatus !== 'Converted' ? (
                            <button
                              className="crm-btn crm-btn-secondary crm-btn-sm"
                              style={{ padding: '0.28rem 0.55rem', fontSize: '0.78rem' }}
                              onClick={() => handleConvertToCustomer(lead)}
                              title="Convert into Active Customer Profile"
                            >
                              <UserCheck size={13} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <CheckCircle2 size={13} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN LEAD MODAL */}
      {assigningLead && (
        <CrmModal
          isOpen={!!assigningLead}
          onClose={() => setAssigningLead(null)}
          title={`Assign Lead: ${assigningLead.customerName}`}
        >
          <form onSubmit={handleSaveAssign}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Lead ID: <strong>{assigningLead.leadId}</strong></div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                {assigningLead.customerName} ({formatPhone(assigningLead.mobile)})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1b4d3e', marginTop: '4px' }}>
                Interested in: {assigningLead.interestedProduct}
              </div>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Select Assigned Counselor / Sales Executive *</label>
              <select
                className="crm-form-select"
                required
                value={assigneeData.assignedEmployee}
                onChange={(e) => setAssigneeData({ ...assigneeData, assignedEmployee: e.target.value })}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role.replace('_', ' ').toUpperCase()}) - {emp.department || 'Counseling'}
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Attach Affiliate / Partner (Optional)</label>
              <select
                className="crm-form-select"
                value={assigneeData.assignedAffiliate}
                onChange={(e) => setAssigneeData({ ...assigneeData, assignedAffiliate: e.target.value })}
              >
                <option value="">-- No Affiliate (Direct Inquiry) --</option>
                {affiliates.map((aff) => (
                  <option key={aff.id} value={aff.id}>
                    {aff.name} ({aff.referralCode || 'Affiliate'}) - {aff.city}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setAssigningLead(null)}>Cancel</button>
              <button type="submit" className="crm-btn crm-btn-primary">
                <UserPlus size={15} /> Confirm Assignment
              </button>
            </div>
          </form>
        </CrmModal>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
        <CrmModal
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          title={`Edit Lead: ${editingLead.customerName}`}
          size="lg"
        >
          <form onSubmit={handleSaveEdit}>
            <div className="crm-form-grid">
              <div className="crm-form-group">
                <label className="crm-form-label">Patient / Contact Name *</label>
                <input
                  type="text"
                  className="crm-input"
                  required
                  value={editingLead.customerName}
                  onChange={(e) => setEditingLead({ ...editingLead, customerName: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="crm-input"
                  required
                  value={editingLead.mobile}
                  onChange={(e) => setEditingLead({ ...editingLead, mobile: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Email Address</label>
                <input
                  type="email"
                  className="crm-input"
                  value={editingLead.email || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Inquiry Source</label>
                <select
                  className="crm-form-select"
                  value={editingLead.source}
                  onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
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
                <label className="crm-form-label">Interested Product / Category</label>
                <select
                  className="crm-form-select"
                  value={editingLead.interestedProduct}
                  onChange={(e) => setEditingLead({ ...editingLead, interestedProduct: e.target.value })}
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

              <div className="crm-form-group">
                <label className="crm-form-label">Priority</label>
                <select
                  className="crm-form-select"
                  value={editingLead.priority}
                  onChange={(e) => setEditingLead({ ...editingLead, priority: e.target.value })}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="crm-form-group">
                <label className="crm-form-label">Lead Status</label>
                <select
                  className="crm-form-select"
                  value={editingLead.leadStatus}
                  onChange={(e) => setEditingLead({ ...editingLead, leadStatus: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Order Pending">Order Pending</option>
                  <option value="Converted">Converted</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Counselor Notes / Patient History</label>
              <textarea
                className="crm-textarea"
                rows="3"
                value={editingLead.notes || ''}
                onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setEditingLead(null)}>Cancel</button>
              <button type="submit" className="crm-btn crm-btn-primary">Save Changes</button>
            </div>
          </form>
        </CrmModal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLead && (
        <CrmModal
          isOpen={!!deletingLead}
          onClose={() => setDeletingLead(null)}
          title="Confirm Delete Lead"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#dc2626' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#1e293b' }}>
              Are you sure you want to delete this lead?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              This will permanently delete lead record <strong>{deletingLead.leadId}</strong> for <strong>{deletingLead.customerName}</strong>. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button className="crm-btn crm-btn-secondary" onClick={() => setDeletingLead(null)}>
                Cancel
              </button>
              <button className="crm-btn crm-btn-danger" onClick={handleConfirmDelete}>
                <Trash2 size={15} /> Yes, Delete Lead
              </button>
            </div>
          </div>
        </CrmModal>
      )}

      {/* ADD LEAD MODAL */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead Inquiry"
      >
        <form onSubmit={handleCreateLead}>
          <div className="crm-form-group" style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label className="crm-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1b4d3e', fontWeight: 700 }}>
              <User size={15} /> Select Existing Customer (Optional)
            </label>
            <select
              className="crm-form-select"
              value={formData.customerId || ''}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="">-- Choose Existing Customer or Enter New Inquirer Below --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerId} - {c.mobileNumber} - {c.city})
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Selecting an existing patient automatically fills their contact details, source, and assigned counselor.
            </div>
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Patient / Contact Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Mobile Number *</label>
              <input
                type="tel"
                className="crm-input"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Email Address</label>
              <input
                type="email"
                className="crm-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Inquiry Source</label>
              <select
                className="crm-form-select"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="Website">Website</option>
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
              <label className="crm-form-label">Interested Product / Category</label>
              <select
                className="crm-form-select"
                value={formData.interestedProduct}
                onChange={(e) => setFormData({ ...formData, interestedProduct: e.target.value })}
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

            <div className="crm-form-group">
              <label className="crm-form-label">Priority</label>
              <select
                className="crm-form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Executive / Counselor</label>
              <select
                className="crm-form-select"
                value={formData.assignedEmployee}
                onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
              >
                <option value="">-- Choose Member --</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Affiliate Partner (Optional)</label>
              <select
                className="crm-form-select"
                value={formData.assignedAffiliate}
                onChange={(e) => setFormData({ ...formData, assignedAffiliate: e.target.value })}
              >
                <option value="">-- None --</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.referralCode || 'Affiliate'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Counselor Notes / Inquirer Background</label>
            <textarea
              className="crm-textarea"
              rows="3"
              placeholder="e.g. Inquired about Madhumehmukta Abhiyan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Create Lead</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
