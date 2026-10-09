// Review Moderation and Management for Sahara Social Foundation CRM
// Allows admin to approve, reject, delete, or add customer reviews before they appear publicly
import React, { useState, useEffect } from 'react';
import { 
  Star, CheckCircle2, XCircle, Trash2, Clock, 
  RotateCcw, Plus, Filter, MessageSquareQuote, Check, X, Eye
} from 'lucide-react';
import { dbService } from '../../../services/db';
import { initialReviews } from '../../../services/seedData';
import CrmModal from '../../../components/crm/CrmModal';

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [showModal, setShowModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    date: '',
    review: '',
    status: 'approved'
  });

  // Subscribe to live database updates
  useEffect(() => {
    dbService.refreshFromFirebase('reviews').catch(() => {});

    const unsub = dbService.subscribe('reviews', (items) => {
      if (!items || items.length === 0) {
        dbService.setCollection('reviews', initialReviews);
        setReviews(initialReviews);
      } else {
        setReviews(items);
      }
    });
    return unsub;
  }, []);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  // Counts for tabs
  const pendingCount = reviews.filter((r) => r.status === 'pending' || r.isApproved === false).length;
  const approvedCount = reviews.filter((r) => r.status === 'approved' || r.isApproved === true || (!r.status && r.isApproved !== false)).length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  // Actions
  const handleApprove = async (review) => {
    try {
      await dbService.update('reviews', review.id, {
        status: 'approved',
        isApproved: true,
        approvedAt: new Date().toISOString()
      });
      showNotification(`✓ Review by "${review.name}" has been approved and published to the website!`);
    } catch (err) {
      alert('Error approving review: ' + err.message);
    }
  };

  const handleReject = async (review) => {
    try {
      await dbService.update('reviews', review.id, {
        status: 'rejected',
        isApproved: false,
        rejectedAt: new Date().toISOString()
      });
      showNotification(`Review by "${review.name}" has been rejected.`);
    } catch (err) {
      alert('Error rejecting review: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the review from "${name}"?`)) {
      try {
        await dbService.delete('reviews', id);
        showNotification('Review deleted.');
      } catch (err) {
        alert('Error deleting review: ' + err.message);
      }
    }
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('Reset reviews to official 16 verified patient reviews?')) {
      setIsRestoring(true);
      try {
        await dbService.setCollection('reviews', initialReviews);
        showNotification('Official default reviews restored!');
      } catch (err) {
        alert('Error restoring: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const handleOpenAdd = () => {
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const formattedDate = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    setFormData({
      name: '',
      rating: 5,
      date: formattedDate,
      review: '',
      status: 'approved'
    });
    setShowModal(true);
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.review.trim()) {
      alert('Please fill out both the reviewer name and review content.');
      return;
    }

    try {
      const newReview = {
        id: `rev-${Date.now()}`,
        name: formData.name.trim(),
        rating: Number(formData.rating) || 5,
        date: formData.date || 'Recent',
        review: formData.review.trim(),
        status: formData.status,
        isApproved: formData.status === 'approved',
        createdAt: new Date().toISOString()
      };

      await dbService.add('reviews', newReview);
      showNotification('✓ New patient review added successfully!');
      setShowModal(false);
    } catch (err) {
      alert('Error saving review: ' + err.message);
    }
  };

  // Filter list
  const filteredReviews = reviews.filter((r) => {
    const isApproved = r.status === 'approved' || r.isApproved === true || (!r.status && r.isApproved !== false);
    const isPending = r.status === 'pending' || (r.isApproved === false && r.status !== 'rejected');
    const isRejected = r.status === 'rejected';

    if (filterStatus === 'pending') return isPending;
    if (filterStatus === 'approved') return isApproved;
    if (filterStatus === 'rejected') return isRejected;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <MessageSquareQuote size={24} style={{ color: '#1b4d3e' }} />
            Customer Reviews Moderation
          </h1>
          <div className="crm-page-subtitle">
            Review, approve, or reject customer feedback before it is published on the official website.
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            type="button" 
            className="crm-btn crm-btn-secondary"
            onClick={handleRestoreDefaults}
            disabled={isRestoring}
            title="Reset to 16 default verified patient reviews"
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>

          <button 
            type="button" 
            className="crm-btn crm-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add Verified Review</span>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{
          backgroundColor: '#e2faea',
          border: '1.5px solid #15803d',
          color: '#15803d',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
        backgroundColor: '#ffffff',
        padding: '0.85rem 1.15rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.5rem' }}>
          <Filter size={15} />
          <span>Status:</span>
        </div>

        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          style={{
            backgroundColor: filterStatus === 'all' ? '#1b4d3e' : '#f1f5f9',
            color: filterStatus === 'all' ? '#ffffff' : '#334155',
            border: 'none',
            borderRadius: '20px',
            padding: '0.35rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          All ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          style={{
            backgroundColor: filterStatus === 'pending' ? '#d97706' : (pendingCount > 0 ? '#fef3c7' : '#f1f5f9'),
            color: filterStatus === 'pending' ? '#ffffff' : (pendingCount > 0 ? '#92400e' : '#334155'),
            border: pendingCount > 0 && filterStatus !== 'pending' ? '1px solid #f59e0b' : 'none',
            borderRadius: '20px',
            padding: '0.35rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Clock size={13} />
          <span>Pending Approval ({pendingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('approved')}
          style={{
            backgroundColor: filterStatus === 'approved' ? '#15803d' : '#f1f5f9',
            color: filterStatus === 'approved' ? '#ffffff' : '#334155',
            border: 'none',
            borderRadius: '20px',
            padding: '0.35rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Approved Live ({approvedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('rejected')}
          style={{
            backgroundColor: filterStatus === 'rejected' ? '#dc2626' : '#f1f5f9',
            color: filterStatus === 'rejected' ? '#ffffff' : '#334155',
            border: 'none',
            borderRadius: '20px',
            padding: '0.35rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Rejected ({rejectedCount})
        </button>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredReviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReviews.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#64748b',
            border: '1px solid #e2e8f0'
          }}>
            <MessageSquareQuote size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>No reviews found in this view</div>
            <div style={{ fontSize: '0.85rem' }}>Switch tabs or check back when new reviews are submitted.</div>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isApproved = rev.status === 'approved' || rev.isApproved === true || (!rev.status && rev.isApproved !== false);
            const isPending = rev.status === 'pending' || (rev.isApproved === false && rev.status !== 'rejected');
            const isRejected = rev.status === 'rejected';

            return (
              <div
                key={rev.id}
                className="crm-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: isPending ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                  boxShadow: isPending ? '0 4px 18px rgba(245, 158, 11, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Top Row: Stars + Status Badge + Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Stars */}
                    <div style={{ display: 'inline-flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i <= (Number(rev.rating) || 5) ? '#eab308' : 'transparent'}
                          stroke="#eab308"
                        />
                      ))}
                    </div>

                    {/* Status Pill */}
                    {isPending && (
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: '1px solid #fcd34d'
                      }}>
                        <Clock size={12} />
                        Pending Approval
                      </span>
                    )}

                    {isApproved && (
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: '1px solid #86efac'
                      }}>
                        <Check size={12} />
                        Approved & Live
                      </span>
                    )}

                    {isRejected && (
                      <span style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: '1px solid #fca5a5'
                      }}>
                        <X size={12} />
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rev)}
                        className="crm-btn crm-btn-sm"
                        style={{
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                        title="Approve and make visible on website"
                      >
                        <Check size={14} />
                        <span>Approve & Publish</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleReject(rev)}
                        className="crm-btn crm-btn-sm"
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#dc2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                        title="Reject review"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id, rev.name)}
                      className="crm-btn crm-btn-sm"
                      style={{
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fee2e2',
                        padding: '0.35rem 0.55rem',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Permanently Delete Review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Review Text Body */}
                <div style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: '#1f2937',
                  whiteSpace: 'pre-line'
                }}>
                  {rev.review}
                </div>

                {/* Reviewer Details Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.5rem'
                }}>
                  <strong style={{ color: '#0f172a' }}>{rev.name}</strong>
                  {rev.date && <span>• {rev.date}</span>}
                  {rev.productId && rev.productId !== 'general' && (
                    <span style={{ marginLeft: 'auto', backgroundColor: '#f8fafc', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      Product: {rev.productId}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Verified Review Modal */}
      {showModal && (
        <CrmModal
          title="Add Verified Customer Review"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSaveNew}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Customer / Patient Name *
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. Babasaheb Jadhav"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="crm-form-label" style={{ fontWeight: 700 }}>
                    Rating (Stars) *
                  </label>
                  <select
                    className="crm-form-select"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Poor)</option>
                    <option value={1}>1 Star (Terrible)</option>
                  </select>
                </div>

                <div>
                  <label className="crm-form-label">
                    Review Date
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="e.g. October 3, 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Review Text / Feedback *
                </label>
                <textarea
                  rows={4}
                  className="crm-form-input"
                  placeholder="Patient experience and recovery feedback..."
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Moderation Status *
                </label>
                <select
                  className="crm-form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="approved">Approved & Published Immediately</option>
                  <option value="pending">Keep as Pending Approval</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-btn crm-btn-primary"
                >
                  Save Review
                </button>
              </div>
            </div>
          </form>
        </CrmModal>
      )}
    </div>
  );
}
