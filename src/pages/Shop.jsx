import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Phone
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsData, organizationInfo } from '../data/websiteData';
import { useLanguage } from '../context/LanguageContext';

const Shop = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', nameEn: 'All Products', nameMr: 'सर्व उत्पादने' },
    { id: 'diabetes', nameEn: 'Diabetes Care', nameMr: 'मधुमेह' },
    { id: 'addiction', nameEn: 'De-Addiction', nameMr: 'व्यसनमुक्ती' },
    { id: 'heart', nameEn: 'Heart & Organs', nameMr: 'हृदय व लिव्हर' },
    { id: 'bones', nameEn: 'Joints & Bones', nameMr: 'सांधेदुखी' },
    { id: 'acidity', nameEn: 'Acidity & Gut', nameMr: 'पित्त व पचन' },
    { id: 'vitality', nameEn: 'Vitality Booster', nameMr: 'शक्ती व टॉनिक' },
  ];

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescMr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="shop-page">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
        color: '#ffffff',
        padding: '3rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(244,162,97,0.2)', color: '#F4A261', border: '1px solid rgba(244,162,97,0.4)' }}>
            <ShoppingBag size={15} />
            <span>{language === 'mr' ? 'Antox आयुर्वेदिक औषधी' : 'Antox Ayurvedic Formulas'}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#ffffff', marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? 'आयुर्वेदिक उत्पादने व फॉर्म्युला' : 'Authentic Ayurvedic Products'}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#e2effc', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr'
              ? '१००% शुद्ध आयुर्वेदिक औषधी, मोफत होम डिलिव्हरी आणि पार्सल मिळाल्यावर फोनवर वैयक्तिक पथ्य मार्गदर्शन.'
              : 'Pure Ayurvedic wellness solutions with free shipping and dedicated telephone guidance upon delivery.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="container">
          {/* Post-order Call Guideline Notice */}
          <div className="notice-strip" style={{ marginBottom: '2rem' }}>
            <ShieldCheck size={22} style={{ color: '#F4A261', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#12355B' }}>
                {language === 'mr' ? 'महत्त्वाची सूचना (Important Notice):' : 'Important Notice:'}
              </strong><br />
              <span style={{ color: '#172033' }}>
                {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="shop-filter-bar" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            boxShadow: '0 4px 15px rgba(18,53,91,0.06)',
            border: '1px solid #e2eaf4',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#087E8B' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem', borderColor: '#e2eaf4' }}
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
                      borderColor: isActive ? '#087E8B' : '#e2eaf4',
                      backgroundColor: isActive ? '#087E8B' : '#ffffff',
                      color: isActive ? '#ffffff' : '#172033',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      minHeight: '38px',
                      boxShadow: isActive ? '0 2px 8px rgba(8,126,139,0.25)' : 'none'
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
              border: '1px dashed #cbd5e1',
              marginBottom: '2.5rem'
            }}>
              <ShoppingBag size={44} style={{ color: '#087E8B', margin: '0 auto 0.75rem auto', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.2rem', color: '#12355B', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'कोणतीही उत्पादने सापडली नाहीत' : 'No Products Found'}
              </h3>
              <p style={{ color: '#4f6182', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
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
          <div style={{
            background: 'linear-gradient(135deg, #12355B 0%, #087E8B 100%)',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: '0 8px 24px rgba(18,53,91,0.18)'
          }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'थेट फोनवर ऑर्डर करायची आहे?' : 'Prefer to Order Directly by Phone?'}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#e2effc', margin: 0 }}>
                {language === 'mr'
                  ? 'आमच्या प्रतिनिधींशी बोलून घरबसल्या कॅश ऑन डिलिव्हरी किंवा ऑनलाईन मागवा.'
                  : 'Call our Kolhapur helpline to place your order with complete guidance.'}
              </p>
            </div>

            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-accent btn-lg"
              style={{ backgroundColor: '#F4A261', color: '#12355B', fontWeight: 800 }}
            >
              <Phone size={18} />
              <span>{language === 'mr' ? 'कॉल: ८४२११५४०९०' : 'Call 8421154090'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
