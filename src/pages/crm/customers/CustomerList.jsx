// Customer Management Module for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Phone, MessageSquare, 
  Eye, Edit, Trash2, Calendar, FileSpreadsheet, CheckCircle2,
  User, Target
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import Customer360Modal from '../../../components/crm/Customer360Modal';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExistingCustomerId, setSelectedExistingCustomerId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
    leadSource: 'Website',
    assignedEmployee: 'usr_emp_akash',
    assignedAffiliate: '',
    customerStatus: 'New',
    notes: ''
  });

  useEffect(() => {
    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubLeads = dbService.subscribe('leads', setLeads);
    const unsubUsers = dbService.subscribe('users', (users) => {
      setEmployees(users.filter((u) => u.role === 'sales_employee' || u.role === 'manager'));
      setAffiliates(users.filter((u) => u.role === 'affiliate'));
    });

    return () => {
      unsubCust();
      unsubLeads();
      unsubUsers();
    };
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      c.fullName.toLowerCase().includes(q) ||
      c.mobileNumber.includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || c.customerStatus === statusFilter;
    const matchSource = sourceFilter === 'ALL' || c.leadSource === sourceFilter;

    return matchSearch && matchStatus && matchSource;
  });

  const handleExistingCustomerSelect = (custId) => {
    if (!custId) {
      setSelectedExistingCustomerId(null);
      return;
    }
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setSelectedExistingCustomerId(cust.id);
      setFormData({
        fullName: cust.fullName || '',
        mobileNumber: cust.mobileNumber || '',
        whatsappNumber: cust.whatsappNumber || '',
        email: cust.email || '',
        gender: cust.gender || 'Male',
        dateOfBirth: cust.dateOfBirth || '',
        address: cust.address || '',
        city: cust.city || 'Kolhapur',
        state: cust.state || 'Maharashtra',
        pincode: cust.pincode || '416001',
        leadSource: cust.leadSource || 'Website',
        assignedEmployee: cust.assignedEmployee || 'usr_emp_akash',
        assignedAffiliate: cust.assignedAffiliate || '',
        customerStatus: cust.customerStatus || 'Active',
        notes: cust.notes || ''
      });
    }
  };

  const handleLeadSelect = (leadId) => {
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      // Check if lead is already linked to an existing customer or phone match
      const matchedCust = (lead.customerId && customers.find((c) => c.id === lead.customerId)) ||
        customers.find((c) => c.mobileNumber === lead.mobile);
      
      if (matchedCust) {
        setSelectedExistingCustomerId(matchedCust.id);
      }

      setFormData((prev) => ({
        ...prev,
        fullName: lead.customerName || prev.fullName,
        mobileNumber: lead.mobile || prev.mobileNumber,
        whatsappNumber: lead.mobile || prev.whatsappNumber,
        email: lead.email || prev.email,
        leadSource: lead.source || prev.leadSource,
        assignedEmployee: lead.assignedEmployee || prev.assignedEmployee,
        assignedAffiliate: lead.assignedAffiliate || prev.assignedAffiliate,
        notes: `Lead Inquiry: ${lead.interestedProduct || ''}.\n${lead.notes || ''}`
      }));
    }
  };

  const resetForm = () => {
    setSelectedExistingCustomerId(null);
    setFormData({
      fullName: '',
      mobileNumber: '',
      whatsappNumber: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      address: '',
      city: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416001',
      leadSource: 'Website',
      assignedEmployee: 'usr_emp_akash',
      assignedAffiliate: '',
      customerStatus: 'New',
      notes: ''
    });
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber) return;

    // Check if we are updating an existing customer
    let targetCustomerId = selectedExistingCustomerId;

    // If not selected from dropdown, check if customer already exists by phone number
    if (!targetCustomerId) {
      const matchByPhone = customers.find(
        (c) => c.mobileNumber === formData.mobileNumber || (c.whatsappNumber && c.whatsappNumber === formData.mobileNumber)
      );
      if (matchByPhone) {
        targetCustomerId = matchByPhone.id;
      }
    }

    let savedCustomer;
    if (targetCustomerId) {
      // Update and utilize the same customer (prevent duplicate creation)
      await dbService.update('customers', targetCustomerId, {
        ...formData,
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber,
        lastContactDate: new Date().toISOString()
      });
      savedCustomer = dbService.getById('customers', targetCustomerId) || { id: targetCustomerId, ...formData };
      
      dbService.addNotification({
        title: 'Customer Updated',
        message: `Updated profile details for customer ${formData.fullName}.`,
        type: 'customer',
        link: '/crm/customers'
      });
    } else {
      // Create new customer
      savedCustomer = await dbService.add('customers', {
        customerId: `CUST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        ...formData,
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber,
        createdDate: new Date().toISOString(),
        lastContactDate: new Date().toISOString()
      });
    }

    setShowAddModal(false);
    resetForm();
    setSelectedCustomer(savedCustomer);
  };

  const handleDeleteCustomer = async (customer) => {
    if (window.confirm(`Are you sure you want to permanently delete customer "${customer.fullName}" (${customer.customerId})? This action cannot be undone.`)) {
      await dbService.delete('customers', customer.id);
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
      }
    }
  };

  const csvColumns = [
    { header: 'Customer ID', key: 'customerId' },
    { header: 'Full Name', key: 'fullName' },
    { header: 'Mobile', key: 'mobileNumber' },
    { header: 'Email', key: 'email' },
    { header: 'City', key: 'city' },
    { header: 'State', key: 'state' },
    { header: 'Status', key: 'customerStatus' },
    { header: 'Source', key: 'leadSource' },
    { header: 'Created Date', key: 'createdDate' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Users size={24} style={{ color: '#1b4d3e' }} /> Customer Management
          </h1>
          <div className="crm-page-subtitle">
            Manage customer 360° records, contact history, and wellness plans ({customers.length} total)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredCustomers} columns={csvColumns} filename="Sahara_Customers" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="crm-card">
        {/* Toolbar with Search and Filters */}
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by name, phone, ID, city..."
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
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Repeat Customer">Repeat Customer</option>
              <option value="New">New</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>

            <select
              className="crm-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="ALL">All Sources</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Affiliate">Affiliate Partner</option>
              <option value="Referral">Referral</option>
              <option value="Facebook">Facebook</option>
              <option value="Walk-in">Walk-in</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Source</th>
                <th>Status</th>
                <th>Last Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.customerId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{customer.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.gender || 'Patient'}</div>
                    </td>
                    <td>
                      <div>{formatPhone(customer.mobileNumber)}</div>
                      {customer.email && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.email}</div>
                      )}
                    </td>
                    <td>
                      {customer.city}, {customer.state}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{customer.leadSource}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(customer.customerStatus)}`}>
                        {customer.customerStatus}
                      </span>
                    </td>
                    <td>{formatDate(customer.lastContactDate || customer.createdDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          className="crm-btn crm-btn-secondary crm-btn-sm"
                          onClick={() => setSelectedCustomer(customer)}
                          title="View 360° Profile"
                        >
                          <Eye size={13} /> 360°
                        </button>
                        <button
                          className="crm-btn crm-btn-sm"
                          style={{ background: '#25D366', color: '#fff' }}
                          onClick={() => {
                            const phone = (customer.whatsappNumber || customer.mobileNumber).replace(/\D/g, '');
                            window.open(`https://wa.me/91${phone}`, '_blank');
                          }}
                          title="WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          className="crm-icon-btn"
                          style={{
                            width: '30px',
                            height: '30px',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            backgroundColor: '#fff'
                          }}
                          onClick={() => handleDeleteCustomer(customer)}
                          title="Delete Customer"
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

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <Customer360Modal
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onRefresh={() => setSelectedCustomer(dbService.getById('customers', selectedCustomer.id))}
        />
      )}

      {/* Add / Edit Customer Modal */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={selectedExistingCustomerId ? `Edit / Utilize Existing Customer Profile` : "Add New Customer Profile"}
        size="lg"
      >
        <form onSubmit={handleCreateCustomer}>
          {/* Quick Select Existing Customer or Import from Lead */}
          <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="crm-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1b4d3e', fontWeight: 700 }}>
                  <User size={15} /> Select Existing Customer (Utilize Profile)
                </label>
                <select
                  className="crm-form-select"
                  value={selectedExistingCustomerId || ''}
                  onChange={(e) => handleExistingCustomerSelect(e.target.value)}
                >
                  <option value="">-- Choose Existing Customer (or create new below) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.customerId} - {c.mobileNumber} - {c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="crm-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1b4d3e', fontWeight: 700 }}>
                  <Target size={15} /> Import From Lead Inquiry (Optional)
                </label>
                <select
                  className="crm-form-select"
                  onChange={(e) => handleLeadSelect(e.target.value)}
                  defaultValue=""
                >
                  <option value="">-- Choose Existing Lead / Inquiry --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.customerName} ({l.leadId} - {l.mobile} - {l.interestedProduct || l.source})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedExistingCustomerId ? (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  Currently utilizing existing customer record. Saving will update this customer without creating a new duplicate.
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => {
                      const cust = customers.find(c => c.id === selectedExistingCustomerId);
                      if (cust) {
                        setShowAddModal(false);
                        setSelectedCustomer(cust);
                      }
                    }}
                  >
                    <Eye size={12} /> View 360° Profile
                  </button>
                  <button
                    type="button"
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={resetForm}
                  >
                    Clear / Switch to New
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Select an existing customer to edit and utilize their record, or enter new details below to register a new customer profile.
              </div>
            )}
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Full Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                placeholder="e.g. Ramesh Patil"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Mobile Number *</label>
              <input
                type="tel"
                className="crm-input"
                required
                placeholder="9822012345"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">WhatsApp Number</label>
              <input
                type="tel"
                className="crm-input"
                placeholder="Same as mobile if blank"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Email Address</label>
              <input
                type="email"
                className="crm-input"
                placeholder="patient@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Gender</label>
              <select
                className="crm-form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Date of Birth</label>
              <input
                type="date"
                className="crm-input"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">City *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">State</label>
              <input
                type="text"
                className="crm-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Pincode</label>
              <input
                type="text"
                className="crm-input"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Lead Source</label>
              <select
                className="crm-form-select"
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
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
              <label className="crm-form-label">Assigned Health Counselor</label>
              <select
                className="crm-form-select"
                value={formData.assignedEmployee}
                onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Customer Status</label>
              <select
                className="crm-form-select"
                value={formData.customerStatus}
                onChange={(e) => setFormData({ ...formData, customerStatus: e.target.value })}
              >
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Repeat Customer">Repeat Customer</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Residential / Postal Address</label>
            <input
              type="text"
              className="crm-input"
              placeholder="e.g. Plot 24, Near Bus Stand, Shahu Nagar"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Initial Health Notes / Chief Complaints</label>
            <textarea
              className="crm-textarea"
              rows="3"
              placeholder="e.g. History of Type 2 Diabetes for 5 years, knee joint pain..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="crm-btn crm-btn-secondary" 
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              {selectedExistingCustomerId ? 'Update Customer Profile' : 'Save Customer'}
            </button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
