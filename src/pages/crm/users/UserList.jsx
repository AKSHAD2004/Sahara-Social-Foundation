// User and Role Management for Samarth Kolhapur CRM
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, Plus, Search, Shield, Edit, Trash2, 
  CheckCircle2, Key, AlertTriangle, Upload, Image as ImageIcon, X 
} from 'lucide-react';
import { formatPhone } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import UserAvatar from '../../../components/crm/UserAvatar';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_employee',
    department: 'Sales & Counseling',
    status: 'active',
    avatar: ''
  });

  useEffect(() => {
    const unsub = dbService.subscribe('users', (loadedUsers) => {
      // Clean up any old unsplash dummy placeholders from prior local storage
      const sanitized = loadedUsers.map((u) => {
        if (u.avatar && u.avatar.includes('images.unsplash.com')) {
          return { ...u, avatar: null };
        }
        return u;
      });
      setUsers(sanitized);
    });
    return unsub;
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'sales_employee',
      department: 'Sales & Counseling',
      status: 'active',
      avatar: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'sales_employee',
      department: u.department || 'Sales & Counseling',
      status: u.status || 'active',
      avatar: u.avatar || ''
    });
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please select a valid image file (PNG, JPG, JPEG).'
      });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'Image size should be less than 2MB.'
      });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        avatar: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePromptDelete = (u, e) => {
    if (e) e.stopPropagation();
    setUserToDelete(u);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.role === 'super_admin' && users.filter((u) => u.role === 'super_admin').length <= 1) {
      setStatusMessage({
        type: 'error',
        text: 'Cannot delete the primary Super Admin account.'
      });
      setShowDeleteConfirm(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      return;
    }

    try {
      await dbService.delete('users', userToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `User "${userToDelete.name}" has been successfully removed.`
      });
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      if (showModal) setShowModal(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to delete user: ' + err.message
      });
      setShowDeleteConfirm(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      const userPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department.trim(),
        status: formData.status || 'active',
        avatar: formData.avatar ? formData.avatar.trim() : null
      };

      if (editingUser) {
        await dbService.update('users', editingUser.id, userPayload);
        setStatusMessage({
          type: 'success',
          text: `User details for "${formData.name}" updated successfully.`
        });
      } else {
        await dbService.add('users', userPayload);
        setStatusMessage({
          type: 'success',
          text: `New team member "${formData.name}" added successfully.`
        });
      }
      setShowModal(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to save user: ' + err.message
      });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <UserCheck size={24} style={{ color: '#1b4d3e' }} /> Users & Role-Based Access Control
          </h1>
          <div className="crm-page-subtitle">
            Manage admin accounts, managers, counselors, promoters, and access permissions
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Team Member
          </button>
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMessage.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: statusMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${statusMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: statusMessage.type === 'error' ? '#b91c1c' : '#166534',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {statusMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>USER NAME</th>
                <th>EMAIL / CONTACT</th>
                <th>ROLE & SCOPE</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th style={{ minWidth: '160px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <UserAvatar
                        name={u.name}
                        avatar={u.avatar}
                        size={38}
                      />
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{u.name}</strong>
                        {u.employeeCode && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.employeeCode}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatPhone(u.phone)}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                      {u.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{u.department || 'Operations'}</td>
                  <td>
                    <span className="badge badge-success">{u.status || 'Active'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Edit Role Button */}
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User & Permissions"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit size={13} /> Edit Role
                      </button>

                      {/* Delete User Button */}
                      <button
                        className="btn-pill-delete"
                        onClick={(e) => handlePromptDelete(u, e)}
                        title="Delete User Account"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.32rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #fca5a5',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add User Modal with Profile Photo Upload */}
      <CrmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Add New Team Member'}
      >
        <form onSubmit={handleSaveUser}>
          {/* Profile Photo Uploader Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem'
          }}>
            <UserAvatar
              name={formData.name || 'User'}
              avatar={formData.avatar}
              size={64}
              fontSize={22}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                Profile Photo
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Upload user photo or leave blank to display initials badge automatically.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary crm-btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Upload size={13} /> Choose Photo
                </button>

                {formData.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #fca5a5',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <X size={13} /> Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Full Name *</label>
            <input
              type="text"
              className="crm-input"
              required
              placeholder="e.g. Rahul Chougule"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Email Address *</label>
              <input
                type="email"
                className="crm-input"
                required
                placeholder="user@samarthkolhapur.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Phone Number</label>
              <input
                type="tel"
                className="crm-input"
                placeholder="e.g. 9822012345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Role *</label>
              <select
                className="crm-form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="super_admin">Super Admin (Full Access)</option>
                <option value="admin">Admin (Sales, Customers, Orders, Commissions)</option>
                <option value="manager">Sales Manager (Approvals, Team, Reports)</option>
                <option value="sales_employee">Sales Counselor (Assigned Leads & Customers)</option>
                <option value="affiliate">Affiliate / Promoter (Referral Portal Only)</option>
                <option value="support_employee">Support Desk (Tickets & Service)</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Department</label>
              <input
                type="text"
                className="crm-input"
                placeholder="e.g. Patient Consultation"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Status</label>
              <select
                className="crm-form-select"
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Or Image URL (Optional)</label>
              <input
                type="url"
                className="crm-input"
                placeholder="https://example.com/photo.jpg"
                value={formData.avatar && !formData.avatar.startsWith('data:') ? formData.avatar : ''}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>
          </div>

          {/* Modal Action Buttons with Delete Option */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div>
              {editingUser && (
                <button
                  type="button"
                  onClick={() => handlePromptDelete(editingUser)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                >
                  <Trash2 size={15} /> Delete User
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="crm-btn crm-btn-primary">
                Save User
              </button>
            </div>
          </div>
        </form>
      </CrmModal>

      {/* Delete Confirmation Modal */}
      <CrmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm User Deletion"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Trash2 size={28} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Delete User Account?
          </h3>

          <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
            Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-danger"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              onClick={handleConfirmDelete}
            >
              Yes, Delete User
            </button>
          </div>
        </div>
      </CrmModal>
    </div>
  );
}
