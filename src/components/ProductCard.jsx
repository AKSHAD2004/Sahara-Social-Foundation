import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Phone,
  Heart,
  Truck,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { customerUser, openCustomerAuthModal } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  const handleOrderNow = () => {
    if (!customerUser) {
      openCustomerAuthModal(() => {
        addToCart(product, 1);
        navigate('/checkout');
      });
      return;
    }
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2eaf4',
        overflow: 'hidden',
        boxShadow: '0 3px 12px rgba(18, 53, 91, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.25s ease'
      }}
      className="card product-card-modern"
    >
      {/* Product Image Container */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%',
          aspectRatio: '1 / 1',
          maxHeight: '220px',
          backgroundColor: '#f8fafc', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0.65rem'
        }}
      >
        <Link 
          to={`/shop/${product.id}`}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
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
        </Link>

        {/* Top-Left Badge (Bestseller / Category) */}
        {product.badgeEn && (
          <div 
            style={{
              position: 'absolute',
              top: '0.5rem',
              left: '0.5rem',
              backgroundColor: '#087E8B',
              color: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              boxShadow: '0 2px 6px rgba(8,126,139,0.3)',
              zIndex: 2
            }}
          >
            {language === 'mr' ? product.badgeMr : product.badgeEn}
          </div>
        )}

        {/* Top-Right Heart / Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(226, 234, 244, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            zIndex: 2,
            transition: 'all 0.2s ease',
            color: isWishlisted ? '#e11d48' : '#64748b'
          }}
          title={isWishlisted ? 'Saved' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart 
            size={16} 
            fill={isWishlisted ? '#e11d48' : 'none'} 
            color={isWishlisted ? '#e11d48' : '#64748b'} 
          />
        </button>

        {/* Bottom-Left Floating Rating Badge (Ref: Image 2) */}
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(4px)',
          padding: '0.15rem 0.45rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#172033',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          border: '1px solid rgba(226, 234, 244, 0.6)',
          zIndex: 2
        }}>
          <span style={{ fontWeight: 800 }}>{product.rating}</span>
          <Star size={11} fill="#F4A261" color="#F4A261" />
          <span style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 500 }}>| {product.reviewsCount}</span>
        </div>
      </div>

      {/* Product Details Section */}
      <div style={{ 
        padding: '0.75rem', 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1 
      }}>
        {/* Category / Brand Subheading */}
        <div style={{ 
          fontSize: '0.68rem', 
          color: '#087E8B', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          letterSpacing: '0.04em',
          marginBottom: '0.2rem' 
        }}>
          {language === 'mr' ? product.categoryNameMr : product.categoryNameEn}
        </div>

        {/* Product Title */}
        <Link to={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#12355B',
            marginBottom: '0.35rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.4rem'
          }}>
            {language === 'mr' ? product.nameMr : product.nameEn}
          </h3>
        </Link>

        {/* Pricing Row with Down-Arrow Discount (Ref: Image 2) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'baseline', 
          gap: '0.35rem', 
          flexWrap: 'wrap',
          marginBottom: '0.35rem', 
          marginTop: 'auto' 
        }}>
          {discountPercent && (
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#087E8B' }}>
              ↓{discountPercent}%
            </span>
          )}
          {product.originalPrice && (
            <span style={{ fontSize: '0.78rem', color: '#9cb0ce', textDecoration: 'line-through' }}>
              ₹{product.originalPrice}
            </span>
          )}
          <span style={{ fontSize: '1.08rem', fontWeight: 800, color: '#12355B' }}>
            ₹{product.price}
          </span>
        </div>

        {/* Delivery Tag */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          fontSize: '0.7rem', 
          color: '#087E8B', 
          fontWeight: 700,
          marginBottom: '0.55rem'
        }}>
          <Truck size={12} />
          <span>{language === 'mr' ? 'मोफत डिलिव्हरी' : 'Free Delivery'}</span>
        </div>

        {/* CTA Buttons Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '0.35rem',
          marginTop: '0.2rem'
        }}>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="btn btn-secondary btn-sm"
            style={{ 
              width: '100%', 
              padding: '0.4rem 0.3rem',
              fontSize: '0.75rem',
              minHeight: '36px',
              gap: '0.25rem'
            }}
            title={language === 'mr' ? 'कार्टमध्ये टाका' : 'Add to Cart'}
          >
            <ShoppingCart size={13} />
            <span>{language === 'mr' ? 'कार्ट' : 'Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleOrderNow}
            className="btn btn-primary btn-sm"
            style={{ 
              width: '100%', 
              padding: '0.4rem 0.3rem',
              fontSize: '0.75rem',
              minHeight: '36px',
              gap: '0.25rem'
            }}
            title={language === 'mr' ? 'थेट ऑर्डर करा' : 'Buy Now'}
          >
            <span>{language === 'mr' ? 'ऑर्डर' : 'Buy Now'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

