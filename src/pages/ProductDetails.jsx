import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  Share2
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { productsData, organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { customerUser, openCustomerAuthModal } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const product = productsData.find((p) => p.id === id) || productsData[0];

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleOrderNow = () => {
    if (!customerUser) {
      openCustomerAuthModal(() => {
        addToCart(product, quantity);
        navigate('/checkout');
      });
      return;
    }
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="product-details-page" style={{ backgroundColor: '#f8fafc', padding: '2.5rem 0 4.5rem 0' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#059669',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'mr' ? 'सर्व उत्पादनांकडे परत जा' : 'Back to Shop'}</span>
          </Link>
        </div>

        {/* Product Card Details Grid */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 10px 35px rgba(0,0,0,0.05)',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '3.5rem',
          marginBottom: '3.5rem'
        }} className="product-layout-grid">
          {/* Left Column: Image */}
          <div>
            <div style={{
              borderRadius: '18px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              aspectRatio: '1/1',
              position: 'relative',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <img
                src={product.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = product.fallbackImage;
                }}
                alt={product.nameMr || product.nameEn}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {product.badgeEn && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  {language === 'mr' ? product.badgeMr : product.badgeEn}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <ShieldCheck size={20} style={{ color: '#059669', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#064e3b' }}>
                  {language === 'mr' ? '१००% आयुर्वेदिक' : '100% Ayurvedic'}
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <Truck size={20} style={{ color: '#2563eb', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a' }}>
                  {language === 'mr' ? 'मोफत डिलिव्हरी' : 'Free Delivery'}
                </div>
              </div>

              <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <RotateCcw size={20} style={{ color: '#d97706', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78350f' }}>
                  {language === 'mr' ? 'सुरक्षित सील' : 'Tamper-Proof'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div>
            <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              {language === 'mr' ? product.categoryNameMr : product.categoryNameEn} • SKU: {product.sku}
            </div>

            <h1 style={{ fontSize: '2.1rem', color: '#064e3b', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.75rem' }}>
              {language === 'mr' ? product.nameMr : product.nameEn}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{product.rating}</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({product.reviewsCount} {language === 'mr' ? 'अभिप्राय' : 'reviews'})</span>
            </div>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#064e3b' }}>
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.2rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice}
                </span>
              )}
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                marginLeft: 'auto'
              }}>
                {language === 'mr' ? 'सवलत समाविष्ट' : 'Special Price'}
              </span>
            </div>

            {/* Mandatory Post-Order Helpline Guideline Alert */}
            <div style={{
              backgroundColor: '#fffbeb',
              borderLeft: '4px solid #d97706',
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.75rem',
              fontSize: '0.92rem',
              color: '#92400e',
              lineHeight: 1.5
            }}>
              <strong>{language === 'mr' ? 'महत्त्वाची सूचना (Important):' : 'Regimen Guidance:'}</strong><br />
              {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
            </div>

            {/* Product Description */}
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {language === 'mr' ? product.descriptionMr : product.descriptionEn}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0.65rem 1rem',
                    background: '#f1f5f9',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '1rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0.65rem 1rem',
                    background: '#f1f5f9',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-secondary btn-lg"
                style={{ flex: 1, minWidth: '150px' }}
              >
                <ShoppingCart size={18} />
                <span>{language === 'mr' ? 'कार्टमध्ये टाका' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleOrderNow}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: '160px' }}
              >
                <span>{language === 'mr' ? 'आताच ऑर्डर करा' : 'Buy Now'}</span>
              </button>
            </div>

            {/* Direct Helpline & WhatsApp Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e2e8f0',
              marginTop: '1.25rem'
            }}>
              <a
                href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                  language === 'mr'
                    ? `नमस्कार, मला ${product.nameMr} या फॉर्म्युलाबद्दल माहिती व आहाराचे पथ्य जाणून घ्यायचे आहे.`
                    : `Hello, I would like to know more about ${product.nameEn} and its dosage.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ padding: '0.45rem 1rem' }}
              >
                <WhatsAppIcon size={18} color="#ffffff" animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅपवर विचारणा करा' : 'WhatsApp Enquiry'}</span>
              </a>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.88rem',
                color: '#475569'
              }}>
                <Phone size={16} style={{ color: '#059669' }} />
                <span>
                  {language === 'mr' ? 'हेल्पलाईन:' : 'Helpline:'}{' '}
                  <a href={`tel:${organizationInfo.contact.primaryPhone}`} style={{ color: '#059669', fontWeight: 700 }}>
                    {organizationInfo.contact.primaryPhone}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features & Usage Regimen Tabs/Cards */}
        <div className="grid-2">
          {/* Key Features */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
              {language === 'mr' ? 'प्रमुख फायदे व वैशिष्ट्ये' : 'Key Health Benefits'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {product.features?.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '3px' }} />
                  <span>{language === 'mr' ? feat.mr : feat.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dosage & Usage */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
              {language === 'mr' ? 'सेवन पद्धती व मार्गदर्शिका' : 'Recommended Usage & Regimen'}
            </h3>
            <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {language === 'mr' ? product.dosageMr : product.dosageEn}
            </p>

            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              fontSize: '0.88rem',
              color: '#065f46'
            }}>
              <strong>{language === 'mr' ? 'समुपदेशन सूचना:' : 'Counselor Tip:'}</strong>{' '}
              {language === 'mr'
                ? 'प्रत्येक व्यक्तीची प्रकृती व आजाराचे स्वरूप वेगळे असते. अचूक प्रमाणासाठी ८४२११५४०९० वर बोलून घ्यावे.'
                : 'Individual requirements may vary. Call 8421154090 to consult with our healthcare staff.'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .product-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
