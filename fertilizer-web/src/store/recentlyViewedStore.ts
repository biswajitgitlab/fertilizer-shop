import { create } from 'zustand';
import { Product } from '../types';

interface RecentlyViewedState {
  items: Product[];
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const savedItemsStr = localStorage.getItem('krishi_recently_viewed');
let initialItems: Product[] = [];
if (savedItemsStr) {
  try {
    initialItems = JSON.parse(savedItemsStr);
  } catch (e) {
    console.error("Failed to parse recently viewed items:", e);
  }
}

const saveRecentlyViewed = (items: Product[]) => {
  localStorage.setItem('krishi_recently_viewed', JSON.stringify(items));
};

export const useRecentlyViewedStore = create<RecentlyViewedState>((set) => ({
  items: initialItems,

  addRecentlyViewed: (product) => {
    if (!product || !product.id) return;
    set((state) => {
      // Remove existing occurrence if present
      const filtered = state.items.filter(item => String(item.id) !== String(product.id));
      // Prepend newest item
      const updated = [product, ...filtered].slice(0, 15);
      saveRecentlyViewed(updated);
      return { items: updated };
    });
  },

  clearRecentlyViewed: () => {
    localStorage.removeItem('krishi_recently_viewed');
    set({ items: [] });
  }
}));
