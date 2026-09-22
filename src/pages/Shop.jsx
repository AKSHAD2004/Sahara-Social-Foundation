import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ShieldCheck, 
  Phone,
  ArrowRight
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
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '3.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="section-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fef3c7' }}>
            <ShoppingBag size={16} />
            <span>{language === 'mr' ? 'Antox आयुर्वेदिक औषधी' : 'Antox Ayurvedic Formulas'}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            {language === 'mr' ? 'आयुर्वेदिक उत्पादने व फॉर्म्युला' : 'Authentic Ayurvedic Products'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'mr'
              ? '१००% शुद्ध आयुर्वेदिक औषधी, मोफत होम डिलिव्हरी आणि पार्सल मिळाल्यावर फोनवर वैयक्तिक पथ्य मार्गदर्शन.'
              : 'Pure Ayurvedic wellness solutions with free shipping and dedicated telephone guidance upon delivery.'}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          {/* Post-order Call Guideline Notice */}
          <div className="notice-strip" style={{ marginBottom: '2.5rem' }}>
            <ShieldCheck size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '1rem' }}>
                {language === 'mr' ? 'महत्त्वाची सूचना (Important Notice):' : 'Important Notice:'}
              </strong><br />
              {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                placeholder={language === 'mr' ? 'उत्पादन शोधा (उदा. Antox D, व्यसनमुक्ती, सांधेदुखी...)' : 'Search formulas (e.g. Antox D, Diabetes, Addiction)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Chips */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem'
            }}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: isActive ? '#059669' : '#e2e8f0',
                      backgroundColor: isActive ? '#059669' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
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
            <div className="grid-3" style={{ marginBottom: '3rem' }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1'
            }}>
              <ShoppingBag size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                {language === 'mr' ? 'कोणतीही उत्पादने सापडली नाहीत' : 'No Products Found'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {language === 'mr' ? 'कृपया वेगळा शब्द शोधून पहा किंवा श्रेणी बदला.' : 'Try a different search term or category.'}
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="btn btn-outline btn-sm"
              >
                {language === 'mr' ? 'सर्व उत्पादने पहा' : 'Reset Filters'}
              </button>
            </div>
          )}

          {/* Direct Phone Order Banner */}
          <div style={{
            backgroundColor: '#064e3b',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '2rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'थेट फोनवर ऑर्डर करायची आहे?' : 'Prefer to Order Directly by Phone?'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#a7f3d0', margin: 0 }}>
                {language === 'mr'
                  ? 'आमच्या प्रतिनिधींशी बोलून घरबसल्या कॅश ऑन डिलिव्हरी किंवा ऑनलाईन मागवा.'
                  : 'Call our Kolhapur helpline to place your order with complete guidance.'}
              </p>
            </div>

            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call btn-lg"
              style={{ backgroundColor: '#059669', color: '#ffffff' }}
            >
              <Phone size={18} />
              <span>{language === 'mr' ? 'कॉल करा: ८४२११५४०९०' : 'Call: 8421154090'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
