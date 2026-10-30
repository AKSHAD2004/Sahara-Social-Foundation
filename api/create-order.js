import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    const { amount, currency = 'INR', receipt, notes } = body || {};

    // Validate amount: Minimum amount is 100 paise (₹1)
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount is 100 paise (₹1).'
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(401).json({
        error: 'Razorpay API credentials are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.'
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: parsedAmount, // in paise
      currency: currency || 'INR',
      receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes: notes || {}
    };

    let order = null;
    try {
      order = await razorpay.orders.create(options);
    } catch (apiErr) {
      console.warn('[Razorpay API Warning] Direct server order creation fallback:', apiErr?.error?.description || apiErr?.message);
      // When Razorpay API credentials are not linked or order creation is rejected, return null order_id
      // so client-side Standard Checkout can process payment directly with the Key ID without invalid order_id errors
      return res.status(200).json({
        order_id: null,
        amount: parsedAmount,
        currency: currency || 'INR',
        receipt: options.receipt
      });
    }

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    const statusCode = error.statusCode || error.status || 500;
    return res.status(statusCode).json({
      error: error.error?.description || error.message || 'Internal Server Error while creating Razorpay order'
    });
  }
}
