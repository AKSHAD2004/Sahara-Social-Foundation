import crypto from 'crypto';

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

    const {
      order_id,
      payment_id,
      signature,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body || {};

    const effectiveOrderId = String(order_id || razorpay_order_id || '').trim();
    const effectivePaymentId = String(payment_id || razorpay_payment_id || '').trim();
    const effectiveSignature = String(signature || razorpay_signature || '').trim();

    if (!effectiveOrderId || !effectivePaymentId || !effectiveSignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: order_id, payment_id, and signature are required.'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: 'RAZORPAY_KEY_SECRET is not configured on the server.'
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${effectiveOrderId}|${effectivePaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    // Secure timing-safe comparison
    const expectedBuf = Buffer.from(generatedSignature, 'utf-8');
    const receivedBuf = Buffer.from(effectiveSignature, 'utf-8');

    const isMatch =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isMatch) {
      console.warn(`[Razorpay Signature Mismatch] Order: ${effectiveOrderId}, Payment: ${effectivePaymentId}`);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch. Do not mark order as paid.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment signature verified successfully',
      order_id: effectiveOrderId,
      payment_id: effectivePaymentId
    });
  } catch (error) {
    console.error('Razorpay Signature Verification Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during signature verification'
    });
  }
}
