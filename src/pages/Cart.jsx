import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Phone,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { organizationInfo } from '../data/websiteData';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, deliveryCharges, grandTotal } = useCart();
  const { language } = useLanguage();
  const { customerUser, openCustomerAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!customerUser) {
      openCustomerAuthModal(() => {
        navigate('/checkout');
      });
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#f8fafc', padding: '5rem 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShoppingCart size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#064e3b', fontWeight: 800, marginBottom: '0.75rem' }}>
            {language === 'mr' ? 'आपली कार्ट रिकामी आहे' : 'Your Cart is Empty'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {language === 'mr'
              ? 'आपण अद्याप कोणतेही आयुर्वेदिक उत्पादन जोडलेले नाही. आमच्या दर्जेदार फॉर्म्युलामधून निवड करा.'
              : 'You have not added any wellness formula yet. Explore our authentic Ayurvedic store.'}
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            <ShoppingCart size={18} />
            <span>{language === 'mr' ? 'उत्पादने पहा' : 'Explore Shop'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{ backgroundColor: '#f8fafc', padding: '3rem 0 5rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.2rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.5rem' }}>
          {language === 'mr' ? 'आपली शॉपिंग कार्ट' : 'Shopping Cart'}
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.8fr',
          gap: '2.5rem',
          alignItems: 'flex-start'
        }} className="cart-layout-grid">
          {/* Left Column: Cart Items List */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center'
                  }}
                  className="cart-item-row"
                >
                  <img
                    src={item.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = item.fallbackImage;
                    }}
                    alt={item.nameMr || item.nameEn}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      backgroundColor: '#f8fafc',
                      flexShrink: 0
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <Link to={`/shop/${item.id}`}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.25rem' }}>
                        {language === 'mr' ? item.nameMr : item.nameEn}
                      </h4>
                    </Link>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      ₹{item.price} / युनिट
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0.35rem 0.9rem', fontSize: '0.9rem', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={15} />
                        <span>{language === 'mr' ? 'काढून टाका' : 'Remove'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.2rem', color: '#064e3b' }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
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
                  <span>{language === 'mr' ? 'अधिक उत्पादने पहा' : 'Continue Shopping'}</span>
                </Link>

                <button
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {language === 'mr' ? 'कार्ट रिकामी करा' : 'Clear Cart'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
                {language === 'mr' ? 'ऑर्डर सारांश (Summary)' : 'Order Summary'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>{language === 'mr' ? 'उपएकूण (Subtotal)' : 'Subtotal'}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{subtotal}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Truck size={15} style={{ color: '#059669' }} />
                    {language === 'mr' ? 'डिलिव्हरी शुल्क' : 'Delivery Charges'}
                  </span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>
                    {deliveryCharges === 0 ? (language === 'mr' ? 'मोफत (Free)' : 'FREE') : `₹${deliveryCharges}`}
                  </span>
                </div>

                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '2px dashed #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#064e3b'
                }}>
                  <span>{language === 'mr' ? 'एकूण रक्कम' : 'Total Amount'}</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* Mandatory Helpline Reminder Notice */}
              <div style={{
                backgroundColor: '#fffbeb',
                borderLeft: '4px solid #d97706',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#92400e',
                lineHeight: 1.5,
                marginBottom: '1.5rem'
              }}>
                <strong>{language === 'mr' ? 'महत्त्वाचे:' : 'Note:'}</strong>{' '}
                {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem', cursor: 'pointer' }}
              >
                <span>{language === 'mr' ? 'चेकआऊट करा (Proceed to Checkout)' : 'Proceed to Checkout'}</span>
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                <ShieldCheck size={14} style={{ display: 'inline', color: '#059669', marginRight: '4px' }} />
                {language === 'mr' ? 'सुरक्षित ऑर्डर व सीलबंद पॅकिंग' : '100% Safe & Sealed Delivery'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .cart-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
