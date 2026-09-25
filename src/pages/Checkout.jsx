import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft,
  AlertCircle,
  Zap,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';
import { initializeRazorpayPayment } from '../services/razorpay';

const Checkout = () => {
  const { cartItems, subtotal, deliveryCharges, grandTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const { customerUser, openCustomerAuthModal } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: customerUser?.fullName || '',
    phone: customerUser?.phone || '',
    altPhone: '',
    email: customerUser?.email || '',
    address: customerUser?.address || '',
    landmark: '',
    city: customerUser?.city || '',
    state: customerUser?.state || 'Maharashtra',
    pincode: customerUser?.pincode || '',
    paymentMethod: 'razorpay', // 'razorpay' (Online UPI/Cards) or 'cod' (Cash on Delivery)
    healthNotes: ''
  });

  const [paymentNotice, setPaymentNotice] = useState('');

  useEffect(() => {
    if (customerUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || customerUser.fullName || '',
        phone: prev.phone || customerUser.phone || '',
        email: prev.email || customerUser.email || '',
        address: prev.address || customerUser.address || '',
        city: prev.city || customerUser.city || '',
        state: prev.state || customerUser.state || 'Maharashtra',
        pincode: prev.pincode || customerUser.pincode || ''
      }));
    }
  }, [customerUser]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#F5F7FA', padding: '5rem 0', minHeight: '60vh', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#12355B', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            {language === 'mr' ? 'कार्टमध्ये कोणतीही उत्पादने नाहीत' : 'No items to checkout'}
          </h2>
          <Link to="/shop" className="btn btn-primary">
            {language === 'mr' ? 'दुकान पहा' : 'Return to Shop'}
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = language === 'mr' ? 'कृपया पूर्ण नाव टाका' : 'Full name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'mr' ? 'मोबाईल नंबर आवश्यक आहे' : 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = language === 'mr' ? 'वैध १० अंकी मोबाईल नंबर प्रविष्ट करा' : 'Valid 10-digit mobile number required';
    }
    if (!formData.address.trim()) {
      newErrors.address = language === 'mr' ? 'डिलिव्हरी पत्ता आवश्यक आहे' : 'Delivery address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = language === 'mr' ? 'शहर / गाव आवश्यक आहे' : 'City/Town is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = language === 'mr' ? 'पिनकोड आवश्यक आहे' : 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = language === 'mr' ? 'वैध ६ अंकी पिनकोड टाका' : 'Valid 6-digit pincode required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const completeOrderPlacement = (orderId, paymentDetails = {}) => {
    const activeRefCode = localStorage.getItem('sahara_active_ref') || '';
    const users = dbService.getAll('users');
    const matchingAffiliate = users.find((u) => u.referralCode && u.referralCode.toUpperCase() === activeRefCode.toUpperCase());

    // 1. Create / Update Customer in CRM
    const customer = dbService.add('customers', {
      customerId: `CUST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      fullName: formData.fullName,
      mobileNumber: formData.phone,
      whatsappNumber: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      leadSource: activeRefCode ? 'Affiliate' : 'Website Direct',
      assignedEmployee: 'usr_emp_akash',
      assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
      customerStatus: 'Active Buyer',
      notes: formData.healthNotes ? `Health Notes: ${formData.healthNotes}` : 'Website Checkout Order'
    });

    // 2. Format products for CRM
    const productsList = cartItems.map((item) => ({
      productId: item.id || `prod_${Date.now()}`,
      name: item.title || item.name || 'Ayurvedic Wellness Product',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      total: Number(item.price || 0) * Number(item.quantity || 1)
    }));

    const isPaidOnline = paymentDetails.status === 'Paid' || formData.paymentMethod === 'razorpay';

    // 3. Create Order in CRM
    const crmOrder = {
      orderId,
      customerId: customer.id,
      customerName: formData.fullName,
      customerMobile: formData.phone,
      products: productsList,
      quantity: cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
      subtotal,
      discount: 0,
      tax: 0,
      shipping: deliveryCharges,
      grandTotal,
      eligibleAmount: grandTotal,
      paymentStatus: isPaidOnline ? 'Paid' : 'Pending',
      orderStatus: 'Confirmed',
      assignedEmployee: 'usr_emp_akash',
      assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
      affiliateName: matchingAffiliate ? matchingAffiliate.name : '',
      commissionStatus: isPaidOnline ? 'Eligible' : 'Pending Delivery',
      orderDate: new Date().toISOString(),
      deliveredDate: null,
      shippingAddress: `${formData.address}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
      paymentMethod: formData.paymentMethod === 'razorpay' ? 'Razorpay Online (UPI/Cards/NetBanking)' : 'Cash on Delivery (COD)',
      transactionId: paymentDetails.paymentId || null,
      gatewayResponse: paymentDetails || null
    };

    dbService.add('orders', crmOrder);

    // 4. Add CRM Notification
    dbService.addNotification({
      title: isPaidOnline ? 'New Paid Website Order' : 'New COD Order Placed',
      message: `Order #${orderId} for ₹${grandTotal} by ${formData.fullName} (${crmOrder.paymentMethod}).`,
      type: 'order',
      link: '/crm/orders'
    });

    const orderDetails = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cartItems],
      customer: { ...formData },
      pricing: { subtotal, deliveryCharges, grandTotal },
      paymentMethod: crmOrder.paymentMethod,
      paymentStatus: crmOrder.paymentStatus,
      transactionId: paymentDetails.paymentId || null,
      status: 'Confirmed'
    };

    localStorage.setItem('ssf_last_order', JSON.stringify(orderDetails));

    clearCart();
    setIsSubmitting(false);
    navigate('/order-confirmation', { state: { order: orderDetails } });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!customerUser) {
      openCustomerAuthModal(() => {
        // Continue after auth
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentNotice('');

    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    // Online Payment via Razorpay
    if (formData.paymentMethod === 'razorpay') {
      initializeRazorpayPayment({
        amountInRupees: grandTotal,
        orderId: orderId,
        customer: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city
        },
        notes: {
          healthNotes: formData.healthNotes || 'Direct Checkout'
        },
        onSuccess: (paymentResponse) => {
          completeOrderPlacement(orderId, {
            ...paymentResponse,
            status: 'Paid'
          });
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setPaymentNotice(
            language === 'mr'
              ? 'पेमेंट रद्द करण्यात आले. आपण पुन्हा प्रयत्न करू शकता किंवा "कॅश ऑन डिलिव्हरी" पर्याय निवडू शकता.'
              : 'Payment window was closed. You can retry or choose Cash on Delivery (COD).'
          );
        },
        onError: (err) => {
          setIsSubmitting(false);
          setPaymentNotice(
            language === 'mr'
              ? 'ऑनलाईन पेमेंटमध्ये अडचण आली. आपण कॅश ऑन डिलिव्हरी (COD) पर्याय निवडू शकता.'
              : 'Online payment error. You may choose Cash on Delivery to place order.'
          );
        }
      });
    } else {
      // Cash on Delivery (COD)
      setTimeout(() => {
        completeOrderPlacement(orderId, { status: 'Pending', method: 'COD' });
      }, 500);
    }
  };

  return (
    <div className="checkout-page" style={{ backgroundColor: '#F5F7FA', padding: '2.5rem 0 4.5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/cart"
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
            <span>{language === 'mr' ? 'कार्टकडे परत जा' : 'Back to Cart'}</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#12355B', fontWeight: 800, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
          {language === 'mr' ? 'डिलिव्हरी पत्ता व पेमेंट तपशील' : 'Delivery & Secure Checkout'}
        </h1>

        {paymentNotice && (
          <div style={{
            backgroundColor: '#fff3ec',
            border: '1px solid #ffd4b8',
            color: '#7c2d12',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#F4A261' }} />
            <span>{paymentNotice}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="checkout-layout-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.35fr 0.85fr',
            gap: '2rem',
            alignItems: 'flex-start'
          }}>
            {/* Left Column: Delivery & Payment Details */}
            <div>
              {/* Mandatory Guideline Banner */}
              <div className="notice-strip" style={{ marginBottom: '1.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#F4A261', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#12355B' }}>{language === 'mr' ? 'डिलिव्हरी नंतरचे मोफत मार्गदर्शन:' : 'Post-Delivery Expert Regimen:'}</strong><br />
                  <span style={{ color: '#172033' }}>
                    {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                  </span>
                </div>
              </div>

              {/* Personal Info Card */}
              <div className="checkout-card" style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2eaf4',
                boxShadow: '0 4px 15px rgba(18,53,91,0.04)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#12355B', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? '१. लाभार्थी / ग्राहकाची माहिती' : '1. Customer Details'}
                  </h3>
                  {customerUser && (
                    <span style={{ fontSize: '0.74rem', backgroundColor: '#dbf7fa', color: '#087E8B', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ {language === 'mr' ? 'खाते सक्रिय' : 'Logged In'}
                    </span>
                  )}
                </div>

                <div className="checkout-form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={language === 'mr' ? 'उदा. बाबासाहेब जाधव' : 'Ramesh Patil'}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? '१० अंकी मोबाईल नंबर *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      maxLength={10}
                      placeholder="8421154090"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>
                </div>

                <div className="checkout-form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'पर्यायी मोबाईल (Optional)' : 'Alt Phone (Optional)'}
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      value={formData.altPhone}
                      onChange={(e) => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'ईमेल (पावतीसाठी)' : 'Email (For Bill)'}
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="checkout-card" style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2eaf4',
                boxShadow: '0 4px 15px rgba(18,53,91,0.04)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.2rem', color: '#12355B', fontWeight: 800, marginBottom: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? '२. डिलिव्हरी पत्ता (Shipping Address)' : '2. Shipping Address'}
                </h3>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'घर / फ्लॅट नं., गल्ली, इमारतीचे नाव, सविस्तर पत्ता *' : 'House / Street / Area Address *'}
                  </label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder={language === 'mr' ? 'उदा. फ्लॅट नं. ४, शिवशंभू अपार्टमेंट, जनता बाजार जवळ' : 'Flat/House No, Building, Street...'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  {errors.address && <div className="form-error">{errors.address}</div>}
                </div>

                <div className="checkout-form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'प्रसिद्ध खूण (Landmark)' : 'Landmark'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={language === 'mr' ? 'उदा. सरकारी दवाखान्याजवळ' : 'Near City Hospital'}
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'शहर / गाव *' : 'City / Village *'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={language === 'mr' ? 'उदा. कोल्हापूर' : 'Kolhapur'}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    {errors.city && <div className="form-error">{errors.city}</div>}
                  </div>
                </div>

                <div className="checkout-form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'राज्य' : 'State'}
                    </label>
                    <select
                      className="form-select"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    >
                      <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                      <option value="Karnataka">Karnataka (कर्नाटक)</option>
                      <option value="Goa">Goa (गोवा)</option>
                      <option value="Gujarat">Gujarat (गुजरात)</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? '६ अंकी पिनकोड *' : 'Pincode *'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="416001"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                    {errors.pincode && <div className="form-error">{errors.pincode}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'आरोग्य समस्या / लक्षणे (समुपदेशकांसाठी टीप)' : 'Health Problem / Regimen Note for Counselor'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={language === 'mr' ? 'उदा. मधुमेह ५ वर्षे जुना आहे' : 'Brief medical history...'}
                    value={formData.healthNotes}
                    onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Method Option with Razorpay Integration */}
              <div className="checkout-card" style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2eaf4',
                boxShadow: '0 4px 15px rgba(18,53,91,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#12355B', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? '३. पेमेंट पर्याय (Payment Gateway)' : '3. Payment Method'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#087E8B', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Lock size={13} />
                    <span>256-Bit SSL Secure</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Option 1: Razorpay Online Payment */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: formData.paymentMethod === 'razorpay' ? '#087E8B' : '#e2eaf4',
                    backgroundColor: formData.paymentMethod === 'razorpay' ? '#dbf7fa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: '#087E8B', width: '18px', height: '18px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <div style={{ fontWeight: 800, color: '#12355B', fontSize: '0.95rem' }}>
                          {language === 'mr' ? 'ऑनलाईन पेमेंट (Razorpay - UPI / PhonePe / GPay / Cards)' : 'Online Payment (Razorpay - UPI / Cards / NetBanking)'}
                        </div>
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#12355B', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                          {language === 'mr' ? 'जलद व सुरक्षित' : 'Fast & Secure'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#4f6182', marginTop: '0.2rem' }}>
                        {language === 'mr' 
                          ? 'Google Pay, PhonePe, Paytm, डेबिट/क्रेडिट कार्ड किंवा नेटबँकिंग द्वारे त्वरित पेमेंट' 
                          : 'Pay instantly via UPI, Google Pay, PhonePe, Debit/Credit Card, NetBanking'}
                      </div>
                    </div>
                  </label>

                  {/* Option 2: COD */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: formData.paymentMethod === 'cod' ? '#087E8B' : '#e2eaf4',
                    backgroundColor: formData.paymentMethod === 'cod' ? '#dbf7fa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: '#087E8B', width: '18px', height: '18px', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, color: '#12355B', fontSize: '0.95rem' }}>
                        {language === 'mr' ? 'कॅश ऑन डिलिव्हरी (Cash on Delivery)' : 'Cash on Delivery (COD)'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#4f6182', marginTop: '0.2rem' }}>
                        {language === 'mr' ? 'पार्सल हातात आल्यावर रोख पैसे द्या' : 'Pay in cash when parcel is delivered at your address'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review */}
            <div>
              <div className="checkout-card" style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2eaf4',
                boxShadow: '0 4px 15px rgba(18,53,91,0.04)',
                position: 'sticky',
                top: '5.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', color: '#12355B', fontWeight: 800, marginBottom: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? 'ऑर्डर सारांश' : 'Order Review'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#172033', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {language === 'mr' ? item.nameMr : item.nameEn}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#4f6182' }}>
                          {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#12355B', flexShrink: 0, marginLeft: '0.5rem' }}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4f6182' }}>
                    <span>{language === 'mr' ? 'उपएकूण' : 'Subtotal'}</span>
                    <span style={{ fontWeight: 700, color: '#172033' }}>₹{subtotal}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4f6182' }}>
                    <span>{language === 'mr' ? 'डिलिव्हरी' : 'Delivery'}</span>
                    <span style={{ fontWeight: 700, color: '#087E8B' }}>
                      {deliveryCharges === 0 ? (language === 'mr' ? 'मोफत (FREE)' : 'FREE') : `₹${deliveryCharges}`}
                    </span>
                  </div>

                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '2px dashed #e2eaf4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#12355B'
                  }}>
                    <span>{language === 'mr' ? 'एकूण देय रक्कम' : 'Final Amount'}</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    marginBottom: '1rem'
                  }}
                >
                  {formData.paymentMethod === 'razorpay' ? <Zap size={18} /> : <CheckCircle2 size={18} />}
                  <span>
                    {isSubmitting
                      ? (language === 'mr' ? 'ऑर्डर पुढे नेली जात आहे...' : 'Processing...')
                      : formData.paymentMethod === 'razorpay'
                      ? (language === 'mr' ? `Razorpay ने पेमेंट करा (₹${grandTotal})` : `Pay with Razorpay (₹${grandTotal})`)
                      : (language === 'mr' ? `ऑर्डर कन्फर्म करा (₹${grandTotal})` : `Confirm Order (₹${grandTotal})`)}
                  </span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#4f6182', lineHeight: 1.4 }}>
                  {language === 'mr'
                    ? 'ऑर्डरनंतर २४ तासांत पार्सल रवाना केले जाईल. काही अडचण असल्यास ८४२११५४०९० वर संपर्क करा.'
                    : 'Dispatched within 24 hours. For questions call 8421154090.'}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .checkout-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 960px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }

        @media (max-width: 640px) {
          .checkout-card {
            padding: 1.25rem 1rem !important;
          }
          .checkout-form-row {
            grid-template-columns: 1fr !important;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
