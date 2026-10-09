// Video Manager for Sahara Social Foundation CRM
import React, { useState, useEffect } from 'react';
import { 
  Video as VideoIcon, Plus, Edit, Trash2, CheckCircle2, 
  RotateCcw, Play, Upload, Sparkles, Filter, Clock, User, Eye
} from 'lucide-react';
import { dbService } from '../../../services/db';
import { initialVideos } from '../../../services/seedData';
import CrmModal from '../../../components/crm/CrmModal';

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    videoUrl: '',
    thumbnail: '',
    fallbackThumbnail: '',
    speakerMr: '',
    speakerEn: '',
    titleMr: '',
    titleEn: '',
    category: 'Diabetes',
    categoryMr: 'मधुमेह नियंत्रण',
    duration: '02:00',
    summaryMr: '',
    summaryEn: ''
  });

  const CATEGORIES = [
    { id: 'All', name: 'All Videos' },
    { id: 'Diabetes', name: 'Diabetes (मधुमेह)' },
    { id: 'Addiction', name: 'De-Addiction (व्यसनमुक्ती)' },
    { id: 'Bones', name: 'Joint Pain (सांधेदुखी)' },
    { id: 'Acidity', name: 'Acidity & Digestion (पित्त)' },
    { id: 'Ayurveda', name: 'Ayurveda & Guidance (आयुर्वेद)' },
    { id: 'Camps', name: 'Health Camps (शिबिरे)' }
  ];

  // Subscribe to reactive database updates
  useEffect(() => {
    // Proactively pull latest videos from Cloud Firestore
    dbService.refreshFromFirebase('videos').catch(() => {});

    const unsub = dbService.subscribe('videos', (items) => {
      if (!items || items.length === 0) {
        dbService.setCollection('videos', initialVideos);
        setVideos(initialVideos);
      } else {
        setVideos(items);
      }
    });
    return unsub;
  }, []);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormData({
      videoUrl: '',
      thumbnail: 'https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg',
      fallbackThumbnail: 'https://samarthkolhapur.com/wp-content/uploads/2026/04/Antox-D-T.jpeg',
      speakerMr: 'सहारा सोशल फाऊंडेशन लाभार्थी',
      speakerEn: 'Sahara Beneficiary',
      titleMr: '',
      titleEn: '',
      category: 'Diabetes',
      categoryMr: 'मधुमेह नियंत्रण',
      duration: '02:00',
      summaryMr: '',
      summaryEn: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVideo(v);
    setFormData({
      videoUrl: v.videoUrl || '',
      thumbnail: v.thumbnail || '',
      fallbackThumbnail: v.fallbackThumbnail || v.thumbnail || '',
      speakerMr: v.speakerMr || v.patientName || '',
      speakerEn: v.speakerEn || v.patientName || '',
      titleMr: v.titleMr || '',
      titleEn: v.titleEn || '',
      category: v.category || 'Diabetes',
      categoryMr: v.categoryMr || 'मधुमेह नियंत्रण',
      duration: v.duration || '02:00',
      summaryMr: v.summaryMr || '',
      summaryEn: v.summaryEn || ''
    });
    setShowModal(true);
  };

  // Upload local thumbnail image as Base64 data URL
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Thumbnail image size exceeds 2MB. Please select an optimized photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Upload local video file as Base64 data URL (for clips < 2MB)
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Local video file exceeds 2MB (Firestore document size limit). For larger video files, please host the video and enter the direct URL (.mp4).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        videoUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.videoUrl.trim()) {
      alert('Please enter a video URL (.mp4 or streaming video link).');
      return;
    }

    try {
      if (editingVideo) {
        await dbService.update('videos', editingVideo.id, {
          ...formData
        });
        showNotification('✓ Video details updated successfully!');
      } else {
        const newId = `hvid-${Date.now()}`;
        await dbService.add('videos', {
          id: newId,
          ...formData
        });
        showNotification('✓ New patient recovery video added!');
      }
      setShowModal(false);
    } catch (err) {
      alert('Error saving video: ' + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete video "${title || id}"?`)) {
      try {
        await dbService.delete('videos', id);
        showNotification('Video deleted.');
      } catch (err) {
        alert('Error deleting video: ' + err.message);
      }
    }
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('Reset video library to official default videos?')) {
      setIsRestoring(true);
      try {
        await dbService.setCollection('videos', initialVideos);
        showNotification('Official videos restored!');
      } catch (err) {
        alert('Error restoring: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter((v) => v.category === selectedCategory);

  return (
    <div>
      {/* Page Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <VideoIcon size={24} style={{ color: '#1b4d3e' }} />
            Result Videos & Testimonials Manager
          </h1>
          <div className="crm-page-subtitle">
            Upload, update, and manage patient recovery videos and case studies shown on the website and home page.
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            type="button" 
            className="crm-btn crm-btn-secondary"
            onClick={handleRestoreDefaults}
            disabled={isRestoring}
            title="Restore original default videos"
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
            <span>Add New Video</span>
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
          Showing {filteredVideos.length} of {videos.length} videos
        </div>
      </div>

      {/* Video Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredVideos.map((video) => (
          <div 
            key={video.id}
            className="crm-card"
            style={{
              padding: '1.15rem',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}
          >
            <div>
              {/* Video Player */}
              <div style={{
                position: 'relative',
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#04200e',
                marginBottom: '0.85rem',
                aspectRatio: '16/9'
              }}>
                <video
                  src={video.videoUrl}
                  poster={video.thumbnail || video.fallbackThumbnail}
                  controls
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* Top Badge Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '0.6rem',
                  left: '0.6rem',
                  display: 'flex',
                  gap: '0.4rem',
                  pointerEvents: 'none'
                }}>
                  <span style={{
                    backgroundColor: '#006B2D',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px'
                  }}>
                    {video.category}
                  </span>
                  {video.duration && (
                    <span style={{
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.45rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <Clock size={11} />
                      {video.duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Speaker / Patient */}
              {(video.speakerMr || video.speakerEn) && (
                <div style={{ fontSize: '0.8rem', color: '#006B2D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                  <User size={13} />
                  <span>{video.speakerMr || video.speakerEn}</span>
                </div>
              )}

              {/* Title in Marathi */}
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                {video.titleMr || video.titleEn || 'Untitled Video'}
              </div>

              {/* Title in English */}
              {video.titleEn && video.titleEn !== video.titleMr && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.35, marginBottom: '0.5rem' }}>
                  {video.titleEn}
                </div>
              )}

              {/* Summary */}
              {(video.summaryMr || video.summaryEn) && (
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, marginBottom: '0.65rem' }}>
                  {video.summaryMr || video.summaryEn}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={() => handleOpenEdit(video)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
              >
                <Edit size={14} />
                <span>Change Video / Edit</span>
              </button>

              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={() => handleDelete(video.id, video.titleMr || video.titleEn)}
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                title="Delete video"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Video Modal */}
      {showModal && (
        <CrmModal
          title={editingVideo ? 'Change Video & Details' : 'Add New Case Study Video'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Video URL / File */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Video Source (.mp4 URL or file) *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label 
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Upload size={15} />
                    <span>Upload Video from Device</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or enter video link (.mp4) below:</span>
                </div>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="https://samarthkolhapur.com/wp-content/uploads/2026/02/...mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  required
                />
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Enter the direct URL to the video file (e.g. from server or CDN) or upload from device.
                </div>
              </div>

              {/* Thumbnail / Poster */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  Video Poster / Thumbnail Image
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label 
                    className="crm-btn crm-btn-secondary crm-btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Upload size={15} />
                    <span>Upload Poster from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or enter image link below:</span>
                </div>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="https://... poster image link"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </div>

              {/* Live Video Preview Box */}
              {formData.videoUrl && (
                <div style={{
                  backgroundColor: '#04200e',
                  borderRadius: '12px',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid #1b4d3e'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Live Preview:
                  </div>
                  <video
                    src={formData.videoUrl}
                    poster={formData.thumbnail}
                    controls
                    style={{ maxHeight: '180px', width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                </div>
              )}

              {/* Category & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="crm-form-label" style={{ fontWeight: 700 }}>
                    Category (विभाग) *
                  </label>
                  <select
                    className="crm-form-select"
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const catMrMap = {
                        Diabetes: 'मधुमेह नियंत्रण',
                        Addiction: 'व्यसनमुक्त भारत',
                        Bones: 'सांधेदुखी व हाडे',
                        Acidity: 'पित्त व पचन',
                        Ayurveda: 'आयुर्वेद व पथ्य',
                        Camps: 'आरोग्य शिबिरे'
                      };
                      setFormData({ 
                        ...formData, 
                        category: cat,
                        categoryMr: catMrMap[cat] || cat
                      });
                    }}
                  >
                    <option value="Diabetes">Diabetes (मधुमेह)</option>
                    <option value="Addiction">De-Addiction (व्यसनमुक्ती)</option>
                    <option value="Bones">Joint Pain (सांधेदुखी)</option>
                    <option value="Acidity">Acidity & Digestion (पित्त)</option>
                    <option value="Ayurveda">Ayurveda & Guidance (आयुर्वेद)</option>
                    <option value="Camps">Health Camps (शिबिरे)</option>
                  </select>
                </div>

                <div>
                  <label className="crm-form-label">
                    Duration (कालावधी, उदा. 02:09)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="02:09"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              {/* Speaker / Patient Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="crm-form-label">
                    रुग्ण / वक्त्याचे नाव (Marathi)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="उदा. दिनकर नलवडे"
                    value={formData.speakerMr}
                    onChange={(e) => setFormData({ ...formData, speakerMr: e.target.value })}
                  />
                </div>

                <div>
                  <label className="crm-form-label">
                    Speaker / Beneficiary (English)
                  </label>
                  <input
                    type="text"
                    className="crm-form-input"
                    placeholder="e.g. Dinkar Nalvade"
                    value={formData.speakerEn}
                    onChange={(e) => setFormData({ ...formData, speakerEn: e.target.value })}
                  />
                </div>
              </div>

              {/* Title in Marathi */}
              <div>
                <label className="crm-form-label" style={{ fontWeight: 700 }}>
                  व्हिडिओ शीर्षक (Title in Marathi) *
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="उदा. Antox-D आणि Antox-T प्रत्यक्ष रुग्ण निकाल"
                  value={formData.titleMr}
                  onChange={(e) => setFormData({ ...formData, titleMr: e.target.value })}
                  required
                />
              </div>

              {/* Title in English */}
              <div>
                <label className="crm-form-label">
                  Video Title (English)
                </label>
                <input
                  type="text"
                  className="crm-form-input"
                  placeholder="e.g. Antox-D & Antox-T Live Patient Recovery Result"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>

              {/* Summary in Marathi */}
              <div>
                <label className="crm-form-label">
                  थोडक्यात माहिती (Summary in Marathi)
                </label>
                <textarea
                  rows={2}
                  className="crm-form-input"
                  placeholder="रुग्णाचा अनुभव व मिळालेला आरोग्य लाभ..."
                  value={formData.summaryMr}
                  onChange={(e) => setFormData({ ...formData, summaryMr: e.target.value })}
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
                  {editingVideo ? 'Save Changes' : 'Add Video'}
                </button>
              </div>

            </div>
          </form>
        </CrmModal>
      )}
    </div>
  );
}
