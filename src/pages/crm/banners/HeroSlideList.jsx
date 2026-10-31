// Hero Slideshow & Website Banner Management for Sahara Social Foundation CRM
import React, { useState, useEffect } from 'react';
import { 
  Sliders, Plus, Edit, Trash2, CheckCircle2, XCircle, 
  RotateCcw, Eye, ArrowUp, ArrowDown, Image as ImageIcon, 
  Upload, Sparkles, RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  Monitor, Smartphone
} from 'lucide-react';
import { dbService } from '../../../services/db';
import { initialHeroSlides } from '../../../services/seedData';
import { compressImage } from '../../../utils/imageCompressor';
import CrmModal from '../../../components/crm/CrmModal';

export default function HeroSlideList() {
  const [slides, setSlides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [cardPreviewModes, setCardPreviewModes] = useState({}); // { [slideId]: 'desktop' | 'mobile' }
  const [isRestoring, setIsRestoring] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    image: '',
    mobileImage: '',
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
      const list = Array.isArray(items) ? items : [];
      const sorted = [...list].sort((a, b) => (Number(a.displayOrder) || 99) - (Number(b.displayOrder) || 99));
      setSlides(sorted);
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
      mobileImage: '',
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
      mobileImage: slide.mobileImage || '',
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

  // Handle local file upload and automatically compress for Cloud Firestore sync
  const handleFileUpload = async (e, fieldName = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isMobile = fieldName === 'mobileImage';
      const compressed = await compressImage(
        file, 
        isMobile ? 1000 : 1400, 
        isMobile ? 800 : 800, 
        0.80
      );
      setFormData((prev) => ({
        ...prev,
        [fieldName]: compressed
      }));
    } catch (err) {
      alert('Error processing image: ' + err.message);
    }
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
        <div className="crm-card" style={{ marginBottom: '2rem', padding: '1.25rem', background: '#04200e', color: '#ffffff', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Eye size={20} style={{ color: '#FFC928' }} />
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Live Slideshow Preview ({activeSlides.length} Active Slides)</strong>
            </div>

            {/* Desktop / Mobile Preview Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#0a3018', padding: '0.2rem', borderRadius: '8px', border: '1px solid #166534' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: previewDevice === 'desktop' ? '#15803d' : 'transparent',
                    color: previewDevice === 'desktop' ? '#ffffff' : '#86efac'
                  }}
                >
                  <Monitor size={14} /> Desktop (16:9)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: previewDevice === 'mobile' ? '#15803d' : 'transparent',
                    color: previewDevice === 'mobile' ? '#ffffff' : '#86efac'
                  }}
                >
                  <Smartphone size={14} /> Mobile Phone View
                </button>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#86efac' }}>
                Slide {previewSlideIdx + 1} of {activeSlides.length}
              </div>
            </div>
          </div>

          {/* Carousel Frame */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              borderRadius: previewDevice === 'mobile' ? '22px' : '14px',
              border: previewDevice === 'mobile' ? '4px solid #334155' : '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              backgroundColor: '#000000',
              width: previewDevice === 'mobile' ? '320px' : '100%',
              maxWidth: '100%',
              aspectRatio: '16 / 9',
              boxShadow: previewDevice === 'mobile' ? '0 10px 25px rgba(0,0,0,0.5)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {activeSlides[previewSlideIdx] && (() => {
                const curSlide = activeSlides[previewSlideIdx];
                const isMobileMode = previewDevice === 'mobile';
                const imgSrc = (isMobileMode && curSlide.mobileImage) ? curSlide.mobileImage : curSlide.image;

                return (
                  <>
                    <img 
                      src={imgSrc} 
                      alt={curSlide.titleEn || 'Slide'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        if (curSlide.fallback) {
                          e.target.src = curSlide.fallback;
                        }
                      }}
                    />

                    {/* Preview overlay banner indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: 'rgba(4, 32, 14, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFC928',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      {isMobileMode ? (
                        <>
                          <Smartphone size={12} />
                          {curSlide.mobileImage ? 'Mobile Custom Image' : 'Desktop Fitted to Mobile'}
                        </>
                      ) : (
                        <>
                          <Monitor size={12} /> Desktop 16:9 View
                        </>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Prev/Next buttons */}
              <button
                type="button"
                onClick={() => setPreviewSlideIdx((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
                style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(4, 32, 14, 0.75)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => setPreviewSlideIdx((prev) => (prev + 1) % activeSlides.length)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(4, 32, 14, 0.75)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slides Management Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {slides.map((slide, index) => {
          const isActive = slide.status === 'active';
          const cardMode = cardPreviewModes[slide.id] || 'desktop';
          const displayImg = (cardMode === 'mobile' && slide.mobileImage) ? slide.mobileImage : slide.image;

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

                {/* Device View Toggle Tabs above thumbnail */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      type="button"
                      onClick={() => setCardPreviewModes(prev => ({ ...prev, [slide.id]: 'desktop' }))}
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: cardMode === 'desktop' ? '#1b4d3e' : '#f8fafc',
                        color: cardMode === 'desktop' ? '#ffffff' : '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      🖥️ Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardPreviewModes(prev => ({ ...prev, [slide.id]: 'mobile' }))}
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: cardMode === 'mobile' ? '#1b4d3e' : '#f8fafc',
                        color: cardMode === 'mobile' ? '#ffffff' : '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      📱 Mobile
                    </button>
                  </div>

                  {slide.mobileImage ? (
                    <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 700, backgroundColor: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      ✓ Mobile Image
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Auto Desktop Fit
                    </span>
                  )}
                </div>

                {/* Photo Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#04200e',
                  marginBottom: '0.85rem'
                }}>
                  <img
                    src={displayImg}
                    alt={slide.titleEn || 'Hero slide'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      if (slide.fallback) e.target.src = slide.fallback;
                    }}
                  />
                  {cardMode === 'mobile' && !slide.mobileImage && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0.4rem',
                      left: '0.4rem',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      Showing Desktop fitted to mobile
                    </div>
                  )}
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
                  <span>Change Photos / Edit</span>
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
          isOpen={showModal}
          title={editingSlide ? 'Change Slide Photos & Details' : 'Add New Home Banner Slide'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Desktop Photo Section */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label className="crm-form-label" style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Monitor size={16} style={{ color: '#1b4d3e' }} />
                  🖥️ Desktop Slide Image (16:9 Landscape - Required) *
                </label>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.6rem 0' }}>
                  Primary slide image displayed across desktops, laptops, and tablets.
                </p>

                {/* Upload Button */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <label 
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Upload size={15} />
                    <span>Upload Desktop Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>or enter image URL / path:</span>
                </div>

                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. /slide-custom.jpg or https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                />

                {/* Desktop Thumbnail Preview */}
                {formData.image && (
                  <div style={{
                    marginTop: '0.6rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#04200e',
                    textAlign: 'center',
                    aspectRatio: '16 / 9',
                    maxHeight: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #cbd5e1'
                  }}>
                    <img
                      src={formData.image}
                      alt="Desktop Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/hero-slide-1.jpg';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Photo Section */}
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <label className="crm-form-label" style={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Smartphone size={16} style={{ color: '#166534' }} />
                  📱 Mobile Slide Image (Optional / Tailored for Phones)
                </label>
                <p style={{ fontSize: '0.76rem', color: '#166534', margin: '0 0 0.6rem 0' }}>
                  Custom mobile-optimized graphic (phones $\le 768px$). If left blank, your Desktop image is automatically fitted seamlessly for mobile screens.
                </p>

                {/* Upload Button */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <label 
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff' }}
                  >
                    <Upload size={15} />
                    <span>Upload Mobile Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'mobileImage')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {formData.mobileImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mobileImage: '' })}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.74rem',
                        color: '#ef4444',
                        background: 'transparent',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove Custom Mobile Photo
                    </button>
                  )}
                  <span style={{ fontSize: '0.76rem', color: '#166534' }}>or enter URL / path:</span>
                </div>

                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="Leave blank to use desktop image, or enter mobile image path/URL"
                  value={formData.mobileImage}
                  onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                />

                {/* Mobile Thumbnail Preview */}
                {formData.mobileImage && (
                  <div style={{
                    marginTop: '0.6rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#04200e',
                    textAlign: 'center',
                    aspectRatio: '16 / 9',
                    maxHeight: '140px',
                    maxWidth: '250px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #86efac'
                  }}>
                    <img
                      src={formData.mobileImage}
                      alt="Mobile Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                )}
              </div>

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
