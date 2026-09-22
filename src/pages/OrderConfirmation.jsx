import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ShieldAlert, 
  FileText,
  Home
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';

const OrderConfirmation = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      try {
        const saved = localStorage.getItem('ssf_last_order');
        if (saved) setOrder(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [location.state]);

  if (!order) {
    return (
      <div style={{ backgroundColor: '#f8fafc', padding: '5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2>{language === 'mr' ? 'कोणतीही ऑर्डर आढळली नाही' : 'No Order Found'}</h2>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {language === 'mr' ? 'दुकान पहा' : 'Visit Shop'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page" style={{ backgroundColor: '#f8fafc', padding: '4rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Success Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <h1 style={{ fontSize: '2rem', color: '#064e3b', fontWeight: 800, marginBottom: '0.5rem' }}>
            {language === 'mr' ? 'आपली ऑर्डर यशस्वीरित्या नोंदवली गेली आहे!' : 'Order Placed Successfully!'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '1.25rem' }}>
            {language === 'mr' ? 'ऑर्डर क्रमांक:' : 'Order ID:'}{' '}
            <strong style={{ color: '#064e3b', fontSize: '1.1rem' }}>{order.orderId}</strong>
          </p>

          {/* CRITICAL POST-DELIVERY REGIMEN NOTICE */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            margin: '1.5rem 0'
          }}>
            <ShieldAlert size={26} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'अतिशय महत्त्वाची सूचना (Important Regimen Notice):' : 'Mandatory Regimen Notice:'}
              </div>
              <p style={{ fontSize: '0.98rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={`tel:${organizationInfo.contact.primaryPhone}`}
              className="btn btn-call"
            >
              <Phone size={16} />
              <span>{language === 'mr' ? '८४२११५४०९० वर कॉल करा' : 'Call 8421154090'}</span>
            </a>

            <a
              href={`https://wa.me/${organizationInfo.contact.whatsappNumber}?text=${encodeURIComponent(
                `नमस्कार, माझी ऑर्डर क्र. ${order.orderId} नोंदवली आहे. मला फॉर्म्युला व आहाराच्या पथ्याबद्दल मार्गदर्शन हवे आहे.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <WhatsAppIcon size={18} color="#ffffff" animated={true} />
              <span>{language === 'mr' ? 'व्हॉट्सअ‍ॅपवर कळवा' : 'Send on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Order Details Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1.25rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: '#059669' }} />
            <span>{language === 'mr' ? 'ऑर्डर तपशील' : 'Order Information'}</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {language === 'mr' ? 'डिलिव्हरी पत्ता:' : 'Shipping Address:'}
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>
                {order.customer.fullName}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                {order.customer.address}, {order.customer.landmark ? order.customer.landmark + ', ' : ''}
                {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                Phone: {order.customer.phone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {language === 'mr' ? 'पेमेंट प्रकार:' : 'Payment Method:'}
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>
                {order.paymentMethod === 'cod' ? (language === 'mr' ? 'कॅश ऑन डिलिव्हरी (COD)' : 'Cash on Delivery') : 'Direct UPI'}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
                Status: Confirmed & Dispatched within 24 Hours
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              {language === 'mr' ? 'मागवलेली उत्पादने:' : 'Ordered Items:'}
            </h4>

            {order.items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                <span>{it.quantity} × {language === 'mr' ? it.nameMr : it.nameEn}</span>
                <span style={{ fontWeight: 700, color: '#064e3b' }}>₹{it.price * it.quantity}</span>
              </div>
            ))}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#064e3b',
              paddingTop: '0.75rem',
              borderTop: '2px dashed #e2e8f0',
              marginTop: '0.75rem'
            }}>
              <span>{language === 'mr' ? 'एकूण रक्कम:' : 'Total Amount:'}</span>
              <span>₹{order.pricing.grandTotal}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/" className="btn btn-outline">
              <Home size={16} />
              <span>{language === 'mr' ? 'मुख्यपृष्ठावर जा' : 'Return to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
