import { 
  createOrder, 
  createQrOrder, 
  verifyPayment, 
  processWebhook, 
  refundPayment, 
  reconcilePayment 
} from '../services/paymentService.js';
import Payment from '../models/Payment.js';

export const handleCreateOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId required' });
    
    const userId = req.user.id || req.user._id;
    const payment = await createOrder(bookingId, userId);
    
    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        razorpayOrderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleCreateQrOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId required' });

    const userId = req.user.id || req.user._id;
    const qrData = await createQrOrder(bookingId, userId);

    res.json({ success: true, data: qrData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleVerifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, method } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing verification parameters' });
    }

    const userId = req.user.id || req.user._id;
    const payment = await verifyPayment(
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      method || 'card'
    );
    
    res.json({ success: true, message: 'Payment verified', data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleRefundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const user = req.user;
    const isAdmin = user.role === 'admin';

    const payment = await refundPayment(paymentId, amount, reason, user, isAdmin);
    res.json({ success: true, message: 'Refund processed successfully', data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.body.toString('utf8');
    const signature = req.headers['x-razorpay-signature'];
    const eventId = req.headers['x-razorpay-event-id'];

    if (!signature || !eventId) {
      return res.status(400).json({ success: false, message: 'Missing headers' });
    }

    await processWebhook(rawBody, signature, eventId);
    res.status(200).json({ success: true });
  } catch (error) {
    if (error.message.includes('Invalid webhook signature')) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    res.status(200).json({ success: true, message: 'Event logged/handled with error' });
  }
};

export const handleGetPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id || req.user._id;
    const isAdmin = req.user.role === 'admin';

    const payment = await reconcilePayment(paymentId, userId, isAdmin);
    
    res.json({
      success: true,
      data: {
        status: payment.status,
        bookingId: payment.bookingId,
        amount: payment.amount,
        financialBreakdown: payment.financialBreakdown
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleGetPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id;
    const isAdmin = req.user.role === 'admin';

    const payment = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment record found for this booking' });
    }

    if (!isAdmin && payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
