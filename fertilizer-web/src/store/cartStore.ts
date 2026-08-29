import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discountPercent: number;
  discountAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShippingFee: () => number;
  getTax: () => number;
  getTotal: () => number;
}

const savedCartStr = localStorage.getItem('krishi_cart');
let initialItems: CartItem[] = [];
if (savedCartStr) {
  try {
    initialItems = JSON.parse(savedCartStr);
  } catch (e) {
    console.error("Failed to parse cart:", e);
  }
}

const saveCart = (items: CartItem[]) => {
  localStorage.setItem('krishi_cart', JSON.stringify(items));
};

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,
  isOpen: false,
  couponCode: '',
  discountPercent: 0,
  discountAmount: 0,

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(item => item.product.id === product.id);
      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = [...state.items];
        newItems[existingIndex].quantity += quantity;
      } else {
        newItems = [...state.items, { product, quantity }];
      }
      saveCart(newItems);
      return { items: newItems, isOpen: true };
    });
  },

  updateQty: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.product.id !== productId);
        saveCart(newItems);
        return { items: newItems };
      }
      const newItems = state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter(item => item.product.id !== productId);
      saveCart(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('krishi_cart');
    set({ items: [], couponCode: '', discountPercent: 0, discountAmount: 0 });
  },

  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  setDrawerOpen: (isOpen) => set({ isOpen }),

  applyCoupon: (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'KRISHI10') {
      set({ couponCode: 'KRISHI10', discountPercent: 10, discountAmount: 0 });
      return true;
    } else if (cleanCode === 'FARMER100') {
      set({ couponCode: 'FARMER100', discountPercent: 0, discountAmount: 100 });
      return true;
    }
    return false;
  },

  removeCoupon: () => set({ couponCode: '', discountPercent: 0, discountAmount: 0 }),

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },

  getDiscount: () => {
    const subtotal = get().getSubtotal();
    const { discountPercent, discountAmount } = get();
    if (discountPercent > 0) {
      return (subtotal * discountPercent) / 100;
    }
    return Math.min(discountAmount, subtotal);
  },

  getShippingFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 2000 ? 0 : 50;
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    return Math.round(((subtotal - discount) * 0.18) * 100) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const shipping = get().getShippingFee();
    const tax = get().getTax();
    return Math.max(0, subtotal - discount + shipping + tax);
  }
}));
