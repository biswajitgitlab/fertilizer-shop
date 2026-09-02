import { create } from 'zustand';
import { Product } from '../types';
import { productApi } from '../api/productApi';

interface RecentlyViewedState {
  items: Product[];
  isSyncedWithServer: boolean;
  fetchRecentlyViewed: () => Promise<void>;
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

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  items: initialItems,
  isSyncedWithServer: false,

  fetchRecentlyViewed: async () => {
    const token = localStorage.getItem('krishi_auth_token');
    if (!token) return;

    try {
      const serverItems = await productApi.getRecentlyViewed();
      if (Array.isArray(serverItems) && serverItems.length > 0) {
        // Merge server items with local storage items without duplicates
        const currentItems = get().items;
        const mergedMap = new Map<string, Product>();
        
        // Add server items first
        serverItems.forEach(item => {
          if (item && item.id) mergedMap.set(String(item.id), item);
        });
        
        // Add local items if not already in server items
        currentItems.forEach(item => {
          if (item && item.id && !mergedMap.has(String(item.id))) {
            mergedMap.set(String(item.id), item);
          }
        });

        const merged = Array.from(mergedMap.values()).slice(0, 15);
        saveRecentlyViewed(merged);
        set({ items: merged, isSyncedWithServer: true });

        // Push local items to server if needed
        const ids = merged.map(p => p.id);
        productApi.syncRecentlyViewed(ids);
      } else if (get().items.length > 0) {
        const ids = get().items.map(p => p.id);
        productApi.syncRecentlyViewed(ids);
        set({ isSyncedWithServer: true });
      }
    } catch (e) {
      console.error("Failed to fetch recently viewed items from server:", e);
    }
  },

  addRecentlyViewed: (product) => {
    if (!product || !product.id) return;
    set((state) => {
      const filtered = state.items.filter(item => String(item.id) !== String(product.id));
      const updated = [product, ...filtered].slice(0, 15);
      saveRecentlyViewed(updated);

      const token = localStorage.getItem('krishi_auth_token');
      if (token) {
        productApi.syncRecentlyViewed(updated.map(p => p.id));
      }

      return { items: updated };
    });
  },

  clearRecentlyViewed: () => {
    localStorage.removeItem('krishi_recently_viewed');
    set({ items: [], isSyncedWithServer: false });

    const token = localStorage.getItem('krishi_auth_token');
    if (token) {
      productApi.clearRecentlyViewedBackend();
    }
  }
}));

