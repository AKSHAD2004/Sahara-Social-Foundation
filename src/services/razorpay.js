// Razorpay Payment Gateway Integration Service for Sahara Social Foundation
// Supports dynamic script loading, environment variable configuration, and seamless checkout popup

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Dynamically loads the Razorpay SDK script if not already loaded in the document.
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Retrieves the configured Razorpay Key ID from Vite env or fallback.
 */
export function getRazorpayKeyId() {
  return (
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    localStorage.getItem('sahara_razorpay_key_id') ||
    'rzp_test_TStMSRZCVUy6Aw' // Your active Razorpay Test Key ID
  );
}

/**
 * Initiates a Razorpay payment modal flow.
 * 
 * @param {Object} options
 * @param {number} options.amountInRupees - Order total in INR (e.g. 1499)
 * @param {string} options.orderId - System Order Reference ID (e.g. 'ORD-2026-8491')
 * @param {Object} options.customer - Customer details { fullName, phone, email, address }
 * @param {string} options.notes - Optional notes/health details
 * @param {Function} options.onSuccess - Callback receiving { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {Function} options.onDismiss - Callback when user closes payment modal
 * @param {Function} options.onError - Callback when error occurs
 */
export async function initializeRazorpayPayment({
  amountInRupees = 0,
  orderId = '',
  description = '',
  customer = {},
  notes = {},
  onSuccess = () => {},
  onDismiss = () => {},
  onError = () => {}
}) {
  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded || !window.Razorpay) {
    onError(new Error('Razorpay payment gateway SDK could not be loaded. Please check your internet connection.'));
    return;
  }

  const keyId = getRazorpayKeyId();
  const amountInPaise = Math.round(Number(amountInRupees) * 100);
  const cleanPhone = (customer.phone || customer.mobileNumber || '').replace(/\D/g, '').slice(-10);

  console.log(`[Razorpay Checkout] Opening payment with Key ID: ${keyId}, Amount: ₹${amountInRupees} (${amountInPaise} paise)`);

  const options = {
    key: keyId,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Sahara Social Foundation',
    description: description || `Nutraceutical Order #${orderId}`,
    image: typeof window !== 'undefined' ? `${window.location.origin}/sahara-logo.jpg` : '/sahara-logo.jpg',
    notes: {
      orderId: orderId,
      customerCity: customer.city || '',
      ...notes
    },
    prefill: {
      name: customer.fullName || customer.name || '',
      contact: cleanPhone || '',
      email: customer.email || ''
    },
    theme: {
      color: '#006B2D',
      backdrop_color: 'rgba(0, 107, 45, 0.7)'
    },
    modal: {
      ondismiss: () => {
        if (typeof onDismiss === 'function') onDismiss();
      },
      escape: true,
      animation: true
    },
    handler: function (response) {
      if (typeof onSuccess === 'function') {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id || null,
          signature: response.razorpay_signature || null,
          method: 'Razorpay Online (UPI/Cards/NetBanking)',
          paidAt: new Date().toISOString()
        });
      }
    }
  };

  try {
    const rzpInstance = new window.Razorpay(options);
    rzpInstance.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response.error);
      if (typeof onError === 'function') {
        onError(response.error);
      }
    });
    rzpInstance.open();
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    if (typeof onError === 'function') {
      onError(err);
    }
  }
}
