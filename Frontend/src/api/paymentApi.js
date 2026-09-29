import api from './api';

export const createPaymentOrder = async (bookingId, options = {}) => {
  const response = await api.post('/payments/create-order', { bookingId, ...options });
  // Ensure both response.data.data.razorpayOrderId and response.data.orderId work seamlessly
  const res = response.data;
  if (res && res.orderId && !res.data) {
    res.data = {
      razorpayOrderId: res.orderId,
      amount: res.amount,
      currency: res.currency || 'INR',
      keyId: res.keyId
    };
  }
  return res;
};

// Component compatibility alias
export const createOrder = createPaymentOrder;

export const createPaymentQr = async (bookingId) => {
  const response = await api.post('/payments/create-qr', { bookingId });
  return response.data;
};

export const verifyPaymentSignature = async (arg1, arg2, arg3) => {
  let payload = {};
  if (typeof arg1 === 'object' && arg1 !== null) {
    payload = arg1;
  } else {
    payload = {
      razorpay_order_id: arg1,
      razorpay_payment_id: arg2,
      razorpay_signature: arg3
    };
  }

  const response = await api.post('/payments/verify', payload);
  return response.data;
};

// Component compatibility alias
export const verifyPayment = verifyPaymentSignature;

export const getPaymentStatus = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}/status`);
  return response.data;
};

export const getPaymentByBookingId = async (bookingId) => {
  const response = await api.get(`/payments/booking/${bookingId}`);
  return response.data;
};

export const requestRefund = async (paymentId, amount, reason) => {
  const response = await api.post(`/payments/${paymentId}/refund`, { amount, reason });
  return response.data;
};

export default {
  createOrder,
  createPaymentOrder,
  createPaymentQr,
  verifyPayment,
  verifyPaymentSignature,
  getPaymentStatus,
  getPaymentByBookingId,
  requestRefund
};

