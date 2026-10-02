import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Phone
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsData, organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';
import { useLanguage } from '../context/LanguageContext';

const Shop = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState(() => {
    const fromDb = dbService.getAll('products');
    return (Array.isArray(fromDb) && fromDb.length > 0) ? fromDb : productsData;
  });

  useEffect(() => {
    const unsub = dbService.subscribe('products', (dbProducts) => {
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProductsList(dbProducts);
      }
    });
    return unsub;
  }, []);

  const categories = [
    { id: 'all', nameEn: 'All Products', nameMr: 'सर्व उत्पादने' },
    { id: 'diabetes', nameEn: 'Diabetes Care', nameMr: 'मधुमेह' },
    { id: 'heart', nameEn: 'Heart & Organs', nameMr: 'हृदय व लिव्हर' },
    { id: 'addiction', nameEn: 'De-Addiction', nameMr: 'व्यसनमुक्ती' },
    { id: 'bones', nameEn: 'Joints & Bones', nameMr: 'सांधेदुखी' },
  ];

  // Merge live admin-edited database product data with rich metadata
  const normalizedProducts = productsList.map((p) => {
    const staticMeta = productsData.find(
      (sd) => sd.id === p.id || sd.sku === p.sku || sd.alias === p.id
    ) || {};

    const catStr = (p.category || staticMeta.category || '').toLowerCase();
    let catKey = 'diabetes';
    if (catStr.includes('diabet')) catKey = 'diabetes';
    else if (catStr.includes('heart') || catStr.includes('organ') || catStr.includes('liver')) catKey = 'heart';
    else if (catStr.includes('addict')) catKey = 'addiction';
    else if (catStr.includes('bone') || catStr.includes('joint')) catKey = 'bones';

    return {
      ...staticMeta,
      ...p,
      id: p.id || staticMeta.id,
      name: p.name || staticMeta.name,
      nameEn: p.name || staticMeta.nameEn || p.nameEn,
      nameMr: staticMeta.nameMr || p.name,
      sku: p.sku || staticMeta.sku,
      category: catKey,
      categoryNameEn: p.category || staticMeta.categoryNameEn,
      categoryNameMr: staticMeta.categoryNameMr || p.category,
      isCombo: p.isCombo !== undefined ? p.isCombo : (staticMeta.isCombo !== undefined ? staticMeta.isCombo : (Number(p.price || staticMeta.price) >= 3000)),
      price: Number(p.price || p.sellingPrice || staticMeta.price || 0),
      originalPrice: Number(p.mrp || staticMeta.originalPrice || staticMeta.mrp || p.price),
      mrp: Number(p.mrp || staticMeta.mrp || p.price),
      stock: p.stock !== undefined ? Number(p.stock) : (staticMeta.stock || 100),
      image: p.image || staticMeta.image,
      fallbackImage: staticMeta.fallbackImage || p.image,
      shortDescEn: p.description || staticMeta.shortDescEn || '',
      shortDescMr: staticMeta.shortDescMr || p.description || '',
      description: p.description || staticMeta.description || '',
      rating: p.rating || staticMeta.rating || 4.8,
      reviewsCount: p.reviewsCount || staticMeta.reviewsCount || 100,
      badgeEn: p.badgeEn || staticMeta.badgeEn || 'Official',
      badgeMr: p.badgeMr || staticMeta.badgeMr || 'अधिकृत'
    };
  });

  const filteredProducts = normalizedProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.nameEn && product.nameEn.toLowerCase().includes(q)) ||
      (product.nameMr && product.nameMr.toLowerCase().includes(q)) ||
      (product.sku && product.sku.toLowerCase().includes(q)) ||
      (product.shortDescEn && product.shortDescEn.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="page-hero-header">
        <div className="container">
          <div className="section-badge">
            <ShoppingBag size={14} />
            <span>{language === 'mr' ? 'Antox आयुर्वेदिक औषधी' : 'Antox Ayurvedic Formulas'}</span>
          </div>
          <h1>
            {language === 'mr' ? 'आयुर्वेदिक उत्पादने व फॉर्म्युला' : 'Authentic Ayurvedic Products'}
          </h1>
          <p>
            {language === 'mr'
              ? '१००% शुद्ध आयुर्वेदिक औषधी, मोफत होम डिलिव्हरी आणि पार्सल मिळाल्यावर फोनवर वैयक्तिक पथ्य मार्गदर्शन.'
              : 'Pure Ayurvedic wellness solutions with free shipping and dedicated telephone guidance upon delivery.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F3F8F1' }}>
        <div className="container">
          {/* Post-order Call Guideline Notice */}
          <div className="notice-strip" style={{ marginBottom: '2rem' }}>
            <ShieldCheck size={22} style={{ color: '#FFC928', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#006B2D' }}>
                {language === 'mr' ? 'महत्त्वाची सूचना (Important Notice):' : 'Important Notice:'}
              </strong><br />
              <span style={{ color: '#17251B' }}>
                {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="shop-filter-bar" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            boxShadow: '0 4px 15px rgba(0, 107, 45, 0.06)',
            border: '1px solid #E1E9DF',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#006B2D' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem', borderColor: '#E1E9DF' }}
                placeholder={language === 'mr' ? 'उत्पादन शोधा (उदा. Antox D, व्यसनमुक्ती, सांधेदुखी...)' : 'Search formulas (e.g. Antox D, Diabetes, Addiction)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Chips (Smooth Horizontal Scroll on Touch) */}
            <div style={{
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '9999px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      border: '1.5px solid',
                      borderColor: isActive ? '#006B2D' : '#E1E9DF',
                      backgroundColor: isActive ? '#006B2D' : '#ffffff',
                      color: isActive ? '#ffffff' : '#17251B',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      minHeight: '38px',
                      boxShadow: isActive ? '0 2px 8px rgba(0, 107, 45, 0.25)' : 'none'
                    }}
                  >
                    {language === 'mr' ? cat.nameMr : cat.nameEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="products-grid" style={{ marginBottom: '2.5rem' }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 1rem',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #E1E9DF',
              marginBottom: '2.5rem'
            }}>
              <ShoppingBag size={44} style={{ color: '#006B2D', margin: '0 auto 0.75rem auto', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.2rem', color: '#006B2D', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'कोणतीही उत्पादने सापडली नाहीत' : 'No Products Found'}
              </h3>
              <p style={{ color: '#5F6B61', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                {language === 'mr' ? 'कृपया वेगळा शब्द शोधून पहा किंवा श्रेणी बदला.' : 'Try a different search term or category.'}
              </p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="btn btn-outline btn-sm"
              >
                {language === 'mr' ? 'सर्व उत्पादने पहा' : 'Reset Filters'}
              </button>
            </div>
          )}

          {/* Direct Phone Order Banner */}
          <div className="shop-order-banner" style={{
            background: 'linear-gradient(135deg, #006B2D 0%, #04200e 100%)',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: '0 8px 24px rgba(0, 107, 45, 0.18)'
          }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'थेट फोनवर ऑर्डर करायची आहे?' : 'Prefer to Order Directly by Phone?'}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#d6fae0', margin: 0 }}>
                {language === 'mr'
                  ? 'आमच्या प्रतिनिधींशी बोलून घरबसल्या कॅश ऑन डिलिव्हरी किंवा ऑनलाईन मागवा.'
                  : 'Call our Kolhapur helpline to place your order with complete guidance.'}
              </p>
            </div>

            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-accent btn-lg"
              style={{ backgroundColor: '#FFC928', color: '#17251B', fontWeight: 800 }}
            >
              <Phone size={18} />
              <span>{language === 'mr' ? 'कॉल: ८४२११५४०९०' : 'Call 8421154090'}</span>
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .shop-filter-bar {
            padding: 0.75rem 0.85rem !important;
            margin-bottom: 1rem !important;
            border-radius: 12px !important;
            gap: 0.55rem !important;
          }
          .shop-order-banner {
            padding: 1rem 1.15rem !important;
            border-radius: 14px !important;
            gap: 0.85rem !important;
          }
          .shop-order-banner h3 {
            font-size: 1.15rem !important;
          }
          .shop-order-banner p {
            font-size: 0.80rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Shop;
