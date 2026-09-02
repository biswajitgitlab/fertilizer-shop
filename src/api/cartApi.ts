import { apiClient } from './axiosInstances';

export const cartApi = {
  getCart: async (coupon?: string) => {
    try {
      const res = await apiClient.get('/cart', { params: { coupon } });
      return res.data;
    } catch (e) {
      return { items: [] };
    }
  },

  addToCart: async (productId: string | number, qty: number) => {
    try {
      const res = await apiClient.post('/cart/add', { product_id: productId, qty });
      return res.data;
    } catch (e) {
      return null;
    }
  },

  updateCartItem: async (productId: string | number, qty: number) => {
    try {
      const res = await apiClient.put(`/cart/update/${productId}`, { qty });
      return res.data;
    } catch (e) {
      return null;
    }
  },

  removeCartItem: async (productId: string | number) => {
    try {
      const res = await apiClient.delete(`/cart/remove/${productId}`);
      return res.data;
    } catch (e) {
      return null;
    }
  },

  clearCart: async () => {
    try {
      const res = await apiClient.post('/cart/clear');
      return res.data;
    } catch (e) {
      return null;
    }
  },

  syncCart: async (items: Array<{ product_id: string | number; qty: number; bundle_id?: number }>, coupon?: string) => {
    try {
      const res = await apiClient.post('/cart/sync', { items, coupon });
      return res.data;
    } catch (e) {
      return null;
    }
  },

  applyCoupon: async (code: string) => {
    try {
      const res = await apiClient.post('/cart/apply-coupon', { code });
      return res.data;
    } catch (e) {
      if (code.toUpperCase() === 'KRISHI10') {
        return { valid: true, discountPercent: 10, code: 'KRISHI10' };
      }
      return { valid: false, message: 'Invalid coupon' };
    }
  }
};
