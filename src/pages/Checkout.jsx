import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';
import { dbService } from '../services/db';

const Checkout = () => {
  const { cartItems, subtotal, deliveryCharges, grandTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    altPhone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    paymentMethod: 'cod',
    healthNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#f8fafc', padding: '5rem 0', minHeight: '60vh', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#064e3b', fontWeight: 800, marginBottom: '1rem' }}>
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

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const activeRefCode = localStorage.getItem('sahara_active_ref') || '';
    const users = dbService.getAll('users');
    const matchingAffiliate = users.find((u) => u.referralCode && u.referralCode.toUpperCase() === activeRefCode.toUpperCase());

    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

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
      leadSource: activeRefCode ? 'Affiliate' : 'Website',
      assignedEmployee: 'usr_emp_akash',
      assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
      customerStatus: 'New',
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
      paymentStatus: formData.paymentMethod === 'online' ? 'Paid' : 'Pending',
      orderStatus: 'Confirmed',
      assignedEmployee: 'usr_emp_akash',
      assignedAffiliate: matchingAffiliate ? matchingAffiliate.id : '',
      affiliateName: matchingAffiliate ? matchingAffiliate.name : '',
      commissionStatus: 'Pending Delivery',
      orderDate: new Date().toISOString(),
      deliveredDate: null,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      paymentMethod: formData.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'
    };

    dbService.add('orders', crmOrder);

    // 4. Add CRM Notification
    dbService.addNotification({
      title: 'New Website Order Placed',
      message: `Order ${orderId} placed by ${formData.fullName} (₹${grandTotal}).`,
      type: 'order',
      link: '/crm/orders'
    });

    const orderDetails = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cartItems],
      customer: { ...formData },
      pricing: { subtotal, deliveryCharges, grandTotal },
      paymentMethod: formData.paymentMethod,
      status: 'Confirmed'
    };

    // Store in localStorage for Order confirmation page
    localStorage.setItem('ssf_last_order', JSON.stringify(orderDetails));

    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      navigate('/order-confirmation', { state: { order: orderDetails } });
    }, 600);
  };

  return (
    <div className="checkout-page" style={{ backgroundColor: '#f8fafc', padding: '3rem 0 5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/cart"
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
            <span>{language === 'mr' ? 'कार्टकडे परत जा' : 'Back to Cart'}</span>
          </Link>
        </div>

        <h1 style={{ fontSize: '2.2rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.5rem' }}>
          {language === 'mr' ? 'डिलिव्हरी पत्ता व पेमेंट तपशील' : 'Delivery & Checkout'}
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.35fr 0.85fr',
            gap: '2.5rem',
            alignItems: 'flex-start'
          }} className="checkout-layout-grid">
            {/* Left Column: Delivery Details */}
            <div>
              {/* Mandatory Guideline Banner */}
              <div className="notice-strip" style={{ marginBottom: '1.75rem' }}>
                <ShieldCheck size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{language === 'mr' ? 'डिलिव्हरी नंतरचे मार्गदर्शन:' : 'Post-Delivery Notice:'}</strong><br />
                  {language === 'mr' ? organizationInfo.contact.orderGuidelineNoteMr : organizationInfo.contact.orderGuidelineNote}
                </div>
              </div>

              {/* Personal Info Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                marginBottom: '1.75rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
                  {language === 'mr' ? '१. ग्राहक माहिती (Personal Details)' : '1. Customer Details'}
                </h3>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={language === 'mr' ? 'उदा. बाबासाहेब जाधव' : 'e.g. Babasaheb Jadhav'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'प्राथमिक मोबाईल नंबर *' : 'Primary Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {language === 'mr' ? 'पर्यायी फोन (पर्यायी)' : 'Alternative Phone (Optional)'}
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      maxLength={10}
                      value={formData.altPhone}
                      onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'ईमेल (पर्यायी)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Shipping Address Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                marginBottom: '1.75rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              {/* Payment Method Option */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.25rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
                  {language === 'mr' ? '३. पेमेंट पर्याय (Payment Method)' : '3. Payment Option'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* COD */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: formData.paymentMethod === 'cod' ? '#059669' : '#e2e8f0',
                    backgroundColor: formData.paymentMethod === 'cod' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#064e3b' }}>
                        {language === 'mr' ? 'कॅश ऑन डिलिव्हरी (Cash on Delivery)' : 'Cash on Delivery (COD)'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {language === 'mr' ? 'पार्सल हातात आल्यावर पैसे द्या' : 'Pay when the parcel arrives at your door'}
                      </div>
                    </div>
                  </label>

                  {/* UPI / Online placeholder */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: formData.paymentMethod === 'upi' ? '#059669' : '#e2e8f0',
                    backgroundColor: formData.paymentMethod === 'upi' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#064e3b' }}>
                        {language === 'mr' ? 'ऑनलाईन UPI / PhonePe / GPay' : 'Online UPI / PhonePe / Google Pay'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {language === 'mr' ? 'ऑर्डर पुष्टीकरणानंतर थेट UPI द्वारे पेमेंट' : 'Direct UPI verification support'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review */}
            <div>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                position: 'sticky',
                top: '6rem'
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#064e3b', fontWeight: 800, marginBottom: '1.25rem' }}>
                  {language === 'mr' ? 'ऑर्डर सारांश' : 'Order Review'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {language === 'mr' ? item.nameMr : item.nameEn}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#064e3b' }}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>{language === 'mr' ? 'उपएकूण' : 'Subtotal'}</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{subtotal}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>{language === 'mr' ? 'डिलिव्हरी' : 'Delivery'}</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      {deliveryCharges === 0 ? 'मोफत (FREE)' : `₹${deliveryCharges}`}
                    </span>
                  </div>

                  <div style={{
                    paddingTop: '0.85rem',
                    borderTop: '2px dashed #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#064e3b'
                  }}>
                    <span>{language === 'mr' ? 'एकूण देय रक्कम' : 'Final Amount'}</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: '1.25rem' }}
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {isSubmitting
                      ? (language === 'mr' ? 'ऑर्डर नोंदवत आहे...' : 'Placing Order...')
                      : (language === 'mr' ? `ऑर्डर कन्फर्म करा (₹${grandTotal})` : `Confirm Order (₹${grandTotal})`)}
                  </span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
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
        @media (max-width: 960px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
