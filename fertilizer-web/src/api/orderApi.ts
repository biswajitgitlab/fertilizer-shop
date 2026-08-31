import { apiClient } from './axiosInstances';
import { Order } from '../types';

export const orderApi = {
  getOrders: async () => {
    try {
      const res = await apiClient.get('/orders');
      const data = res.data;
      let list: any[] = [];
      if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      }
      return list;
    } catch (e) {
      console.warn("Failed to fetch customer orders from API:", e);
      return [];
    }
  },

  getOrder: async (id: string) => {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      const data = res.data;
      if (data && data.order) {
        return {
          ...data.order,
          timeline: data.timeline
        };
      }
      return data;
    } catch (e) {
      throw new Error("Order not found");
    }
  },

  createOrder: async (orderData: any) => {
    try {
      const formattedItems = (orderData.items || []).map((item: any) => ({
        product_id: item.product?.id || item.product_id || item.id,
        qty: item.quantity || item.qty || 1,
        bundle_id: item.bundle_id || null
      }));

      const payload = {
        ...orderData,
        items: formattedItems,
        shipping_address: orderData.shippingAddress || orderData.shipping_address,
        payment_method: orderData.paymentMethod === 'Cash on Delivery' ? 'COD' : (orderData.paymentMethod === 'Online Payment' ? 'ONLINE' : orderData.paymentMethod || 'COD')
      };

      const res = await apiClient.post('/orders', payload);
      const data = res.data;
      if (data && data.order) {
        return {
          ...data.order,
          id: data.order.id || data.id,
          paymentLink: data.payment_link
        };
      }
      return data;
    } catch (e: any) {
      console.error("API createOrder failed:", e);
      const msg = e.response?.data?.message || e.message || "Failed to place order. Please try again.";
      throw new Error(msg);
    }
  },

  cancelOrder: async (id: string | number, reason?: string) => {
    try {
      const res = await apiClient.post(`/orders/${id}/cancel`, { reason });
      return res.data;
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to cancel order';
      throw new Error(msg);
    }
  },

  completePayment: async (orderId: string | number, paymentData?: any) => {
    try {
      const res = await apiClient.post(`/orders/${orderId}/verify-payment`, paymentData || { gateway: 'ONLINE', transaction_id: `TXN-PAY-${Math.floor(10000000 + Math.random() * 90000000)}` });
      return res.data;
    } catch (e) {
      console.error("Payment error:", e);
      return { status: 'PAID' };
    }
  },

  markPaymentFailed: async (orderId: string | number, payload?: any) => {
    try {
      const res = await apiClient.post(`/orders/${orderId}/payment-failed`, payload || {});
      return res.data;
    } catch (e) {
      return { status: 'FAILED' };
    }
  },

  switchToCod: async (orderId: string | number) => {
    try {
      const res = await apiClient.post(`/orders/${orderId}/switch-cod`);
      return res.data;
    } catch (e) {
      return { payment_method: 'COD', payment_status: 'PENDING', status: 'CONFIRMED' };
    }
  },

  verifyPayment: async (orderId: string | number, paymentData?: any) => {
    try {
      const res = await apiClient.post(`/orders/${orderId}/verify-payment`, paymentData || {});
      return res.data;
    } catch (e) {
      return { status: 'PAID' };
    }
  },

  createRazorpayOrder: async (amountInPaise: number, currency = 'INR', receipt?: string) => {
    const res = await apiClient.post('/create-order', {
      amount: amountInPaise,
      currency,
      receipt
    });
    return res.data;
  },

  verifyRazorpayPayment: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id?: string | number;
  }) => {
    const res = await apiClient.post('/verify-payment', payload);
    return res.data;
  },

  getOrderById: async (id: string) => orderApi.getOrder(id),
  getMyOrders: async () => orderApi.getOrders()
};

