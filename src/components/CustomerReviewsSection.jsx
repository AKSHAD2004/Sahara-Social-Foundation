// Customer Reviews Section matching the exact screenshot design
// Supports interactive rating, review submission, rating breakdown, and live Firestore sync
import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { initialReviews } from '../services/seedData';
import { useLanguage } from '../context/LanguageContext';

export default function CustomerReviewsSection({ 
  productId = null,
  onOrderNow = null,
  containerStyle = {}
}) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState(() => {
    try {
      const stored = dbService.getAll('reviews');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    return initialReviews;
  });

  // Interactive Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedReviews, setExpandedReviews] = useState({});

  useEffect(() => {
    // Proactively pull latest reviews from Cloud Firestore
    dbService.refreshFromFirebase('reviews').catch(() => {});

    const unsub = dbService.subscribe('reviews', (items) => {
      if (Array.isArray(items) && items.length > 0) {
        setReviews(items);
      } else {
        setReviews(initialReviews);
      }
    });
    return unsub;
  }, []);

  // Only display reviews that are approved by the admin
  const approvedReviews = reviews.filter((r) => {
    if (r.status === 'approved' || r.isApproved === true) return true;
    if (r.status === 'pending' || r.status === 'rejected' || r.isApproved === false) return false;
    // Fallback for default seed reviews
    return true;
  });

  // Compute Statistics based on Approved Reviews only
  const totalReviews = approvedReviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let ratingSum = 0;

  approvedReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    ratingSum += star;
  });

  const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : '5.0';

  const breakdownRows = [
    { label: 'Excellent', star: 5, count: ratingCounts[5] },
    { label: 'Very good', star: 4, count: ratingCounts[4] },
    { label: 'Average', star: 3, count: ratingCounts[3] },
    { label: 'Poor', star: 2, count: ratingCounts[2] },
    { label: 'Terrible', star: 1, count: ratingCounts[1] }
  ];

  // Handle Order Now Click
  const handleOrderClick = () => {
    if (typeof onOrderNow === 'function') {
      onOrderNow();
    } else {
      // Smooth scroll to buy button if available on product page, otherwise go to shop
      const buyBtn = document.querySelector('.product-actions-row') || document.querySelector('.btn-primary');
      if (buyBtn) {
        buyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        navigate('/shop');
      }
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!rating) {
      alert('Please select your overall rating (1 to 5 stars).');
      return;
    }
    if (!reviewText.trim()) {
      alert('Please enter your review text.');
      return;
    }
    if (!reviewerName.trim()) {
      alert('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const formattedDate = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

      // Submit review with pending status requiring admin approval
      const newReview = {
        id: `rev-${Date.now()}`,
        productId: productId || 'general',
        rating: Number(rating),
        name: reviewerName.trim(),
        date: formattedDate,
        review: reviewText.trim(),
        status: 'pending', // Requires Admin Approval before appearing publicly
        isApproved: false,
        createdAt: now.toISOString()
      };

      await dbService.add('reviews', newReview);

      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setReviewerName('');
      setSuccessMsg(
        language === 'mr'
          ? 'धन्यवाद! आपला अभिप्राय सबमिट झाला आहे. प्रशासकांच्या (Admin) पडताळणीनंतर तो वेबसाइटवर दिसेल.'
          : 'Thank you! Your review has been submitted and will appear on the website once approved by the administrator.'
      );
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      alert('Failed to submit review: ' + (err.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div 
      className="customer-reviews-section"
      style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem 1rem',
        maxWidth: '860px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: '#212529',
        ...containerStyle
      }}
    >
      {/* Top Black Order Now Button (as in user screenshot) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.25rem' }}>
        <button
          type="button"
          onClick={handleOrderClick}
          style={{
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.55rem 1.35rem',
            fontSize: '0.92rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
            transition: 'background-color 0.2s ease, transform 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0a0a0a';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ShoppingCart size={15} />
          <span>Order Now</span>
        </button>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmitReview} style={{ marginBottom: '3rem' }}>
        {/* Your overall rating */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#222222', marginBottom: '0.4rem' }}>
            Your overall rating
          </label>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            {[1, 2, 3, 4, 5].map((starVal) => {
              const active = (hoverRating || rating) >= starVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${starVal} star`}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none'
                  }}
                >
                  <Star
                    size={28}
                    stroke="#eab308"
                    strokeWidth={1.5}
                    fill={active ? '#eab308' : 'transparent'}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Your review */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#222222', marginBottom: '0.4rem' }}>
            Your review
          </label>
          <textarea
            rows={5}
            placeholder="Tell people your review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              fontSize: '0.92rem',
              borderRadius: '5px',
              border: '1px solid #cfd4dc',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0d6efd'; }}
            onBlur={(e) => { e.target.style.borderColor = '#cfd4dc'; }}
          />
        </div>

        {/* Your name */}
        <div style={{ marginBottom: '1.35rem' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#222222', marginBottom: '0.4rem' }}>
            Your name
          </label>
          <input
            type="text"
            placeholder="Tell us your name"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.92rem',
              borderRadius: '5px',
              border: '1px solid #cfd4dc',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0d6efd'; }}
            onBlur={(e) => { e.target.style.borderColor = '#cfd4dc'; }}
          />
        </div>

        {/* Submit Review Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: '#0d6efd',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              padding: '0.55rem 1.45rem',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0b5ed7';
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0d6efd';
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            marginTop: '1rem',
            backgroundColor: '#d1e7dd',
            color: '#0f5132',
            padding: '0.65rem 0.95rem',
            borderRadius: '5px',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid #badbcc'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}
      </form>

      {/* Ratings Summary & Breakdown Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        {/* Large Score + 5 Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
            {averageRating}
          </span>
          <div style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={18}
                fill="#eab308"
                stroke="#eab308"
              />
            ))}
          </div>
        </div>

        {/* Subtitle count */}
        <div style={{ fontSize: '0.86rem', color: '#4b5563', marginBottom: '0.9rem' }}>
          {averageRating} out of 5 stars (based on {totalReviews} reviews)
        </div>

        {/* Rating Breakdown Bars */}
        <div style={{ maxWidth: '380px' }}>
          {breakdownRows.map((row) => {
            const pct = totalReviews > 0 ? Math.round((row.count / totalReviews) * 100) : 0;
            return (
              <div 
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '75px 1fr 40px',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.84rem',
                  color: '#374151',
                  marginBottom: '0.35rem'
                }}
              >
                <span>{row.label}</span>
                <div 
                  style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    height: '13px',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                >
                  <div 
                    style={{
                      backgroundColor: '#eab308',
                      height: '100%',
                      width: `${pct}%`,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <span style={{ textAlign: 'right', color: '#6b7280', fontSize: '0.82rem' }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Reviews List (Approved Only) */}
      <div className="customer-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
        {approvedReviews.map((rev) => {
          const revStar = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
          const isExpanded = !!expandedReviews[rev.id];
          const text = rev.review || '';
          const isLong = text.length > 220;
          const displayText = isLong && !isExpanded 
            ? text.slice(0, 220) + ' ...' 
            : text;

          return (
            <div key={rev.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {/* Star Rating + Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i <= revStar ? '#eab308' : 'transparent'}
                      stroke="#eab308"
                    />
                  ))}
                </div>
                {rev.date && (
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                    {rev.date}
                  </span>
                )}
              </div>

              {/* Review Text Body */}
              <div 
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: '#262626',
                  whiteSpace: 'pre-line'
                }}
              >
                {displayText}
                {isLong && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(rev.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d6efd',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '0.35rem',
                      textDecoration: 'none'
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              {/* Reviewer Name */}
              {rev.name && (
                <div style={{ fontSize: '0.86rem', color: '#6b7280', fontWeight: 500, marginTop: '0.2rem' }}>
                  {rev.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
