// Follow-up Management Module for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, Phone, MessageSquare, 
  RotateCcw, Plus, Search, Filter, AlertCircle, XCircle, Trash2 
} from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function FollowupList() {
  const [followups, setFollowups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reschedulingFollowup, setReschedulingFollowup] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    employeeId: 'usr_emp_akash',
    employeeName: 'Akash Shinde',
    date: new Date().toISOString().slice(0, 10),
    time: '11:00 AM',
    purpose: '',
    priority: 'Medium',
    notes: '',
    status: 'Pending'
  });

  useEffect(() => {
    const unsubFlw = dbService.subscribe('followups', setFollowups);
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubUsers = dbService.subscribe('users', (users) => {
      setEmployees(users.filter((u) => u.role === 'sales_employee' || u.role === 'manager'));
    });

    return () => {
      unsubFlw();
      unsubCust();
      unsubUsers();
    };
  }, []);

  const filteredFollowups = followups.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      f.customerName.toLowerCase().includes(q) ||
      f.purpose.toLowerCase().includes(q) ||
      f.employeeName.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.purpose) return;

    await dbService.add('followups', {
      ...formData,
      status: 'Pending'
    });

    setShowAddModal(false);
    setFormData({
      customerId: '',
      customerName: '',
      employeeId: 'usr_emp_akash',
      employeeName: 'Akash Shinde',
      date: new Date().toISOString().slice(0, 10),
      time: '11:00 AM',
      purpose: '',
      priority: 'Medium',
      notes: '',
      status: 'Pending'
    });
  };

  const handleStatusChange = async (fId, newStatus) => {
    await dbService.update('followups', fId, { status: newStatus });
  };

  const handleDeleteFollowup = async (followup) => {
    if (window.confirm(`Are you sure you want to delete the scheduled follow-up for "${followup.customerName}"? This will delete it from Firebase as well.`)) {
      await dbService.delete('followups', followup.id);
    }
  };

  const handleReschedule = async () => {
    if (!reschedulingFollowup || !rescheduleDate) return;
    await dbService.update('followups', reschedulingFollowup.id, {
      date: rescheduleDate,
      status: 'Rescheduled'
    });
    setReschedulingFollowup(null);
    setRescheduleDate('');
  };

  const handleCustomerSelect = (custId) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setFormData({
        ...formData,
        customerId: cust.id,
        customerName: cust.fullName,
        employeeId: cust.assignedEmployee || formData.employeeId
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Calendar size={24} style={{ color: '#1b4d3e' }} /> Patient Follow-up Management
          </h1>
          <div className="crm-page-subtitle">
            Schedule and track medical consultations, dosage guidance, and repeat orders ({followups.length} scheduled)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredFollowups} filename="Sahara_Followups" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by patient, counselor, purpose..."
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
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Missed">Missed</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient Name</th>
                <th>Purpose / Consultation Goal</th>
                <th>Assigned Counselor</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowups.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No follow-ups found.
                  </td>
                </tr>
              ) : (
                filteredFollowups.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{formatDate(f.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.time}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#1e293b' }}>{f.customerName}</strong>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{f.purpose}</div>
                      {f.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {f.notes}
                        </div>
                      )}
                    </td>
                    <td>{f.employeeName}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(f.priority)}`}>{f.priority}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(f.status)}`}>{f.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="crm-btn crm-btn-sm"
                          style={{ background: '#25D366', color: '#fff', padding: '0.3rem 0.5rem' }}
                          onClick={() => {
                            window.open(`https://wa.me/?text=${encodeURIComponent(`Namaste ${f.customerName} ji, from Sahara Social Foundation / Samarth Kolhapur...`)}`, '_blank');
                          }}
                          title="WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </button>
                        {f.status === 'Pending' && (
                          <>
                            <button
                              className="crm-btn crm-btn-primary crm-btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              onClick={() => handleStatusChange(f.id, 'Completed')}
                              title="Mark Done"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                            <button
                              className="crm-btn crm-btn-secondary crm-btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              onClick={() => {
                                setReschedulingFollowup(f);
                                setRescheduleDate(f.date);
                              }}
                              title="Reschedule"
                            >
                              <RotateCcw size={13} />
                            </button>
                          </>
                        )}
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
                          onClick={() => handleDeleteFollowup(f)}
                          title="Delete Follow-up"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Follow-up Modal */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule New Patient Follow-up"
      >
        <form onSubmit={handleCreateFollowup}>
          <div className="crm-form-group">
            <label className="crm-form-label">Select Existing Customer OR Enter Name *</label>
            <select
              className="crm-form-select"
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="">-- Choose Existing Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerId} - {c.city})
                </option>
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
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Counselor</label>
              <select
                className="crm-form-select"
                value={formData.employeeId}
                onChange={(e) => {
                  const emp = employees.find((u) => u.id === e.target.value);
                  setFormData({
                    ...formData,
                    employeeId: e.target.value,
                    employeeName: emp ? emp.name : formData.employeeName
                  });
                }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Date *</label>
              <input
                type="date"
                className="crm-input"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Time</label>
              <input
                type="text"
                className="crm-input"
                placeholder="11:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Follow-up Purpose *</label>
            <input
              type="text"
              className="crm-input"
              required
              placeholder="e.g. 15-Day Diabetes Diet Check / Joint Pain Feedback"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Priority</label>
            <select
              className="crm-form-select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Notes & Instructions</label>
            <textarea
              className="crm-textarea"
              rows="2"
              placeholder="e.g. Ask for fasting sugar reading..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Schedule</button>
          </div>
        </form>
      </CrmModal>

      {/* Reschedule Modal */}
      {reschedulingFollowup && (
        <CrmModal
          isOpen={!!reschedulingFollowup}
          onClose={() => setReschedulingFollowup(null)}
          title={`Reschedule Follow-up: ${reschedulingFollowup.customerName}`}
        >
          <div className="crm-form-group">
            <label className="crm-form-label">Select New Follow-up Date</label>
            <input
              type="date"
              className="crm-input"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setReschedulingFollowup(null)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={handleReschedule}>Confirm Reschedule</button>
          </div>
        </CrmModal>
      )}
    </div>
  );
}
