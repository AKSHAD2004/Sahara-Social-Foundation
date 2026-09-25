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
  RotateCcw
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
    <div className="product-details-page" style={{ backgroundColor: '#F5F7FA', padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#087E8B',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'mr' ? 'सर्व उत्पादनांकडे परत जा' : 'Back to Shop'}</span>
          </Link>
        </div>

        {/* Product Card Details Grid */}
        <div className="product-layout-grid" style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2eaf4',
          padding: '2.5rem',
          boxShadow: '0 10px 35px rgba(18,53,91,0.06)',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Left Column: Image */}
          <div>
            <div style={{
              borderRadius: '18px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              border: '1px solid #e2eaf4',
              aspectRatio: '1 / 1',
              position: 'relative',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem'
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
                  top: '0.85rem',
                  left: '0.85rem',
                  backgroundColor: '#087E8B',
                  color: '#ffffff',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(8,126,139,0.25)'
                }}>
                  {language === 'mr' ? product.badgeMr : product.badgeEn}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ backgroundColor: '#dbf7fa', padding: '0.65rem 0.4rem', borderRadius: '10px', border: '1px solid #abedf5' }}>
                <ShieldCheck size={18} style={{ color: '#087E8B', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#087E8B' }}>
                  {language === 'mr' ? '१००% आयुर्वेदिक' : '100% Ayurvedic'}
                </div>
              </div>

              <div style={{ backgroundColor: '#e2effc', padding: '0.65rem 0.4rem', borderRadius: '10px', border: '1px solid #b8d4f6' }}>
                <Truck size={18} style={{ color: '#12355B', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#12355B' }}>
                  {language === 'mr' ? 'मोफत डिलिव्हरी' : 'Free Delivery'}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff3ec', padding: '0.65rem 0.4rem', borderRadius: '10px', border: '1px solid #ffd4b8' }}>
                <RotateCcw size={18} style={{ color: '#F4A261', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c2d12' }}>
                  {language === 'mr' ? 'सुरक्षित सील' : 'Tamper-Proof'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div>
            <div style={{ fontSize: '0.78rem', color: '#087E8B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {language === 'mr' ? product.categoryNameMr : product.categoryNameEn} • SKU: {product.sku}
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#12355B', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? product.nameMr : product.nameEn}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.15rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F4A261" color="#F4A261" />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: '#172033', fontSize: '0.9rem' }}>{product.rating}</span>
              <span style={{ color: '#4f6182', fontSize: '0.8rem' }}>({product.reviewsCount} {language === 'mr' ? 'अभिप्राय' : 'reviews'})</span>
            </div>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#F5F7FA',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid #e2eaf4',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#12355B' }}>
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.05rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice}
                </span>
              )}
              <span style={{
                backgroundColor: '#fff3ec',
                color: '#7c2d12',
                border: '1px solid #ffd4b8',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                marginLeft: 'auto'
              }}>
                {language === 'mr' ? 'सवलत समाविष्ट' : 'Special Price'}
              </span>
            </div>

            {/* Mandatory Post-Order Helpline Guideline Alert */}
            <div style={{
              backgroundColor: '#fff3ec',
              borderLeft: '4px solid #F4A261',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.35rem',
              fontSize: '0.88rem',
              color: '#7c2d12',
              lineHeight: 1.5
            }}>
              <strong>{language === 'mr' ? 'महत्त्वाची सूचना (Important):' : 'Regimen Guidance:'}</strong><br />
              <span style={{ color: '#172033' }}>
                {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
              </span>
            </div>

            {/* Product Description */}
            <p style={{ fontSize: '0.95rem', color: '#172033', lineHeight: 1.65, marginBottom: '1.35rem' }}>
              {language === 'mr' ? product.descriptionMr : product.descriptionEn}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="product-actions-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.35rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0.65rem 0.9rem',
                    background: '#f1f5f9',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#12355B'
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0.65rem 1rem', fontWeight: 700, fontSize: '1rem', color: '#172033' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0.65rem 0.9rem',
                    background: '#f1f5f9',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#12355B'
                  }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-secondary btn-lg"
                style={{ flex: 1, minWidth: '130px' }}
              >
                <ShoppingCart size={18} />
                <span>{language === 'mr' ? 'कार्ट' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                onClick={handleOrderNow}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: '140px' }}
              >
                <span>{language === 'mr' ? 'आताच खरेदी करा' : 'Buy Now'}</span>
              </button>
            </div>

            {/* Direct Helpline & WhatsApp Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2eaf4'
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
              >
                <WhatsAppIcon size={16} color="#ffffff" animated={true} />
                <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅप विचारणा' : 'WhatsApp Enquiry'}</span>
              </a>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.86rem',
                color: '#4f6182'
              }}>
                <Phone size={15} style={{ color: '#087E8B' }} />
                <span>
                  {language === 'mr' ? 'हेल्पलाईन:' : 'Helpline:'}{' '}
                  <a href={`tel:${organizationInfo.contact.primaryPhone}`} style={{ color: '#087E8B', fontWeight: 700 }}>
                    {organizationInfo.contact.primaryPhone}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features & Usage Regimen Grid */}
        <div className="grid-2">
          {/* Key Features */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #e2eaf4',
            boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#12355B', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'प्रमुख फायदे व वैशिष्ट्ये' : 'Key Health Benefits'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {product.features?.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#172033' }}>
                  <CheckCircle2 size={16} style={{ color: '#087E8B', flexShrink: 0, marginTop: '3px' }} />
                  <span>{language === 'mr' ? feat.mr : feat.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dosage & Usage */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #e2eaf4',
            boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#12355B', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'सेवन पद्धती व मार्गदर्शिका' : 'Recommended Usage & Regimen'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#4f6182', lineHeight: 1.65, marginBottom: '1rem' }}>
              {language === 'mr' ? product.dosageMr : product.dosageEn}
            </p>

            <div style={{
              backgroundColor: '#dbf7fa',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid #abedf5',
              fontSize: '0.84rem',
              color: '#087E8B'
            }}>
              <strong>{language === 'mr' ? 'समुपदेशन सूचना:' : 'Counselor Tip:'}</strong>{' '}
              <span style={{ color: '#172033' }}>
                {language === 'mr'
                  ? 'प्रत्येक व्यक्तीची प्रकृती व आजाराचे स्वरूप वेगळे असते. अचूक प्रमाणासाठी ८४२११५४०९० वर बोलून घ्यावे.'
                  : 'Individual requirements may vary. Call 8421154090 to consult with our healthcare staff.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .product-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding: 1.5rem 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .product-actions-row {
            flex-direction: column;
            align-items: stretch;
          }
          .product-actions-row .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
