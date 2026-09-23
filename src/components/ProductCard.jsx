import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Check, 
  Phone,
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { organizationInfo } from '../data/websiteData';

const ProductCard = ({ product }) => {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleOrderNow = () => {
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      className="card product-card-animated"
    >
      {/* Product Image & Badge */}
      <div style={{ position: 'relative', height: '220px', backgroundColor: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.85rem' }}>
        <img
          src={product.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = product.fallbackImage;
          }}
          alt={product.nameMr || product.nameEn}
          style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }}
          className="product-card-img"
        />

        {product.badgeEn && (
          <div 
            className="hero-slide-badge"
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
            }}
          >
            {language === 'mr' ? product.badgeMr : product.badgeEn}
          </div>
        )}

        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          padding: '0.2rem 0.5rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#b45309',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating}</span>
          <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>({product.reviewsCount})</span>
        </div>
      </div>

      {/* Product Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          {language === 'mr' ? product.categoryNameMr : product.categoryNameEn}
        </div>

        <Link to={`/shop/${product.id}`}>
          <h3 style={{
            fontSize: '1.08rem',
            fontWeight: 700,
            color: '#064e3b',
            marginBottom: '0.5rem',
            lineHeight: 1.35,
            minHeight: '2.7rem'
          }}>
            {language === 'mr' ? product.nameMr : product.nameEn}
          </h3>
        </Link>

        <p style={{
          fontSize: '0.84rem',
          color: '#64748b',
          lineHeight: 1.5,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {language === 'mr' ? product.shortDescMr : product.shortDescEn}
        </p>

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1.25rem', marginTop: 'auto' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b' }}>
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              ₹{product.originalPrice}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginLeft: 'auto' }}>
            {language === 'mr' ? 'मोफत डिलिव्हरी' : 'Free Delivery'}
          </span>
        </div>

        {/* Post-order Call Reminder */}
        <div style={{
          fontSize: '0.72rem',
          color: '#92400e',
          backgroundColor: '#fef3c7',
          padding: '0.35rem 0.6rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <Phone size={12} style={{ flexShrink: 0 }} />
          <span>{language === 'mr' ? 'ऑर्डर मिळाल्यावर ८४२११५४०९० वर कॉल करा' : 'Call 8421154090 on delivery'}</span>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={() => addToCart(product, 1)}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.82rem' }}
          >
            <ShoppingCart size={14} />
            <span>{language === 'mr' ? 'कार्टमध्ये टाका' : 'Add to Cart'}</span>
          </button>

          <button
            onClick={handleOrderNow}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', fontSize: '0.82rem' }}
          >
            <span>{language === 'mr' ? 'ऑर्डर करा' : 'Order Now'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
