import React, { useState, useEffect } from 'react';
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
  Edit,
  Save,
  X
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import { productsData, organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    mrp: '',
    stock: '',
    description: '',
    image: ''
  });
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [productsList, setProductsList] = useState(() => {
    const fromDb = dbService.getAll('products');
    const base = productsData;
    if (Array.isArray(fromDb) && fromDb.length > 0) {
      const dbMap = new Map(fromDb.map((p) => [String(p.id), p]));
      const merged = base.map((p) => {
        const custom = dbMap.get(String(p.id)) || fromDb.find((f) => f.sku && f.sku === p.sku);
        return custom ? { ...p, ...custom } : p;
      });
      fromDb.forEach((p) => {
        if (!base.some((b) => String(b.id) === String(p.id) || (b.sku && b.sku === p.sku))) {
          merged.push(p);
        }
      });
      return merged;
    }
    return base;
  });

  useEffect(() => {
    setSelectedImage(null);
  }, [id]);

  useEffect(() => {
    dbService.refreshFromFirebase('products').catch(() => {});

    const unsub = dbService.subscribe('products', (dbProducts) => {
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        const base = productsData;
        const dbMap = new Map(dbProducts.map((p) => [String(p.id), p]));
        const merged = base.map((p) => {
          const custom = dbMap.get(String(p.id)) || dbProducts.find((f) => f.sku && f.sku === p.sku);
          return custom ? { ...p, ...custom } : p;
        });
        dbProducts.forEach((p) => {
          if (!base.some((b) => String(b.id) === String(p.id) || (b.sku && b.sku === p.sku))) {
            merged.push(p);
          }
        });
        setProductsList(merged);
      }
    });
    return unsub;
  }, []);

  const rawProduct = productsList.find((p) => p.id === id || p.sku === id || p.alias === id) 
    || productsData.find((p) => p.id === id || p.sku === id || p.alias === id) 
    || productsList[0] 
    || productsData[0];

  const staticMeta = productsData.find(
    (sd) => sd.id === rawProduct?.id || sd.sku === rawProduct?.sku || sd.alias === rawProduct?.id
  ) || {};

  const product = {
    ...staticMeta,
    ...rawProduct,
    id: rawProduct.id || staticMeta.id,
    name: rawProduct.name || staticMeta.name,
    nameEn: rawProduct.name || staticMeta.nameEn || rawProduct.nameEn,
    nameMr: staticMeta.nameMr || rawProduct.name,
    sku: rawProduct.sku || staticMeta.sku,
    categoryNameEn: rawProduct.category || staticMeta.categoryNameEn || 'Nutraceutical Formula',
    categoryNameMr: staticMeta.categoryNameMr || rawProduct.category,
    isCombo: rawProduct.isCombo !== undefined ? rawProduct.isCombo : (staticMeta.isCombo !== undefined ? staticMeta.isCombo : (Number(rawProduct.price || staticMeta.price) >= 3000)),
    price: Number(rawProduct.price || rawProduct.sellingPrice || staticMeta.price || 0),
    originalPrice: Number(rawProduct.mrp || staticMeta.originalPrice || staticMeta.mrp || rawProduct.price),
    mrp: Number(rawProduct.mrp || staticMeta.mrp || rawProduct.price),
    stock: rawProduct.stock !== undefined ? Number(rawProduct.stock) : (staticMeta.stock || 100),
    image: rawProduct.image || staticMeta.image,
    fallbackImage: staticMeta.fallbackImage || rawProduct.image,
    description: rawProduct.description || staticMeta.description || '',
    descriptionEn: rawProduct.description || staticMeta.descriptionEn || staticMeta.description || '',
    descriptionMr: staticMeta.descriptionMr || rawProduct.description || '',
    features: staticMeta.features || [
      { en: "100% Herbal with no chemical additives", mr: "कोणत्याही केमिकल विरहित १००% शुद्ध आयुर्वेदिक" },
      { en: "Formulated under classical Nutraceutical guidelines", mr: "शास्त्रीय आयुर्वेदिक पद्धतीनुसार तयार" }
    ],
    rating: rawProduct.rating || staticMeta.rating || 4.8,
    reviewsCount: rawProduct.reviewsCount || staticMeta.reviewsCount || 100,
    badgeEn: rawProduct.badgeEn || staticMeta.badgeEn || 'Official',
    badgeMr: rawProduct.badgeMr || staticMeta.badgeMr || 'अधिकृत'
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleOpenEdit = () => {
    setEditFormData({
      name: product.nameEn || product.name || '',
      price: product.price || '',
      mrp: product.mrp || product.originalPrice || '',
      stock: product.stock !== undefined ? product.stock : 100,
      description: product.descriptionEn || product.description || '',
      image: product.image || ''
    });
    setEditSuccessMsg('');
    setShowEditModal(true);
  };

  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!product.id) return;
    const updated = dbService.update('products', product.id, {
      name: editFormData.name,
      price: Number(editFormData.price),
      sellingPrice: Number(editFormData.price),
      mrp: Number(editFormData.mrp),
      stock: Number(editFormData.stock),
      description: editFormData.description,
      image: editFormData.image
    });

    if (updated) {
      setProductsList(dbService.getAll('products'));
      setEditSuccessMsg('Product updated successfully! / उत्पादन यशस्वीरित्या अद्यतनित केले.');
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccessMsg('');
      }, 1200);
    }
  };

  const handleOrderNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="product-details-page" style={{ backgroundColor: '#F3F8F1', padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#006B2D',
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
          border: '1px solid #E1E9DF',
          padding: '2.5rem',
          boxShadow: '0 10px 35px rgba(0, 107, 45, 0.06)',
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
              border: '1px solid #E1E9DF',
              aspectRatio: '1 / 1',
              position: 'relative',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem'
            }}>
              <img
                src={selectedImage || product.image}
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
                  backgroundColor: '#006B2D',
                  color: '#ffffff',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0, 107, 45, 0.25)'
                }}>
                  {language === 'mr' ? product.badgeMr : product.badgeEn}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip (from Nutrifeel) */}
            {product.gallery && product.gallery.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedImage(product.image)}
                  style={{
                    border: (!selectedImage || selectedImage === product.image) ? '2px solid #006B2D' : '1px solid #E1E9DF',
                    borderRadius: '8px',
                    padding: '3px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    width: '60px',
                    height: '60px',
                    flexShrink: 0
                  }}
                  title="Main Product View"
                >
                  <img src={product.image} alt="Main View" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
                {product.gallery.map((gImg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(gImg)}
                    style={{
                      border: selectedImage === gImg ? '2px solid #006B2D' : '1px solid #E1E9DF',
                      borderRadius: '8px',
                      padding: '3px',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      width: '60px',
                      height: '60px',
                      flexShrink: 0
                    }}
                    title={`Catalogue Slide ${idx + 1}`}
                  >
                    <img src={gImg} alt={`Slide ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </button>
                ))}
              </div>
            )}

            {product.nutrifeelUrl && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <a
                  href={product.nutrifeelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    color: '#006B2D',
                    fontWeight: 700,
                    textDecoration: 'none',
                    backgroundColor: '#e6f4ea',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    border: '1px solid #b7e1cd'
                  }}
                >
                  <span>{language === 'mr' ? 'अधिकृत न्युट्रीफील वेबसाईट पहा ↗' : 'View on Official Nutrifeel ↗'}</span>
                </a>
              </div>
            )}

            {/* Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ backgroundColor: '#e2faea', padding: '0.65rem 0.4rem', borderRadius: '10px', border: '1px solid #c3edd2' }}>
                <ShieldCheck size={18} style={{ color: '#006B2D', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#006B2D' }}>
                  {language === 'mr' ? '१००% आयुर्वेदिक' : '100% Nutraceutical'}
                </div>
              </div>

              <div style={{ backgroundColor: '#F3F8F1', padding: '0.65rem 0.4rem', borderRadius: '10px', border: '1px solid #E1E9DF' }}>
                <Truck size={18} style={{ color: '#006B2D', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#006B2D' }}>
                  {language === 'mr' ? 'मोफत डिलिव्हरी' : 'Free Delivery'}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff9e6', padding: '0.65rem 0.4rem', borderRadius: '10px', border: '1px solid #ffeaad' }}>
                <RotateCcw size={18} style={{ color: '#b38600', margin: '0 auto 0.2rem auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#785300' }}>
                  {language === 'mr' ? 'सुरक्षित सील' : 'Tamper-Proof'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#159B32', fontWeight: 700, textTransform: 'uppercase' }}>
                {language === 'mr' ? product.categoryNameMr : product.categoryNameEn} • SKU: {product.sku}
              </div>
              <button
                type="button"
                onClick={handleOpenEdit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#e2faea',
                  color: '#006B2D',
                  border: '1px solid #c3edd2',
                  borderRadius: '6px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Edit size={13} />
                <span>{language === 'mr' ? 'उत्पादन संपादित करा' : 'Edit Product'}</span>
              </button>
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#006B2D', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? product.nameMr : product.nameEn}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.15rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFC928" color="#FFC928" />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: '#17251B', fontSize: '0.9rem' }}>{product.rating}</span>
              <span style={{ color: '#5F6B61', fontSize: '0.8rem' }}>({product.reviewsCount} {language === 'mr' ? 'अभिप्राय' : 'reviews'})</span>
            </div>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#F3F8F1',
              padding: '0.85rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid #E1E9DF',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#006B2D' }}>
                  ₹{product.price}
                </span>
                <span style={{ fontSize: '1rem', color: '#5F6B61', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice || (product.price >= 3000 ? 4000 : 2000)}
                </span>
              </div>

              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 800, 
                color: (product.isCombo !== false && (product.isCombo || product.price >= 3000)) ? '#006B2D' : '#785300', 
                backgroundColor: (product.isCombo !== false && (product.isCombo || product.price >= 3000)) ? '#e2faea' : '#fff9e6', 
                padding: '0.35rem 0.75rem', 
                borderRadius: '6px',
                border: `1px solid ${(product.isCombo !== false && (product.isCombo || product.price >= 3000)) ? '#c2f5d2' : '#ffe594'}`
              }}>
                {(product.isCombo !== false && (product.isCombo || product.price >= 3000)) 
                  ? (language === 'mr' ? 'कॉम्बो पॅक (२ औषधी किट)' : 'Combo Pack (Full Kit)') 
                  : (language === 'mr' ? 'सिंगल प्रॉडक्ट (१ उत्पादन)' : 'Single Product')}
              </span>
            </div>

            {/* Mandatory Post-Order Helpline Guideline Alert */}
            <div style={{
              backgroundColor: '#fff9e6',
              borderLeft: '4px solid #FFC928',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.35rem',
              fontSize: '0.88rem',
              color: '#785300',
              lineHeight: 1.5
            }}>
              <strong>{language === 'mr' ? 'महत्त्वाची सूचना (Important):' : 'Regimen Guidance:'}</strong><br />
              <span style={{ color: '#17251B' }}>
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
                border: '1.5px solid #E1E9DF',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0.65rem 0.9rem',
                    background: '#F3F8F1',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#006B2D'
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0.65rem 1rem', fontWeight: 700, fontSize: '1rem', color: '#17251B' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0.65rem 0.9rem',
                    background: '#F3F8F1',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#006B2D'
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
              borderTop: '1px solid #E1E9DF'
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
                color: '#5F6B61'
              }}>
                <Phone size={15} style={{ color: '#006B2D' }} />
                <span>
                  {language === 'mr' ? 'हेल्पलाईन:' : 'Helpline:'}{' '}
                  <a href={`tel:${organizationInfo.contact.primaryPhone}`} style={{ color: '#006B2D', fontWeight: 700 }}>
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
            border: '1px solid #E1E9DF',
            boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#006B2D', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'प्रमुख फायदे व वैशिष्ट्ये' : 'Key Health Benefits'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {product.features?.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#17251B' }}>
                  <CheckCircle2 size={16} style={{ color: '#159B32', flexShrink: 0, marginTop: '3px' }} />
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
            border: '1px solid #E1E9DF',
            boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#006B2D', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? 'सेवन पद्धती व मार्गदर्शिका' : 'Recommended Usage & Regimen'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#5F6B61', lineHeight: 1.65, marginBottom: '1rem' }}>
              {language === 'mr' ? product.dosageMr : product.dosageEn}
            </p>

            <div style={{
              backgroundColor: '#e2faea',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid #c3edd2',
              fontSize: '0.84rem',
              color: '#006B2D'
            }}>
              <strong>{language === 'mr' ? 'समुपदेशन सूचना:' : 'Counselor Tip:'}</strong>{' '}
              <span style={{ color: '#17251B' }}>
                {language === 'mr'
                  ? 'प्रत्येक व्यक्तीची प्रकृती व आजाराचे स्वरूप वेगळे असते. अचूक प्रमाणासाठी ८४२११५४०९० वर बोलून घ्यावे.'
                  : 'Individual requirements may vary. Call 8421154090 to consult with our healthcare staff.'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback Section (Matching Screenshot) */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid #E1E9DF', paddingTop: '2rem' }}>
          <CustomerReviewsSection 
            productId={product.id}
            onOrderNow={handleOrderNow}
          />
        </div>
      </div>

      {/* Product Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(4, 32, 14, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E1E9DF', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#006B2D', margin: 0 }}>
                {language === 'mr' ? 'उत्पादन संपादित करा' : 'Edit Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5F6B61' }}
              >
                <X size={20} />
              </button>
            </div>

            {editSuccessMsg && (
              <div style={{ backgroundColor: '#e2faea', color: '#006B2D', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>
                ✓ {editSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveProductEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'उत्पादनाचे नाव' : 'Product Name'}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E1E9DF', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                    {language === 'mr' ? 'किंमत (₹)' : 'Price (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E1E9DF', fontSize: '0.92rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.mrp}
                    onChange={(e) => setEditFormData({ ...editFormData, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E1E9DF', fontSize: '0.92rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                    {language === 'mr' ? 'शिल्लक स्टॉक' : 'Stock (Units)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E1E9DF', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'फोटो URL / इमेज' : 'Image URL'}
                </label>
                <input
                  type="text"
                  value={editFormData.image}
                  onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E1E9DF', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#006B2D', marginBottom: '0.35rem' }}>
                  {language === 'mr' ? 'तपशील / वर्णन' : 'Description'}
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #E1E9DF', fontSize: '0.92rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #E1E9DF', background: '#F3F8F1', fontWeight: 600, cursor: 'pointer', color: '#17251B' }}
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#006B2D', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Save size={16} />
                  <span>{language === 'mr' ? 'बदल जतन करा' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .product-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            padding: 1.15rem 0.85rem !important;
            margin-bottom: 1.5rem !important;
            border-radius: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .product-layout-grid {
            padding: 0.85rem 0.65rem !important;
            gap: 1rem !important;
            margin-bottom: 1.15rem !important;
          }
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
