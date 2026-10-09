// Hero Slideshow & Website Banner Management for Sahara Social Foundation CRM
import React, { useState, useEffect } from 'react';
import { 
  Sliders, Plus, Edit, Trash2, CheckCircle2, XCircle, 
  RotateCcw, Eye, ArrowUp, ArrowDown, Image as ImageIcon, 
  Upload, Sparkles, RefreshCw, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { dbService } from '../../../services/db';
import { initialHeroSlides } from '../../../services/seedData';
import CrmModal from '../../../components/crm/CrmModal';

export default function HeroSlideList() {
  const [slides, setSlides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    image: '',
    fallback: '',
    pillText: '',
    badgeEn: '',
    badgeMr: '',
    titleEn: '',
    titleMr: '',
    displayOrder: 1,
    status: 'active'
  });

  // Subscribe to reactive database updates
  useEffect(() => {
    // Initial fetch from Cloud Firestore
    dbService.refreshFromFirebase('heroSlides').catch(() => {});

    const unsub = dbService.subscribe('heroSlides', (items) => {
      if (!items || items.length === 0) {
        dbService.setCollection('heroSlides', initialHeroSlides);
        setSlides(initialHeroSlides);
      } else {
        const sorted = [...items].sort((a, b) => (Number(a.displayOrder) || 99) - (Number(b.displayOrder) || 99));
        setSlides(sorted);
      }
    });
    return unsub;
  }, []);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      image: '',
      fallback: '/hero-slide-1.jpg',
      pillText: '',
      badgeEn: '',
      badgeMr: '',
      titleEn: '',
      titleMr: '',
      displayOrder: slides.length + 1,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      image: slide.image || '',
      fallback: slide.fallback || '',
      pillText: slide.pillText || '',
      badgeEn: slide.badgeEn || '',
      badgeMr: slide.badgeMr || '',
      titleEn: slide.titleEn || '',
      titleMr: slide.titleMr || '',
      displayOrder: slide.displayOrder || 1,
      status: slide.status || 'active'
    });
    setShowModal(true);
  };

  // Handle local file upload and convert to base64 data URL
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size exceeds 2MB. Please select an optimized image or provide an image URL.');
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
      if (editingSlide) {
        await dbService.update('heroSlides', editingSlide.id, {
          ...formData,
          displayOrder: Number(formData.displayOrder) || 1
        });
        showNotification('✓ Slide photo and details updated successfully!');
      } else {
        const newId = `slide_${Date.now()}`;
        await dbService.add('heroSlides', {
          id: newId,
          ...formData,
          displayOrder: Number(formData.displayOrder) || 1
        });
        showNotification('✓ New slide banner added to home slideshow!');
      }
      setShowModal(false);
    } catch (err) {
      alert('Error saving slide: ' + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove slide "${title || id}" from the home slideshow?`)) {
      try {
        await dbService.delete('heroSlides', id);
        showNotification('Slide removed.');
      } catch (err) {
        alert('Error deleting slide: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (slide) => {
    const nextStatus = slide.status === 'active' ? 'inactive' : 'active';
    await dbService.update('heroSlides', slide.id, { status: nextStatus });
    showNotification(`Slide is now ${nextStatus.toUpperCase()}`);
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const currentSlide = slides[index];
    const targetSlide = slides[targetIndex];

    const currentOrder = currentSlide.displayOrder;
    const targetOrder = targetSlide.displayOrder;

    await dbService.update('heroSlides', currentSlide.id, { displayOrder: targetOrder });
    await dbService.update('heroSlides', targetSlide.id, { displayOrder: currentOrder });
    showNotification('Slide order updated.');
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('Reset slideshow to official default 7 campaign slides?')) {
      setIsRestoring(true);
      try {
        await dbService.setCollection('heroSlides', initialHeroSlides);
        showNotification('Official default slides restored!');
      } catch (err) {
        alert('Error restoring: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const activeSlides = slides.filter((s) => s.status !== 'inactive');

  return (
    <div>
      {/* Page Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Sliders size={24} style={{ color: '#1b4d3e' }} />
            Home Slideshow & Banner Photos
          </h1>
          <div className="crm-page-subtitle">
            Manage, upload, and change the carousel banner photos displayed at the top of the Sahara Social Foundation home page.
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            type="button" 
            className="crm-btn crm-btn-secondary"
            onClick={handleRestoreDefaults}
            disabled={isRestoring}
            title="Restore original default campaign slides"
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
            <span>Add New Slide</span>
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

      {/* Live Carousel Preview Card */}
      {activeSlides.length > 0 && (
        <div className="crm-card" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#04200e', color: '#ffffff', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Eye size={20} style={{ color: '#FFC928' }} />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Live Home Slideshow Preview ({activeSlides.length} Active Slides)</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#86efac' }}>
              Slide {previewSlideIdx + 1} of {activeSlides.length}
            </div>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#0a3018',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {activeSlides[previewSlideIdx] && (
              <>
                <img 
                  src={activeSlides[previewSlideIdx].image} 
                  alt={activeSlides[previewSlideIdx].titleEn || 'Slide'}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    if (activeSlides[previewSlideIdx].fallback) {
                      e.target.src = activeSlides[previewSlideIdx].fallback;
                    }
                  }}
                />
              </>
            )}

            {/* Prev/Next buttons */}
            <button
              type="button"
              onClick={() => setPreviewSlideIdx((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
              style={{
                position: 'absolute',
                left: '1rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={() => setPreviewSlideIdx((prev) => (prev + 1) % activeSlides.length)}
              style={{
                position: 'absolute',
                right: '1rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Slides Management Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {slides.map((slide, index) => {
          const isActive = slide.status === 'active';
          return (
            <div 
              key={slide.id || index}
              className="crm-card"
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: isActive ? '1px solid #cbd5e1' : '1px dashed #94a3b8',
                backgroundColor: isActive ? '#ffffff' : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      backgroundColor: '#1b4d3e',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px'
                    }}>
                      Slide #{slide.displayOrder || index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(slide)}
                      style={{
                        backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
                        color: isActive ? '#15803d' : '#64748b',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isActive ? '✓ Active' : '✕ Inactive'}
                    </button>
                  </div>

                  {/* Ordering arrows */}
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="crm-btn-sm"
                      style={{ padding: '0.25rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="crm-btn-sm"
                      style={{ padding: '0.25rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === slides.length - 1 ? 'not-allowed' : 'pointer' }}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                {/* Photo Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '160px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#04200e',
                  marginBottom: '0.85rem'
                }}>
                  <img
                    src={slide.image}
                    alt={slide.titleEn || 'Hero slide'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      if (slide.fallback) e.target.src = slide.fallback;
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                  {slide.titleMr || slide.titleEn || 'Untitled Slide'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.65rem' }}>
                  {slide.badgeMr || slide.badgeEn || 'Campaign Banner'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary crm-btn-sm"
                  onClick={() => handleOpenEdit(slide)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <Edit size={14} />
                  <span>Change Photo / Edit</span>
                </button>

                <button
                  type="button"
                  className="crm-btn crm-btn-secondary crm-btn-sm"
                  onClick={() => handleDelete(slide.id, slide.titleMr || slide.titleEn)}
                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                  title="Delete slide"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Slide Modal */}
      {showModal && (
        <CrmModal
          title={editingSlide ? 'Change Slide Photo & Details' : 'Add New Home Banner Slide'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Photo Input & File Uploader */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Slide Image / Photo *
                </label>

                {/* Upload Button */}
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
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or enter URL / path below:</span>
                </div>

                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. /slide-custom.jpg or https://images... or uploaded image"
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
                  maxHeight: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/hero-slide-1.jpg';
                    }}
                  />
                </div>
              )}

              {/* Overlay Pill Text */}
              <div>
                <label className="crm-form-label">
                  Product / Badge Overlay Pill Text
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. Antox D + Antox T or Special Camp Offer"
                  value={formData.pillText}
                  onChange={(e) => setFormData({ ...formData, pillText: e.target.value })}
                />
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                  This badge is displayed neatly over the bottom right of the photo.
                </div>
              </div>

              {/* Marathi Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="crm-form-label">
                    शीर्षक (Title in Marathi)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="उदा. व्यसनमुक्त भारत अभियान"
                    value={formData.titleMr}
                    onChange={(e) => setFormData({ ...formData, titleMr: e.target.value })}
                  />
                </div>

                <div>
                  <label className="crm-form-label">
                    मोहीम (Badge in Marathi)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="उदा. कोणत्याही व्यसनापासून मुक्ती"
                    value={formData.badgeMr}
                    onChange={(e) => setFormData({ ...formData, badgeMr: e.target.value })}
                  />
                </div>
              </div>

              {/* English Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="crm-form-label">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="e.g. Addiction-Free Campaign"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  />
                </div>

                <div>
                  <label className="crm-form-label">
                    Badge (English)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="e.g. Herbal Formula for Tobacco"
                    value={formData.badgeEn}
                    onChange={(e) => setFormData({ ...formData, badgeEn: e.target.value })}
                  />
                </div>
              </div>

              {/* Order & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="crm-form-label">
                    Display Order (क्र.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="crm-form-input"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  />
                </div>

                <div>
                  <label className="crm-form-label">
                    Status
                  </label>
                  <select
                    className="crm-form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
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
                  {editingSlide ? 'Save Changes' : 'Add Slide'}
                </button>
              </div>

            </div>
          </form>
        </CrmModal>
      )}
    </div>
  );
}
