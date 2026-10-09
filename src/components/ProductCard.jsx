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
import { getComboItems } from '../utils/comboHelper';

const ProductCard = ({ product }) => {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const comboItems = getComboItems(product);
  const effectivePrice = product.price || product.sellingPrice;

  const handleOrderNow = () => {
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
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      className="card product-card-simple"
    >
      {/* Product Image Container (Clean, no floating badge clutter) */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%',
          aspectRatio: '1 / 1',
          maxHeight: '200px',
          backgroundColor: '#fafafa', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0.75rem'
        }}
      >
        <Link 
          to={`/shop/${product.id}`}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
        >
          {comboItems && comboItems.length >= 2 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              gap: '6px',
              padding: '2px',
              position: 'relative'
            }}>
              {/* Product 1 */}
              <div style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minWidth: 0
              }}>
                <img
                  src={comboItems[0].image}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.onerror = null;
                    if (comboItems[0].fallback) e.target.src = comboItems[0].fallback;
                  }}
                  alt={comboItems[0].name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  className="product-card-img"
                />
                {comboItems[0].count && comboItems[0].count > 1 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    backgroundColor: '#006B2D',
                    color: '#ffffff',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                    zIndex: 2,
                    lineHeight: '1.2'
                  }}>
                    {comboItems[0].count}x
                  </span>
                )}
              </div>

              {/* Central Plus Badge */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
                border: '1.5px solid #81C784',
                color: '#006B2D',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 2,
                boxShadow: '0 2px 4px rgba(0, 107, 45, 0.12)'
              }}>
                +
              </div>

              {/* Product 2 */}
              <div style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minWidth: 0
              }}>
                <img
                  src={comboItems[1].image}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.onerror = null;
                    if (comboItems[1].fallback) e.target.src = comboItems[1].fallback;
                  }}
                  alt={comboItems[1].name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  className="product-card-img"
                />
                {comboItems[1].count && comboItems[1].count > 1 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#006B2D',
                    color: '#ffffff',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                    zIndex: 2,
                    lineHeight: '1.2'
                  }}>
                    {comboItems[1].count}x
                  </span>
                )}
              </div>
            </div>
          ) : (
            <img
              src={product.image}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = product.fallbackImage;
              }}
              alt={product.nameMr || product.nameEn}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              className="product-card-img"
            />
          )}
        </Link>
      </div>

      {/* Product Details Section (Clean, unified hierarchy) */}
      <div style={{ 
        padding: '0.75rem', 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1 
      }}>
        {/* Product Title */}
        <Link to={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#17251B',
            marginBottom: '0.25rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.4rem'
          }}>
            {language === 'mr' ? (product.nameMr || product.name || product.nameEn) : (product.nameEn || product.name || product.nameMr)}
          </h3>
        </Link>

        {/* Subtle Pack Info & Delivery Note */}
        <div style={{ 
          fontSize: '0.72rem', 
          color: '#5F6B61', 
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          {(product.isCombo !== false && (product.isCombo || effectivePrice >= 3000))
            ? (language === 'mr' ? 'कॉम्बो पॅक • मोफत डिलिव्हरी' : 'Combo Pack • Free Delivery')
            : (language === 'mr' ? 'सिंगल पॅक • मोफत डिलिव्हरी' : 'Single Product • Free Delivery')}
        </div>

        {/* Price Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'baseline', 
          justifyContent: 'space-between',
          marginBottom: '0.65rem', 
          marginTop: 'auto' 
        }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#006B2D' }}>
            ₹{effectivePrice}
          </span>
          {product.originalPrice && product.originalPrice > effectivePrice && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Single Clean Full-Width Order Button */}
        <button
          type="button"
          onClick={handleOrderNow}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: '#006B2D',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#08481c'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#006B2D'; }}
          title={language === 'mr' ? 'थेट ऑर्डर करा' : 'Order Now'}
        >
          <ShoppingCart size={14} />
          <span>{language === 'mr' ? 'ऑर्डर करा' : 'Order Now'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

