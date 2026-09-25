import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
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
      <div style={{ backgroundColor: '#F5F7FA', padding: '4rem 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#dbf7fa',
            color: '#087E8B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <ShoppingCart size={36} />
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#12355B', fontWeight: 800, marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? 'आपली कार्ट रिकामी आहे' : 'Your Cart is Empty'}
          </h2>
          <p style={{ color: '#4f6182', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
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
    <div className="cart-page" style={{ backgroundColor: '#F5F7FA', padding: '2.5rem 0 4.5rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#12355B', fontWeight: 800, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
          {language === 'mr' ? 'आपली शॉपिंग कार्ट' : 'Shopping Cart'}
        </h1>

        <div className="cart-layout-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.8fr',
          gap: '2rem',
          alignItems: 'flex-start'
        }}>
          {/* Left Column: Cart Items List */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2eaf4',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
            }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="cart-item-row"
                  style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid #e2eaf4',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={item.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = item.fallbackImage;
                    }}
                    alt={item.nameMr || item.nameEn}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '12px',
                      objectFit: 'contain',
                      backgroundColor: '#F5F7FA',
                      flexShrink: 0,
                      padding: '0.25rem',
                      border: '1px solid #e2eaf4'
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/shop/${item.id}`}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#12355B', marginBottom: '0.2rem', lineHeight: 1.3, fontFamily: 'var(--font-heading)' }}>
                        {language === 'mr' ? item.nameMr : item.nameEn}
                      </h4>
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: '#4f6182', marginBottom: '0.45rem' }}>
                      ₹{item.price} / युनिट
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            minHeight: '36px',
                            color: '#12355B'
                          }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0.35rem 0.85rem', fontSize: '0.88rem', fontWeight: 700, color: '#172033' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            minHeight: '36px',
                            color: '#12355B'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>{language === 'mr' ? 'काढून टाका' : 'Remove'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.15rem', color: '#12355B', flexShrink: 0 }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: '#F5F7FA',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <Link
                  to="/shop"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#087E8B',
                    fontSize: '0.88rem',
                    fontWeight: 700
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>{language === 'mr' ? 'अधिक उत्पादने पहा' : 'Continue Shopping'}</span>
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f6182',
                    fontSize: '0.82rem',
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
              padding: '1.75rem',
              border: '1px solid #e2eaf4',
              boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
            }}>
              <h3 style={{ fontSize: '1.25rem', color: '#12355B', fontWeight: 800, marginBottom: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                {language === 'mr' ? 'ऑर्डर सारांश (Summary)' : 'Order Summary'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4f6182' }}>
                  <span>{language === 'mr' ? 'उपएकूण (Subtotal)' : 'Subtotal'}</span>
                  <span style={{ fontWeight: 700, color: '#172033' }}>₹{subtotal}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4f6182' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Truck size={15} style={{ color: '#087E8B' }} />
                    {language === 'mr' ? 'डिलिव्हरी शुल्क' : 'Delivery Charges'}
                  </span>
                  <span style={{ fontWeight: 700, color: '#087E8B' }}>
                    {deliveryCharges === 0 ? (language === 'mr' ? 'मोफत (Free)' : 'FREE') : `₹${deliveryCharges}`}
                  </span>
                </div>

                <div style={{
                  paddingTop: '0.75rem',
                  borderTop: '2px dashed #e2eaf4',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#12355B'
                }}>
                  <span>{language === 'mr' ? 'एकूण रक्कम' : 'Total Amount'}</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* Mandatory Helpline Reminder Notice */}
              <div style={{
                backgroundColor: '#fff3ec',
                borderLeft: '4px solid #F4A261',
                padding: '0.75rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#7c2d12',
                lineHeight: 1.5,
                marginBottom: '1.25rem'
              }}>
                <strong>{language === 'mr' ? 'महत्त्वाचे:' : 'Note:'}</strong>{' '}
                <span style={{ color: '#172033' }}>
                  {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                </span>
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

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4f6182' }}>
                <ShieldCheck size={14} style={{ display: 'inline', color: '#087E8B', marginRight: '4px' }} />
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
            gap: 1.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .cart-item-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
