import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import { productsData, organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getComboItems, getComboChildProducts } from '../utils/comboHelper';

const ProductDetails = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
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


  // Capture affiliate referral code from URL query parameters
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
          const cleanRef = ref.trim().toUpperCase();
          localStorage.setItem('sahara_active_ref', cleanRef);
          sessionStorage.setItem('sahara_active_ref', cleanRef);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
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
    badgeMr: rawProduct.badgeMr || staticMeta.badgeMr || 'अधिकृत',
    composition: staticMeta.composition || rawProduct.composition || null,
    gallery: (staticMeta.gallery && staticMeta.gallery.length > 0) ? staticMeta.gallery : (rawProduct.gallery || []),
    supportiveIn: staticMeta.supportiveIn || rawProduct.supportiveIn || null,
    netVol: staticMeta.netVol || rawProduct.netVol || '',
    brochureSubtitle: staticMeta.brochureSubtitle || rawProduct.brochureSubtitle || '',
    brochureSubtitleMr: staticMeta.brochureSubtitleMr || rawProduct.brochureSubtitleMr || '',
    guidanceNote: staticMeta.guidanceNote || rawProduct.guidanceNote || '',
    guidanceNoteMr: staticMeta.guidanceNoteMr || rawProduct.guidanceNoteMr || '',
    dosageEn: staticMeta.dosageEn || rawProduct.dosageEn || '',
    dosageMr: staticMeta.dosageMr || rawProduct.dosageMr || ''
  };

  const comboItems = getComboItems(product);

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
      setEditSuccessMsg('Updated successfully! / उत्पादन यशस्वीरित्या अद्यतनित केले.');
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

  // Resolve child products if this is a combo kit
  const childProducts = useMemo(() => {
    return getComboChildProducts(product, productsData);
  }, [product]);

  // Build the complete slides array for THIS product (images / combo / catalogue)
  const slides = useMemo(() => {
    const list = [];
    if (comboItems && comboItems.length >= 2) {
      // Slide 0: Complete Combo Kit View
      list.push({
        key: 'combo',
        type: 'combo',
        nameEn: product.nameEn || product.name,
        nameMr: product.nameMr || product.name,
        badgeEn: 'Full Combo Kit',
        badgeMr: 'संपूर्ण किट',
        image: null,
        childProduct: null
      });

      // Child Product Slides
      comboItems.forEach((cItem, cIdx) => {
        const matchedChild = childProducts.find(
          (cp) => cp && (cp.id === cItem.productId || (cItem.name && cp.nameEn && cItem.name.toLowerCase().includes(cp.nameEn.toLowerCase())))
        ) || childProducts[cIdx] || null;

        list.push({
          key: `child-${cIdx}`,
          type: 'child',
          nameEn: cItem.name,
          nameMr: cItem.nameMr || cItem.name,
          badgeEn: `Item ${cIdx + 1} of Combo`,
          badgeMr: `किटमधील घटक ${cIdx + 1}`,
          image: cItem.image,
          fallback: cItem.fallback,
          childProduct: matchedChild
        });
      });

      // Additional brochure/catalogue slides
      if (product.gallery && product.gallery.length > 0) {
        product.gallery.forEach((gImg, gIdx) => {
          list.push({
            key: `gal-${gIdx}`,
            type: 'gallery',
            nameEn: `Catalogue Slide ${gIdx + 1}`,
            nameMr: `माहिती पत्रक ${gIdx + 1}`,
            badgeEn: `Slide ${gIdx + 1}`,
            badgeMr: `पत्रक ${gIdx + 1}`,
            image: gImg,
            fallback: product.fallbackImage,
            childProduct: null
          });
        });
      }
    } else {
      // Single product
      list.push({
        key: 'main',
        type: 'main',
        nameEn: product.nameEn || product.name,
        nameMr: product.nameMr || product.name,
        badgeEn: product.badgeEn || 'Official',
        badgeMr: product.badgeMr || 'अधिकृत',
        image: product.image,
        fallback: product.fallbackImage,
        childProduct: product
      });

      if (product.gallery && product.gallery.length > 0) {
        product.gallery.forEach((gImg, gIdx) => {
          list.push({
            key: `gal-${gIdx}`,
            type: 'gallery',
            nameEn: `Catalogue Slide ${gIdx + 1}`,
            nameMr: `माहिती पत्रक ${gIdx + 1}`,
            badgeEn: `Slide ${gIdx + 1}`,
            badgeMr: `पत्रक ${gIdx + 1}`,
            image: gImg,
            fallback: product.fallbackImage,
            childProduct: product
          });
        });
      }
    }
    return list;
  }, [product, comboItems, childProducts]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Reset slide index on product change
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [id]);

  const currentSlide = slides[currentSlideIndex] || slides[0] || {};
  const activeChildProduct = currentSlide.childProduct || null;
  const displayProduct = activeChildProduct || product;

  // Arrow navigation: Cycles through images of THIS product
  const goToPrevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Gesture State & Handlers (swipes between slides/images of THIS product)
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
      setTouchEndX(null);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchEndX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const deltaX = touchStartX - touchEndX;
    const minSwipeDistance = 45; // pixels
    if (deltaX > minSwipeDistance) {
      // Swiped Left -> go to Next slide
      goToNextSlide();
    } else if (deltaX < -minSwipeDistance) {
      // Swiped Right -> go to Previous slide
      goToPrevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
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
          gridTemplateColumns: 'minmax(300px, 400px) 1fr',
          gap: '3rem',
          marginBottom: '3rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Image with Touch Swipe and Nav Arrows */}
          <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '1px solid #E1E9DF',
                width: '100%',
                maxWidth: '380px',
                height: '360px',
                position: 'relative',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                touchAction: 'pan-y',
                userSelect: 'none',
                cursor: 'grab'
              }}
              title="Swipe left/right to view others"
            >
              {/* Previous Slide Arrow */}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevSlide();
                  }}
                  aria-label="Previous image"
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '1.5px solid #E1E9DF',
                    color: '#006B2D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    zIndex: 4,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#006B2D'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'; e.currentTarget.style.color = '#006B2D'; }}
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* Next Slide Arrow */}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextSlide();
                  }}
                  aria-label="Next image"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '1.5px solid #E1E9DF',
                    color: '#006B2D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    zIndex: 4,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#006B2D'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'; e.currentTarget.style.color = '#006B2D'; }}
                >
                  <ChevronRight size={18} />
                </button>
              )}

              {/* Main Slide Image Render */}
              {currentSlide.type === 'combo' && comboItems && comboItems.length >= 2 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  gap: '10px',
                  padding: '10px',
                  position: 'relative'
                }}>
                  {/* Left product */}
                  <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={comboItems[0].image}
                      alt={comboItems[0].name}
                      onError={(e) => {
                        e.target.onerror = null;
                        if (comboItems[0].fallback) e.target.src = comboItems[0].fallback;
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    {comboItems[0].count && comboItems[0].count > 1 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        backgroundColor: '#006B2D',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}>
                        {comboItems[0].count}x
                      </span>
                    )}
                  </div>

                  {/* Central Plus Badge */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#E8F5E9',
                    border: '2px solid #81C784',
                    color: '#006B2D',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 107, 45, 0.15)'
                  }}>
                    +
                  </div>

                  {/* Right product */}
                  <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={comboItems[1].image}
                      alt={comboItems[1].name}
                      onError={(e) => {
                        e.target.onerror = null;
                        if (comboItems[1].fallback) e.target.src = comboItems[1].fallback;
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    {comboItems[1].count && comboItems[1].count > 1 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#006B2D',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}>
                        {comboItems[1].count}x
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <img
                  src={currentSlide.image || product.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = currentSlide.fallback || product.fallbackImage;
                  }}
                  alt={language === 'mr' ? (currentSlide.nameMr || product.nameMr) : (currentSlide.nameEn || product.nameEn)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              )}

              {/* Badge on top-left of image */}
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
                boxShadow: '0 2px 6px rgba(0, 107, 45, 0.25)',
                zIndex: 3
              }}>
                {language === 'mr' ? (currentSlide.badgeMr || product.badgeMr) : (currentSlide.badgeEn || product.badgeEn)}
              </div>

              {/* Slide Counter on bottom-right */}
              {slides.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '0.65rem',
                  right: '0.85rem',
                  backgroundColor: 'rgba(23, 37, 27, 0.75)',
                  color: '#ffffff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  zIndex: 3,
                  letterSpacing: '0.04em'
                }}>
                  {currentSlideIndex + 1} / {slides.length}
                </div>
              )}
            </div>

            {/* Slide Indicator Dots */}
            {slides.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '1rem'
              }}>
                {slides.map((s, sIdx) => {
                  const isCurrent = sIdx === currentSlideIndex;
                  return (
                    <button
                      key={s.key || sIdx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(sIdx)}
                      aria-label={`Slide ${sIdx + 1}`}
                      style={{
                        width: isCurrent ? '22px' : '7px',
                        height: '7px',
                        borderRadius: '9999px',
                        backgroundColor: isCurrent ? '#006B2D' : '#C8D8C3',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      title={language === 'mr' ? (s.nameMr || s.nameEn) : s.nameEn}
                    />
                  );
                })}
              </div>
            )}

            {/* Gallery Thumbnails Strip */}
            {slides.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {slides.map((slide, sIdx) => {
                  const isSelected = currentSlideIndex === sIdx;
                  if (slide.type === 'combo') {
                    return (
                      <button
                        key="thumb-combo"
                        type="button"
                        onClick={() => setCurrentSlideIndex(sIdx)}
                        style={{
                          border: isSelected ? '2px solid #006B2D' : '1px solid #E1E9DF',
                          borderRadius: '8px',
                          padding: '3px 6px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#006B2D',
                          flexShrink: 0,
                          boxShadow: isSelected ? '0 2px 8px rgba(0, 107, 45, 0.2)' : 'none'
                        }}
                        title={language === 'mr' ? 'संपूर्ण किट' : 'Full Combo Kit'}
                      >
                        <img src={comboItems[0].image} alt="" style={{ height: '42px', width: '22px', objectFit: 'contain' }} />
                        <span style={{ fontWeight: 800 }}>+</span>
                        <img src={comboItems[1].image} alt="" style={{ height: '42px', width: '22px', objectFit: 'contain' }} />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={slide.key || sIdx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(sIdx)}
                      style={{
                        border: isSelected ? '2px solid #006B2D' : '1px solid #E1E9DF',
                        borderRadius: '8px',
                        padding: '3px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        width: '60px',
                        height: '60px',
                        flexShrink: 0,
                        boxShadow: isSelected ? '0 2px 8px rgba(0, 107, 45, 0.2)' : 'none'
                      }}
                      title={language === 'mr' ? (slide.nameMr || slide.nameEn) : slide.nameEn}
                    >
                      <img
                        src={slide.image}
                        alt={slide.nameEn || `Slide ${sIdx + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          if (slide.fallback) e.target.src = slide.fallback;
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: slide.type === 'gallery' ? 'cover' : 'contain',
                          borderRadius: '4px'
                        }}
                      />
                    </button>
                  );
                })}
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

            {/* Active Child Product Indicator Badge */}
            {activeChildProduct && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#e6f4ea',
                color: '#006B2D',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                border: '1px solid #c2f5d2'
              }}>
                <Sparkles size={13} />
                <span>
                  {language === 'mr'
                    ? `या किटमधील घटक तपशील: ${displayProduct.nameMr || displayProduct.nameEn}`
                    : `Viewing Item in Combo: ${displayProduct.nameEn}`}
                </span>
              </div>
            )}

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#006B2D', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
              {language === 'mr' ? displayProduct.nameMr : displayProduct.nameEn}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.15rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFC928" color="#FFC928" />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: '#17251B', fontSize: '0.9rem' }}>{displayProduct.rating || product.rating}</span>
              <span style={{ color: '#5F6B61', fontSize: '0.8rem' }}>({displayProduct.reviewsCount || product.reviewsCount} {language === 'mr' ? 'अभिप्राय' : 'reviews'})</span>
            </div>

            {/* Combo Item Quick Switcher Pill Tabs */}
            {comboItems && comboItems.length >= 2 && (
              <div style={{
                display: 'flex',
                gap: '0.45rem',
                marginBottom: '1.1rem',
                flexWrap: 'wrap',
                backgroundColor: '#F3F8F1',
                padding: '0.35rem',
                borderRadius: '12px',
                border: '1px solid #D5E5D1'
              }}>
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex(0)}
                  style={{
                    flex: '1 1 auto',
                    padding: '0.45rem 0.8rem',
                    borderRadius: '8px',
                    border: currentSlideIndex === 0 ? '1.5px solid #006B2D' : '1px solid transparent',
                    backgroundColor: currentSlideIndex === 0 ? '#006B2D' : '#ffffff',
                    color: currentSlideIndex === 0 ? '#ffffff' : '#006B2D',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    boxShadow: currentSlideIndex === 0 ? '0 2px 6px rgba(0, 107, 45, 0.25)' : 'none'
                  }}
                >
                  <Sparkles size={14} />
                  <span>{language === 'mr' ? 'संपूर्ण किट (Full Combo)' : 'Full Combo Overview'}</span>
                </button>
                {comboItems.map((cItem, cIdx) => {
                  const slideIdx = 1 + cIdx;
                  const isAct = currentSlideIndex === slideIdx;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(slideIdx)}
                      style={{
                        flex: '1 1 auto',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '8px',
                        border: isAct ? '1.5px solid #006B2D' : '1px solid transparent',
                        backgroundColor: isAct ? '#006B2D' : '#ffffff',
                        color: isAct ? '#ffffff' : '#006B2D',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isAct ? '0 2px 6px rgba(0, 107, 45, 0.25)' : 'none'
                      }}
                    >
                      {language === 'mr' ? `घटक ${cIdx + 1}: ${cItem.nameMr || cItem.name}` : `Item ${cIdx + 1}: ${cItem.name}`}
                    </button>
                  );
                })}
              </div>
            )}

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
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
                  <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#006B2D' }}>
                    ₹{product.price}
                  </span>
                </div>
                {activeChildProduct && (
                  <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 600, marginTop: '2px' }}>
                    {language === 'mr'
                      ? 'हा संपूर्ण किटचा दर आहे (दोन्ही उत्पादने समाविष्ट)'
                      : 'Price is for the complete combo kit (both items included)'}
                  </div>
                )}
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
                  : (language === 'mr' ? 'सिंगल पॅक' : 'Single Pack')}
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
              {language === 'mr' ? displayProduct.descriptionMr : displayProduct.descriptionEn}
            </p>

            {/* Combo Kit Contents (if combo product) */}
            {comboItems && comboItems.length >= 2 && (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '12px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.35rem'
              }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} />
                    <span>{language === 'mr' ? 'या किटमधील घटक (तपशीलासाठी क्लिक करा):' : 'Combo Kit Includes (Click to view details):'}</span>
                  </div>
                  {activeChildProduct && (
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex(0)}
                      style={{
                        backgroundColor: '#DCFCE7',
                        border: '1px solid #86EFAC',
                        color: '#15803D',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {language === 'mr' ? 'संपूर्ण किट पहा' : 'View Full Kit'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                  {comboItems.map((item, idx) => {
                    const slideIdx = 1 + idx;
                    const isSelected = currentSlideIndex === slideIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setCurrentSlideIndex(slideIdx)}
                        style={{
                          backgroundColor: isSelected ? '#DCFCE7' : '#ffffff',
                          border: isSelected ? '1.5px solid #16A34A' : '1px solid #DCFCE7',
                          borderRadius: '8px',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(22, 163, 74, 0.2)' : 'none'
                        }}
                        title={language === 'mr' ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view details'}
                      >
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#14532D' }}>
                            {language === 'mr' ? (item.nameMr || item.name) : item.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600 }}>
                            {item.count > 1 ? `${item.count} Units Included` : '1 Unit Included'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
              {language === 'mr' 
                ? (activeChildProduct ? `${displayProduct.nameMr || displayProduct.nameEn} चे प्रमुख फायदे` : 'प्रमुख फायदे व वैशिष्ट्ये') 
                : (activeChildProduct ? `Key Benefits of ${displayProduct.nameEn}` : 'Key Health Benefits')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(displayProduct.features || product.features)?.map((feat, idx) => (
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
              {language === 'mr' ? (displayProduct.dosageMr || product.dosageMr) : (displayProduct.dosageEn || product.dosageEn)}
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

        {/* Supportive in / Clinical Indications Official Brochure Card */}
        {((displayProduct.supportiveIn && displayProduct.supportiveIn.length > 0) || (product.supportiveIn && product.supportiveIn.length > 0)) && (
          <div style={{
            marginTop: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1.5px solid #c3edd2',
            boxShadow: '0 4px 18px rgba(0, 107, 45, 0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid #E1E9DF',
              paddingBottom: '0.85rem'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#006B2D',
                  backgroundColor: '#e2faea',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '20px',
                  marginBottom: '0.35rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <ShieldCheck size={14} />
                  <span>{language === 'mr' ? 'अधिकृत मार्गदर्शक माहिती' : 'Official Brochure Guide'}</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' 
                    ? `${displayProduct.nameMr || displayProduct.nameEn} : उपयुक्त व गुणकारी (Supportive in:)` 
                    : `${displayProduct.nameEn} : Supportive in :`}
                </h3>
                {(displayProduct.brochureSubtitle || product.brochureSubtitle) && (
                  <div style={{ fontSize: '0.84rem', color: '#5F6B61', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    {language === 'mr' 
                      ? (displayProduct.brochureSubtitleMr || product.brochureSubtitleMr || displayProduct.brochureSubtitle || product.brochureSubtitle) 
                      : (displayProduct.brochureSubtitle || product.brochureSubtitle)}
                  </div>
                )}
              </div>

              {(displayProduct.netVol || product.netVol) && (
                <div style={{
                  backgroundColor: '#F3F8F1',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '10px',
                  border: '1.5px solid #c3edd2',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#006B2D',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span>{language === 'mr' ? `निव्वळ प्रमाण: ${displayProduct.netVol || product.netVol}` : `Net Vol / Qty: ${displayProduct.netVol || product.netVol}`}</span>
                </div>
              )}
            </div>

            {/* Indications Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              {(displayProduct.supportiveIn || product.supportiveIn).map((item, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    backgroundColor: '#F8FAF7',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #E1E9DF',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#006B2D',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 5px rgba(0, 107, 45, 0.25)'
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#17251B', fontWeight: 600, lineHeight: 1.45 }}>
                    {language === 'mr' ? (item.mr || item.en) : item.en}
                  </span>
                </div>
              ))}
            </div>

            {/* Official Guidance & Medical Consultation Note Footnote */}
            <div style={{
              backgroundColor: '#0b396b',
              color: '#ffffff',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
              boxShadow: '0 3px 10px rgba(11, 57, 107, 0.25)'
            }}>
              <div style={{
                backgroundColor: '#FFC928',
                color: '#17251B',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0
              }}>
                {language === 'mr' ? 'तज्ज्ञ सल्ला' : 'CLINICAL NOTE'}
              </div>
              <div style={{ flex: 1, minWidth: '240px', fontWeight: 500 }}>
                {language === 'mr'
                  ? (displayProduct.guidanceNoteMr || product.guidanceNoteMr || 'टीप: हे उत्पादन इलेक्ट्रो-होमिओपॅथी (EH HERBAL) तत्त्वांवर आधारित असून डॉ. बी. एस. माने (MD, EH, ADEH, BEMS) यांच्या तज्ज्ञ मार्गदर्शन व सल्ल्यानुसार विकसित केलेले आहे.')
                  : (displayProduct.guidanceNote || product.guidanceNote || 'NOTE : This product is based on Electro-Homeopathy (EH HERBAL) under Guidance and Consultation of Dr. B.S MANE (MD, EH, ADEH, BEMS)')}
              </div>
            </div>
          </div>
        )}

        {/* Active Botanical Ingredients / Formulation Card */}
        {((displayProduct.composition && displayProduct.composition.length > 0) || (product.composition && product.composition.length > 0)) && (
          <div style={{
            marginTop: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E1E9DF',
            boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#e2faea',
                color: '#006B2D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' 
                    ? `${displayProduct.nameMr || displayProduct.nameEn} : सक्रिय आयुर्वेदिक घटक व कार्यप्रणाली`
                    : `${displayProduct.nameEn} : Active Botanical Ingredients & Formulation Action`}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#5F6B61' }}>
                  {language === 'mr' ? '१००% शुद्ध व शास्त्रीय पद्धतीने निवडलेल्या वनौषधींचा संगम' : '100% pure, scientifically standardized botanical extracts'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              {(displayProduct.composition || product.composition).map((herb, hIdx) => (
                <div
                  key={hIdx}
                  style={{
                    backgroundColor: '#F3F8F1',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #E1E9DF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#006B2D' }}>
                    {language === 'mr' ? (herb.nameMr || herb.nameEn) : herb.nameEn}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#17251B', lineHeight: 1.5 }}>
                    {language === 'mr' ? (herb.benefitMr || herb.benefitEn) : herb.benefitEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Description, Science & Catalogue Gallery Images (Nutrifeel Product Description Images) */}
        {product.gallery && product.gallery.length > 0 && (
          <div style={{
            marginTop: '2.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1.5px solid #E1E9DF',
            boxShadow: '0 6px 24px rgba(0, 107, 45, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #E1E9DF',
              paddingBottom: '1rem'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#006B2D',
                  backgroundColor: '#e2faea',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <Sparkles size={13} />
                  <span>{language === 'mr' ? 'सविस्तर माहिती व कॅटलॉग' : 'Detailed Description & Catalogue'}</span>
                </div>
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)',
                  color: '#006B2D',
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: 'var(--font-heading)'
                }}>
                  {language === 'mr' 
                    ? `${product.nameMr || product.nameEn} — अधिकृत माहिती पत्रक व शास्त्रीय तपशील` 
                    : `${product.nameEn} — Official Guide & Formulation Details`}
                </h3>
              </div>

              <div style={{
                fontSize: '0.82rem',
                color: '#5F6B61',
                fontWeight: 600
              }}>
                {product.gallery.length} {language === 'mr' ? 'माहिती पत्रके' : 'Pages / Slides'}
              </div>
            </div>

            {/* Grid of Product Description / Catalogue Images */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'start'
            }}>
              {product.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAF7',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E1E9DF',
                    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 107, 45, 0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.05)';
                  }}
                  onClick={() => {
                    const gIdx = slides.findIndex((s) => s.image === imgUrl);
                    if (gIdx !== -1) {
                      setCurrentSlideIndex(gIdx);
                    }
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                >
                  <div style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem'
                  }}>
                    <img
                      src={imgUrl}
                      alt={`${product.nameEn} Guide page ${idx + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '10px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #EAEFE7',
                    backgroundColor: '#ffffff'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#006B2D' }}>
                      {language === 'mr' ? `पत्रक पान #${idx + 1}` : `Page #${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#159B32', fontWeight: 600 }}>
                      {language === 'mr' ? 'मोठे पाहण्यासाठी क्लिक करा' : 'Click to preview'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                {language === 'mr' ? 'संपादित करा' : 'Edit'}
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
                  {language === 'mr' ? 'नाव' : 'Name'}
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
