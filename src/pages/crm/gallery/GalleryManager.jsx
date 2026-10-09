// Photo Gallery Management for Sahara Social Foundation CRM
import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Plus, Edit, Trash2, CheckCircle2, 
  RotateCcw, Eye, Upload, Sparkles, RefreshCw, ZoomIn, 
  Filter, Tag, Camera
} from 'lucide-react';
import { dbService } from '../../../services/db';
import { initialGalleryPhotos } from '../../../services/seedData';
import CrmModal from '../../../components/crm/CrmModal';

export default function GalleryManager() {
  const [photos, setPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    image: '',
    fallback: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    category: 'Camps',
    titleMr: '',
    titleEn: ''
  });

  const CATEGORIES = [
    { id: 'All', name: 'All Categories' },
    { id: 'Camps', name: 'Health Camps (आरोग्य शिबिरे)' },
    { id: 'Counseling', name: 'Patient Guidance (समुपदेशन कक्ष)' },
    { id: 'Campaigns', name: 'Campaigns & Banners (अभियान व पोस्टर्स)' },
    { id: 'Ayurveda', name: 'Ayurveda & Pathya (आयुर्वेद व पथ्य)' },
    { id: 'Community', name: 'Community Drives (सामाजिक उपक्रम)' }
  ];

  // Subscribe to reactive database updates
  useEffect(() => {
    // Proactively pull latest photos from Cloud Firestore
    dbService.refreshFromFirebase('galleryPhotos').catch(() => {});

    const unsub = dbService.subscribe('galleryPhotos', (items) => {
      if (!items || items.length === 0) {
        dbService.setCollection('galleryPhotos', initialGalleryPhotos);
        setPhotos(initialGalleryPhotos);
      } else {
        setPhotos(items);
      }
    });
    return unsub;
  }, []);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleOpenAdd = () => {
    setEditingPhoto(null);
    setFormData({
      image: '',
      fallback: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      category: 'Camps',
      titleMr: '',
      titleEn: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      image: photo.image || '',
      fallback: photo.fallback || '',
      category: photo.category || 'Camps',
      titleMr: photo.titleMr || '',
      titleEn: photo.titleEn || ''
    });
    setShowModal(true);
  };

  // Convert local file upload to Base64 data URL
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Photo size exceeds 3MB. Please choose an optimized photo or enter an image URL.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      alert('Please upload a photo or enter an image URL.');
      return;
    }

    try {
      if (editingPhoto) {
        await dbService.update('galleryPhotos', editingPhoto.id, {
          ...formData
        });
        showNotification('✓ Photo updated successfully!');
      } else {
        const newId = `gal-${Date.now()}`;
        await dbService.add('galleryPhotos', {
          id: newId,
          ...formData
        });
        showNotification('✓ New photo added to public gallery!');
      }
      setShowModal(false);
    } catch (err) {
      alert('Error saving photo: ' + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete this photo "${title || id}"?`)) {
      try {
        await dbService.delete('galleryPhotos', id);
        showNotification('Photo deleted.');
      } catch (err) {
        alert('Error deleting photo: ' + err.message);
      }
    }
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('Reset gallery to official 24 foundation photos?')) {
      setIsRestoring(true);
      try {
        await dbService.setCollection('galleryPhotos', initialGalleryPhotos);
        showNotification('Official 24 photos restored!');
      } catch (err) {
        alert('Error restoring: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  return (
    <div>
      {/* Page Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Camera size={24} style={{ color: '#1b4d3e' }} />
            Official Photo Gallery Manager
          </h1>
          <div className="crm-page-subtitle">
            Upload, update, organize, and manage field activity and health camp photos displayed on the public Photo Gallery.
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            type="button" 
            className="crm-btn crm-btn-secondary"
            onClick={handleRestoreDefaults}
            disabled={isRestoring}
            title="Restore original 24 photos"
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
            <span>Add New Photo</span>
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

      {/* Category Filter Chips */}
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
          <span>Filter:</span>
        </div>

        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                backgroundColor: isActive ? '#1b4d3e' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#334155',
                border: 'none',
                borderRadius: '20px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.name}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredPhotos.length} of {photos.length} photos
        </div>
      </div>

      {/* Photos Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id}
            className="crm-card"
            style={{
              padding: '1rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}
          >
            <div>
              {/* Photo Display */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '190px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#04200e',
                marginBottom: '0.85rem'
              }}>
                <img
                  src={photo.image}
                  alt={photo.titleMr || photo.titleEn || 'Gallery photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    if (photo.fallback) e.target.src = photo.fallback;
                  }}
                />

                {/* Category badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.6rem',
                  left: '0.6rem',
                  backgroundColor: '#006B2D',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  {photo.category}
                </div>
              </div>

              {/* Title in Marathi */}
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                {photo.titleMr || photo.titleEn || 'Untitled Photo'}
              </div>

              {/* Title in English */}
              {photo.titleEn && photo.titleEn !== photo.titleMr && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.35, marginBottom: '0.65rem' }}>
                  {photo.titleEn}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={() => handleOpenEdit(photo)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
              >
                <Edit size={14} />
                <span>Change Photo / Edit</span>
              </button>

              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={() => handleDelete(photo.id, photo.titleMr || photo.titleEn)}
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                title="Delete photo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <CrmModal
          title={editingPhoto ? 'Change Photo & Details' : 'Add New Photo to Gallery'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Photo Input & Device Uploader */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Photo / Image *
                </label>

                {/* File Upload Button */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label 
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Upload size={15} />
                    <span>Upload Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or enter image link below:</span>
                </div>

                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. https://... or uploaded image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                />
              </div>

              {/* Photo Live Preview Box */}
              {formData.image && (
                <div style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  backgroundColor: '#04200e',
                  textAlign: 'center',
                  maxHeight: '190px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800';
                    }}
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Category (वर्ग) *
                </label>
                <select
                  className="crm-form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Camps">Health Camps (आरोग्य शिबिरे)</option>
                  <option value="Counseling">Patient Guidance (समुपदेशन कक्ष)</option>
                  <option value="Campaigns">Campaigns & Banners (अभियान व पोस्टर्स)</option>
                  <option value="Ayurveda">Ayurveda & Pathya (आयुर्वेद व पथ्य)</option>
                  <option value="Community">Community Drives (सामाजिक उपक्रम)</option>
                </select>
              </div>

              {/* Title in Marathi */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  शीर्षक (Title in Marathi) *
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="उदा. मोफत आरोग्य तपासणी व मधुमेह मार्गदर्शन शिबीर"
                  value={formData.titleMr}
                  onChange={(e) => setFormData({ ...formData, titleMr: e.target.value })}
                  required
                />
              </div>

              {/* Title in English */}
              <div>
                <label className="crm-form-label">
                  Title (English)
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. Free Health Checkup & Blood Sugar Camp"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>

              {/* Fallback Image */}
              <div>
                <label className="crm-form-label">
                  Fallback Image URL (Optional)
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="https://..."
                  value={formData.fallback}
                  onChange={(e) => setFormData({ ...formData, fallback: e.target.value })}
                />
              </div>

              {/* Modal Buttons */}
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
                  {editingPhoto ? 'Save Changes' : 'Add Photo'}
                </button>
              </div>

            </div>
          </form>
        </CrmModal>
      )}
    </div>
  );
}
