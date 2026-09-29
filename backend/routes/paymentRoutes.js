import express from 'express';
import { 
  handleCreateOrder, 
  handleCreateQrOrder,
  handleVerifyPayment, 
  handleRefundPayment,
  handleGetPaymentStatus, 
  handleGetPaymentByBooking,
  handleWebhook 
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// The webhook uses raw body parsing
router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), handleWebhook);

// Payment order lifecycle
router.post('/create-order', protect, handleCreateOrder);
router.post('/create-qr', protect, handleCreateQrOrder);
router.post('/verify', protect, handleVerifyPayment);

// Payment details & reconciliation
router.get('/:paymentId/status', protect, handleGetPaymentStatus);
router.get('/booking/:bookingId', protect, handleGetPaymentByBooking);

// Refunds (Protected by admin or authorized actor)
router.post('/:paymentId/refund', protect, handleRefundPayment);

export default router;
