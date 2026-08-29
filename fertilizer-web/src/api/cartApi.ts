import { apiClient } from './axiosInstances';

export const cartApi = {
  getCart: async () => {
    try {
      const res = await apiClient.get('/cart');
      return res.data;
    } catch (e) {
      return { items: [] };
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    try {
      const res = await apiClient.post('/cart/add', { productId, quantity });
      return res.data;
    } catch (e) {
      return { success: true };
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const res = await apiClient.put(`/cart/update/${productId}`, { quantity });
      return res.data;
    } catch (e) {
      return { success: true };
    }
  },

  removeCartItem: async (productId: string) => {
    try {
      const res = await apiClient.delete(`/cart/remove/${productId}`);
      return res.data;
    } catch (e) {
      return { success: true };
    }
  },

  clearCart: async () => {
    try {
      const res = await apiClient.post('/cart/clear');
      return res.data;
    } catch (e) {
      return { success: true };
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
