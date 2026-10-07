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
  const { customerUser, loginCustomer } = useAuth();
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

  const COD_MIN_ADVANCE = 200;
  const isCod = formData.paymentMethod === 'cod';
  const codAdvanceAmount = Math.min(COD_MIN_ADVANCE, grandTotal);
  const codBalanceDue = Math.max(0, grandTotal - codAdvanceAmount);
  const payableNow = isCod ? codAdvanceAmount : grandTotal;

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#F3F8F1', padding: '5rem 0', minHeight: '60vh', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#006B2D', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
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
      newErrors.fullName = language === 'mr' ? 'कृपया पूर्ण नाव प्रविष्ट करा' : 'Full name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'mr' ? '१० अंकी मोबाईल नंबर आवश्यक आहे' : 'Mobile number is required';
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

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstFieldId = `input-${errorKeys[0]}`;
      setTimeout(() => {
        const targetElement = document.getElementById(firstFieldId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetElement.focus();
        }
      }, 60);
      return false;
    }
    return true;
  };

  const completeOrderPlacement = async (orderId, paymentDetails = {}) => {
    const activeRefCode = localStorage.getItem('sahara_active_ref') || '';
    const users = dbService.getAll('users');
    const matchingAffiliate = users.find((u) => u.referralCode && u.referralCode.toUpperCase() === activeRefCode.toUpperCase());

    // 1. Create / Update Customer in CRM & Firebase Firestore
    const cleanPhone = (formData.phone || '').replace(/\D/g, '').trim();
    const custId = customerUser?.id || `CUST-${cleanPhone || Date.now()}`;
    const customerPayload = {
      id: custId,
      customerId: custId,
      fullName: formData.fullName,
      phone: cleanPhone,
      mobileNumber: cleanPhone,
      whatsappNumber: cleanPhone,
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
    };

    await dbService.saveCustomerProfile(customerPayload);

    // 2. Format products for CRM
    const productsList = cartItems.map((item) => ({
      productId: item.id || `prod_${Date.now()}`,
      name: item.title || item.name || 'Nutraceutical Wellness Product',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      total: Number(item.price || 0) * Number(item.quantity || 1)
    }));

    const isCodOrder = paymentDetails.isCod ?? (formData.paymentMethod === 'cod');
    const advancePaid = paymentDetails.advancePaid ?? (isCodOrder ? Math.min(COD_MIN_ADVANCE, grandTotal) : grandTotal);
    const balanceDue = paymentDetails.balanceDue ?? (isCodOrder ? Math.max(0, grandTotal - advancePaid) : 0);
    const isPaidOnlineFull = !isCodOrder;

    // 3. Create Order in CRM & Firebase
    const crmOrder = {
      orderId,
      customerId: custId,
      customerName: formData.fullName,
      customerMobile: formData.phone,
      products: productsList,
      quantity: cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
      subtotal,
      discount: 0,
      tax: 0,
      shipping: deliveryCharges,
      grandTotal,
      advancePaid,
      balanceDue,
      eligibleAmount: grandTotal,
      paymentStatus: isPaidOnlineFull ? 'Paid' : 'Partially Paid',
      orderStatus: 'Confirmed',
      assignedEmployee: 'usr_emp_akash',
      assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
      affiliateName: matchingAffiliate ? matchingAffiliate.name : '',
      commissionStatus: isPaidOnlineFull ? 'Eligible' : 'Pending Delivery',
      orderDate: new Date().toISOString(),
      deliveredDate: null,
      shippingAddress: `${formData.address}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
      paymentMethod: isCodOrder 
        ? `Cash on Delivery (₹${advancePaid} Advance Paid via Razorpay)` 
        : 'Razorpay Online (UPI/Cards/NetBanking)',
      transactionId: paymentDetails.paymentId || paymentDetails.razorpay_payment_id || null,
      gatewayResponse: paymentDetails || null
    };

    await dbService.add('orders', crmOrder);

    // 4. Add CRM Notification
    dbService.addNotification({
      title: isPaidOnlineFull ? 'New Paid Website Order' : 'New COD Order (₹200 Advance Paid)',
      message: isPaidOnlineFull
        ? `Order #${orderId} for ₹${grandTotal} fully paid online by ${formData.fullName}.`
        : `Order #${orderId} for ₹${grandTotal} (₹${advancePaid} paid via Razorpay, ₹${balanceDue} COD balance) by ${formData.fullName}.`,
      type: 'order',
      link: '/crm/orders'
    });

    const orderDetails = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cartItems],
      customer: { ...formData },
      pricing: { 
        subtotal, 
        deliveryCharges, 
        grandTotal,
        advancePaid,
        balanceDue,
        isCod: isCodOrder
      },
      paymentMethod: crmOrder.paymentMethod,
      paymentStatus: crmOrder.paymentStatus,
      transactionId: paymentDetails.paymentId || paymentDetails.razorpay_payment_id || null,
      status: 'Confirmed'
    };

    localStorage.setItem('ssf_last_order', JSON.stringify(orderDetails));

    // Seamlessly associate buyer profile so they have direct access to their order
    if (!customerUser && loginCustomer) {
      try {
        loginCustomer({
          id: custId,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        });
      } catch (err) {
        console.warn('Auto customer login:', err);
      }
    }

    clearCart();
    setIsSubmitting(false);
    navigate('/order-confirmation', { state: { order: orderDetails } });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Direct buy without forcing login: just fill necessary information
    setIsSubmitting(true);
    setPaymentNotice('');

    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const amountToPayNow = isCod ? codAdvanceAmount : grandTotal;
    const remainingCodBalance = isCod ? codBalanceDue : 0;

    // Invoke Razorpay:
    // If Online: Pay Full Grand Total
    // If COD: Pay Minimum Advance of ₹200 (or grandTotal if lower)
    initializeRazorpayPayment({
      amountInRupees: amountToPayNow,
      orderId: orderId,
      description: isCod
        ? `COD Advance Booking Token (₹${amountToPayNow}) - Order #${orderId}`
        : `Full Online Payment (₹${amountToPayNow}) - Order #${orderId}`,
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city
      },
      notes: {
        healthNotes: formData.healthNotes || 'Direct Checkout',
        paymentType: isCod ? 'COD_ADVANCE_TOKEN' : 'FULL_ONLINE_PAYMENT',
        advanceAmount: amountToPayNow,
        balanceDueOnDelivery: remainingCodBalance
      },
      onSuccess: (paymentResponse) => {
        completeOrderPlacement(orderId, {
          ...paymentResponse,
          status: isCod ? 'Partially Paid' : 'Paid',
          paymentId: paymentResponse.razorpay_payment_id || paymentResponse.paymentId,
          advancePaid: amountToPayNow,
          balanceDue: remainingCodBalance,
          isCod
        });
      },
      onDismiss: () => {
        setIsSubmitting(false);
        setPaymentNotice(
          isCod
            ? (language === 'mr'
                ? 'कॅश ऑन डिलिव्हरी (COD) ऑर्डर निश्चित करण्यासाठी किमान ₹२०० ॲडव्हान्स आवश्यक आहे. कृपया पुन्हा प्रयत्न करा.'
                : 'A minimum advance payment of ₹200 via Razorpay is required to confirm COD order. Please complete payment.')
            : (language === 'mr'
                ? 'पेमेंट रद्द करण्यात आले. आपण पुन्हा प्रयत्न करू शकता.'
                : 'Payment window was closed. You can retry payment.')
        );
      },
      onError: (err) => {
        setIsSubmitting(false);
        setPaymentNotice(
          language === 'mr'
            ? 'ऑनलाईन पेमेंटमध्ये अडचण आली. कृपया पुन्हा प्रयत्न करा किंवा मदतीसाठी ८४२११५४०९० वर संपर्क करा.'
            : 'Online payment error. Please try again or call 8421154090.'
        );
      }
    });
  };

  return (
    <div className="checkout-page" style={{ backgroundColor: '#F3F8F1', padding: '2.5rem 0 4.5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/cart"
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
            <span>{language === 'mr' ? 'कार्टकडे परत जा' : 'Back to Cart'}</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#006B2D', fontWeight: 800, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
          {language === 'mr' ? 'डिलिव्हरी पत्ता व पेमेंट तपशील' : 'Delivery & Secure Checkout'}
        </h1>

        {paymentNotice && (
          <div style={{
            backgroundColor: '#fff9e6',
            border: '1px solid #FFC928',
            color: '#785300',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#b38600' }} />
            <span>{paymentNotice}</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #F87171',
            borderRadius: '16px',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.5rem',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.1)',
            animation: 'shake 0.35s ease-in-out'
          }}>
            <AlertCircle size={26} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#991B1B', marginBottom: '0.35rem' }}>
                {language === 'mr'
                  ? 'कृपया ऑर्डर पुढे नेण्यासाठी आवश्यक माहिती पूर्ण भरा:'
                  : 'Please fill in the required delivery details to place order:'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6, fontSize: '0.9rem', color: '#B91C1C' }}>
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
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
                <ShieldCheck size={20} style={{ color: '#FFC928', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#006B2D' }}>{language === 'mr' ? 'डिलिव्हरी नंतरचे मोफत मार्गदर्शन:' : 'Post-Delivery Expert Regimen:'}</strong><br />
                  <span style={{ color: '#17251B' }}>
                    {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                  </span>
                </div>
              </div>

              {/* Personal Info Card */}
              <div className="checkout-card" style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #E1E9DF',
                boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? '१. लाभार्थी / ग्राहकाची माहिती' : '1. Customer Details'}
                  </h3>
                  {customerUser && (
                    <span style={{ fontSize: '0.74rem', backgroundColor: '#e2faea', color: '#006B2D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ {language === 'mr' ? 'खाते सक्रिय' : 'Logged In'}
                    </span>
                  )}
                </div>

                <div className="checkout-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-fullName">
                      {language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                    </label>
                    <input
                      id="input-fullName"
                      type="text"
                      className={`form-input ${errors.fullName ? 'input-has-error' : ''}`}
                      placeholder={language === 'mr' ? 'उदा. बाबासाहेब जाधव' : 'Ramesh Patil'}
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) {
                          setErrors(prev => { const n = { ...prev }; delete n.fullName; return n; });
                        }
                      }}
                    />
                    {errors.fullName && (
                      <div className="form-error">
                        <AlertCircle size={14} />
                        <span>{errors.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-phone">
                      {language === 'mr' ? '१० अंकी मोबाईल नंबर *' : 'Mobile Number *'}
                    </label>
                    <input
                      id="input-phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'input-has-error' : ''}`}
                      maxLength={10}
                      placeholder="8421154090"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                        if (errors.phone) {
                          setErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
                        }
                      }}
                    />
                    {errors.phone && (
                      <div className="form-error">
                        <AlertCircle size={14} />
                        <span>{errors.phone}</span>
                      </div>
                    )}
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
                border: '1px solid #E1E9DF',
                boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.2rem', color: '#006B2D', fontWeight: 800, marginBottom: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? '२. डिलिव्हरी पत्ता (Shipping Address)' : '2. Shipping Address'}
                </h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-address">
                    {language === 'mr' ? 'घर / फ्लॅट नं., गल्ली, इमारतीचे नाव, सविस्तर पत्ता *' : 'House / Street / Area Address *'}
                  </label>
                  <textarea
                    id="input-address"
                    rows={2}
                    className={`form-textarea ${errors.address ? 'input-has-error' : ''}`}
                    placeholder={language === 'mr' ? 'उदा. फ्लॅट नं. ४, शिवशंभू अपार्टमेंट, जनता बाजार जवळ' : 'Flat/House No, Building, Street...'}
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) {
                        setErrors(prev => { const n = { ...prev }; delete n.address; return n; });
                      }
                    }}
                  />
                  {errors.address && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      <span>{errors.address}</span>
                    </div>
                  )}
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
                    <label className="form-label" htmlFor="input-city">
                      {language === 'mr' ? 'शहर / गाव *' : 'City / Village *'}
                    </label>
                    <input
                      id="input-city"
                      type="text"
                      className={`form-input ${errors.city ? 'input-has-error' : ''}`}
                      placeholder={language === 'mr' ? 'उदा. कोल्हापूर' : 'Kolhapur'}
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (errors.city) {
                          setErrors(prev => { const n = { ...prev }; delete n.city; return n; });
                        }
                      }}
                    />
                    {errors.city && (
                      <div className="form-error">
                        <AlertCircle size={14} />
                        <span>{errors.city}</span>
                      </div>
                    )}
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
                    <label className="form-label" htmlFor="input-pincode">
                      {language === 'mr' ? '६ अंकी पिनकोड *' : 'Pincode *'}
                    </label>
                    <input
                      id="input-pincode"
                      type="text"
                      className={`form-input ${errors.pincode ? 'input-has-error' : ''}`}
                      placeholder="416001"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => {
                        setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') });
                        if (errors.pincode) {
                          setErrors(prev => { const n = { ...prev }; delete n.pincode; return n; });
                        }
                      }}
                    />
                    {errors.pincode && (
                      <div className="form-error">
                        <AlertCircle size={14} />
                        <span>{errors.pincode}</span>
                      </div>
                    )}
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
                border: '1px solid #E1E9DF',
                boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#006B2D', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {language === 'mr' ? '३. पेमेंट पर्याय (Payment Gateway)' : '3. Payment Method'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#006B2D', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Lock size={13} />
                    <span>256-Bit SSL Secure</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Option 1: Razorpay Online Payment */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '1.15rem',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: formData.paymentMethod === 'razorpay' ? '#006B2D' : '#E1E9DF',
                    backgroundColor: formData.paymentMethod === 'razorpay' ? '#e2faea' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.paymentMethod === 'razorpay' ? '0 4px 12px rgba(0, 107, 45, 0.08)' : 'none'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: '#006B2D', width: '18px', height: '18px', marginTop: '3px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                        <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.98rem' }}>
                          {language === 'mr' ? 'ऑनलाईन पेमेंट (Razorpay - संपूर्ण रक्कम)' : 'Online Payment (Razorpay - Full Amount)'}
                        </div>
                        <span style={{ fontSize: '0.8rem', backgroundColor: '#006B2D', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800 }}>
                          {language === 'mr' ? `एकूण रक्कम: ₹${grandTotal}` : `Grand Total: ₹${grandTotal}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5F6B61', marginTop: '0.3rem', lineHeight: 1.45 }}>
                        {language === 'mr' 
                          ? `UPI (Google Pay, PhonePe, Paytm), कार्ड किंवा नेटबँकिंग द्वारे त्वरित संपूर्ण ₹${grandTotal} भरा. डिलिव्हरीच्या वेळी काहीही देय नाही.` 
                          : `Pay full ₹${grandTotal} instantly via UPI, Cards, NetBanking. Zero payment upon delivery.`}
                      </div>
                    </div>
                  </label>

                  {/* Option 2: COD with ₹200 Advance */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '1.15rem',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: formData.paymentMethod === 'cod' ? '#006B2D' : '#E1E9DF',
                    backgroundColor: formData.paymentMethod === 'cod' ? '#fefce8' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.paymentMethod === 'cod' ? '0 4px 12px rgba(234, 179, 8, 0.12)' : 'none'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: '#006B2D', width: '18px', height: '18px', marginTop: '3px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                        <div style={{ fontWeight: 800, color: formData.paymentMethod === 'cod' ? '#854d0e' : '#17251B', fontSize: '0.98rem' }}>
                          {language === 'mr' ? 'कॅश ऑन डिलिव्हरी (COD - किमान ₹२०० ॲडव्हान्स)' : 'Cash on Delivery (COD - Min. ₹200 Advance)'}
                        </div>
                        <span style={{ fontSize: '0.8rem', backgroundColor: '#eab308', color: '#78350f', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800 }}>
                          {language === 'mr' ? 'किमान ॲडव्हान्स: ₹२००' : 'Min. Advance: ₹200'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5F6B61', marginTop: '0.3rem', lineHeight: 1.45 }}>
                        {language === 'mr' 
                          ? `ऑर्डर निश्चित करण्यासाठी किमान ₹२०० ॲडव्हान्स Razorpay द्वारे भरावे लागतील. उर्वरित रक्कम (₹${codBalanceDue}) पार्सल हातात आल्यावर रोख द्या.` 
                          : `Pay a minimum advance of ₹200 via Razorpay to confirm booking. Pay remaining ₹${codBalanceDue} in cash upon delivery.`}
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
                border: '1px solid #E1E9DF',
                boxShadow: '0 4px 15px rgba(0, 107, 45, 0.04)',
                position: 'sticky',
                top: '5.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', color: '#006B2D', fontWeight: 800, marginBottom: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                  {language === 'mr' ? 'ऑर्डर सारांश' : 'Order Review'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', borderBottom: '1px solid #E1E9DF', paddingBottom: '0.45rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#17251B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {language === 'mr' ? item.nameMr : item.nameEn}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#5F6B61' }}>
                          {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#006B2D', flexShrink: 0, marginLeft: '0.5rem' }}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5F6B61' }}>
                    <span>{language === 'mr' ? 'उपएकूण' : 'Subtotal'}</span>
                    <span style={{ fontWeight: 700, color: '#17251B' }}>₹{subtotal}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5F6B61' }}>
                    <span>{language === 'mr' ? 'डिलिव्हरी' : 'Delivery'}</span>
                    <span style={{ fontWeight: 700, color: '#006B2D' }}>
                      {deliveryCharges === 0 ? (language === 'mr' ? 'मोफत (FREE)' : 'FREE') : `₹${deliveryCharges}`}
                    </span>
                  </div>

                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '2px dashed #E1E9DF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#006B2D'
                  }}>
                    <span>{language === 'mr' ? 'एकूण ऑर्डर रक्कम (Grand Total)' : 'Grand Total'}</span>
                    <span>₹{grandTotal}</span>
                  </div>

                  {/* Payment Breakdown according to method */}
                  {formData.paymentMethod === 'cod' ? (
                    <div style={{
                      marginTop: '0.65rem',
                      backgroundColor: '#fefce8',
                      border: '1.5px solid #fef08a',
                      borderRadius: '12px',
                      padding: '0.75rem 0.85rem',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#854d0e', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <span>{language === 'mr' ? 'आता देय किमान ॲडव्हान्स (Razorpay):' : 'Min. Advance Payable (Razorpay):'}</span>
                        <span style={{ fontSize: '1.05rem', color: '#006B2D' }}>₹{codAdvanceAmount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#713f12', fontWeight: 600 }}>
                        <span>{language === 'mr' ? 'डिलिव्हरीच्या वेळी रोख देय शिल्लक:' : 'Cash to Pay on Delivery:'}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{codBalanceDue}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '0.65rem',
                      backgroundColor: '#e2faea',
                      border: '1.5px solid #b8eec8',
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.85rem',
                      color: '#006B2D',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{language === 'mr' ? 'आता ऑनलाईन देय रक्कम (Grand Total):' : 'Payable Now via Razorpay:'}</span>
                      <span style={{ fontSize: '1.1rem' }}>₹{grandTotal}</span>
                    </div>
                  )}
                </div>

                {/* Immediate Warning Box right above the action button */}
                {Object.keys(errors).length > 0 && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1.5px solid #F87171',
                      borderRadius: '14px',
                      padding: '0.85rem 1rem',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.1)',
                      animation: 'shake 0.35s ease-in-out'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#991B1B', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      <AlertCircle size={17} style={{ color: '#DC2626', flexShrink: 0 }} />
                      <span>
                        {language === 'mr' ? 'कृपया आवश्यक माहिती पूर्ण भरा:' : 'Please fill required details:'}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#B91C1C', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    marginBottom: '0.5rem',
                    backgroundColor: '#006B2D',
                    borderColor: '#006B2D',
                    boxShadow: '0 4px 14px rgba(0, 107, 45, 0.25)',
                    padding: '0.85rem 1rem'
                  }}
                >
                  {formData.paymentMethod === 'razorpay' ? <Zap size={18} /> : <CreditCard size={18} />}
                  <span>
                    {isSubmitting
                      ? (language === 'mr' ? 'पेमेंट विंडो उघडत आहे...' : 'Launching Payment Window...')
                      : formData.paymentMethod === 'razorpay'
                      ? (language === 'mr' ? `Razorpay ने ऑनलाईन भरा (₹${grandTotal})` : `Pay with Razorpay (₹${grandTotal})`)
                      : (language === 'mr' ? `₹२०० ॲडव्हान्स भरा व COD कन्फर्म करा` : `Pay ₹200 Advance & Confirm COD`)}
                  </span>
                </button>

                {formData.paymentMethod === 'cod' && (
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#854d0e', marginBottom: '0.75rem', fontWeight: 600 }}>
                    {language === 'mr'
                      ? `(उर्वरित ₹${codBalanceDue} पार्सल हातात आल्यावर रोख द्या)`
                      : `(Remaining ₹${codBalanceDue} to be paid in cash upon delivery)`}
                  </div>
                )}

                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#5F6B61', lineHeight: 1.4 }}>
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

        .input-has-error {
          border-color: #EF4444 !important;
          background-color: #FEF2F2 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }

        .form-error {
          color: #DC2626;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        @media (max-width: 960px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }

        @media (max-width: 640px) {
          .checkout-layout-grid {
            gap: 1rem !important;
          }
          .checkout-card {
            padding: 1rem 0.85rem !important;
            border-radius: 14px !important;
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
