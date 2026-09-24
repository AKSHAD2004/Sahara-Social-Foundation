import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ShieldAlert, 
  FileText,
  Home,
  Printer
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

  const handlePrint = () => {
    window.print();
  };

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
    <div className="order-confirmation-page" style={{ backgroundColor: '#f8fafc', padding: '3.5rem 0 5.5rem 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Printable Official Invoice Header (Visible only on Print) */}
        <div className="print-only-header" style={{ display: 'none' }}>
          <div style={{ borderBottom: '2px solid #064e3b', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.6rem', color: '#064e3b', margin: 0, fontWeight: 800 }}>
              सहारा सोशल फाऊंडेशन, कोल्हापूर (Sahara Social Foundation)
            </h1>
            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#475569' }}>
              नोंदणीकृत सामाजिक संस्था (Reg. No. MAH/582/2014/KOP) • अधिकृत आरोग्य व औषधोपचार सेवा
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#065f46', fontWeight: 700 }}>
              हेल्पलाईन / समुपदेशन: {organizationInfo.contact.primaryPhone} • WhatsApp: {organizationInfo.contact.whatsappNumber}
            </p>
            <div style={{ display: 'inline-block', backgroundColor: '#ecfdf5', color: '#065f46', padding: '0.25rem 1rem', borderRadius: '4px', fontWeight: 800, marginTop: '0.5rem', fontSize: '0.9rem' }}>
              ग्राहक पावती / OFFICIAL ORDER INVOICE
            </div>
          </div>
        </div>

        {/* Success Header (Hidden during print) */}
        <div className="no-print" style={{
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

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                backgroundColor: '#065f46',
                borderColor: '#065f46',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Printer size={17} />
              <span>{language === 'mr' ? 'बिल प्रिंट करा' : 'Print Bill'}</span>
            </button>
          </div>
        </div>

        {/* Order Details / Printable Bill Card */}
        <div className="order-details-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#064e3b', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#059669' }} />
              <span>{language === 'mr' ? 'ऑर्डर माहिती व बिल' : 'Order Information & Bill'}</span>
            </h3>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm no-print"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem' }}
              title="Print Order Receipt"
            >
              <Printer size={15} />
              <span>{language === 'mr' ? 'प्रिंट' : 'Print'}</span>
            </button>
          </div>

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
                {order.paymentMethod?.includes('Razorpay') || order.paymentMethod === 'online'
                  ? (language === 'mr' ? 'Razorpay ऑनलाईन (Paid)' : 'Razorpay Online (Paid)')
                  : (order.paymentMethod === 'cod' || order.paymentMethod?.includes('Cash')
                    ? (language === 'mr' ? 'कॅश ऑन डिलिव्हरी (COD)' : 'Cash on Delivery')
                    : order.paymentMethod || 'Online Payment')}
              </div>
              {order.transactionId && (
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                  Txn ID: {order.transactionId}
                </div>
              )}
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
                Status: {order.paymentStatus === 'Paid' ? 'Paid & Confirmed' : 'Confirmed & Dispatched within 24 Hours'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                {language === 'mr' ? 'तारीख:' : 'Date:'} {order.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              {language === 'mr' ? 'मागवलेली उत्पादने:' : 'Ordered Items:'}
            </h4>

            <div style={{ width: '100%', marginBottom: '0.5rem' }}>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid #f8fafc' }}>
                  <span>{it.quantity} × {language === 'mr' ? it.nameMr : it.nameEn}</span>
                  <span style={{ fontWeight: 700, color: '#064e3b' }}>₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

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

          {/* Action Buttons (Print & Return to Home) */}
          <div className="no-print" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                backgroundColor: '#065f46',
                borderColor: '#065f46',
                padding: '0.7rem 1.5rem',
                fontSize: '0.95rem'
              }}
            >
              <Printer size={18} />
              <span>{language === 'mr' ? 'पावती प्रिंट करा' : 'Print Bill'}</span>
            </button>

            <Link to="/" className="btn btn-outline" style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>
              <Home size={17} />
              <span>{language === 'mr' ? 'मुख्यपृष्ठावर जा' : 'Return to Home'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .order-confirmation-page, 
          .order-confirmation-page .container,
          .print-only-header,
          .print-only-header *,
          .order-details-card,
          .order-details-card * {
            visibility: visible;
          }
          .order-confirmation-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: #ffffff !important;
            padding: 0 !important;
          }
          .print-only-header {
            display: block !important;
          }
          .order-details-card {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            padding: 1.5rem !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;

