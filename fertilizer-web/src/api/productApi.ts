import { publicApi } from './axiosInstances';
import { INITIAL_PRODUCTS, CATEGORIES } from '../utils/constants';

export const mapProduct = (p: any): any => {
  if (!p) return p;

  const rawAvg = p.reviews_avg_rating !== null && p.reviews_avg_rating !== undefined
    ? Number(p.reviews_avg_rating)
    : (p.rating !== undefined ? Number(p.rating) : 0);

  const rating = rawAvg > 0 ? Number(rawAvg.toFixed(1)) : 0;

  const rawCount = p.reviews_count !== null && p.reviews_count !== undefined
    ? Number(p.reviews_count)
    : (p.reviewsCount !== undefined ? Number(p.reviewsCount) : 0);

  const reviewsCount = rawCount > 0 ? rawCount : 0;

  return {
    ...p,
    id: p.id?.toString(),
    category: p.category?.name || p.categorySlug || 'Uncategorized',
    categorySlug: p.category?.slug || p.categorySlug || '',
    price: Number(p.price) || 0,
    originalPrice: Number(p.discount_price) || Number(p.price) || 0,
    stock: p.stock_qty !== undefined ? Number(p.stock_qty) : (Number(p.stock) || 0),
    images: Array.isArray(p.images_json) && p.images_json.length > 0 ? p.images_json : (Array.isArray(p.images) && p.images.length > 0 ? p.images : []),
    suitableCrops: Array.isArray(p.suitable_crops_json) ? p.suitable_crops_json : (p.suitableCrops || []),
    npk: p.composition_json || p.npk,
    description: p.description || '',
    shortDescription: p.short_desc || p.shortDescription || '',
    usageInstructions: p.usage_instructions || p.usageInstructions || '',
    rating,
    reviewsCount,
    viewsCount: p.views_count !== undefined ? Number(p.views_count) : (Number(p.viewsCount) || 0),
    unit: p.unit || '',
  };
};

export const productApi = {
  getProducts: async (params?: Record<string, any>) => {
    try {
      const res = await publicApi.get('/products', { params });
      const rawProducts = res.data.data || res.data;
      const products = Array.isArray(rawProducts) ? rawProducts.map(mapProduct) : [];
      return {
        products,
        total: res.data.total || products.length,
        categories: CATEGORIES
      };
    } catch (e) {
      let filtered = [...INITIAL_PRODUCTS];
      if (params?.category) {
        filtered = filtered.filter(p => p.categorySlug === params.category || p.category === params.category);
      }
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        let terms = [q];
        if (['urea', 'nitrogen'].includes(q)) terms.push('urea', 'nitrogen');
        if (['dap', 'phosphate'].includes(q)) terms.push('dap', 'phosphate');
        if (['potash', 'mop'].includes(q)) terms.push('potash', 'mop');
        if (['paddy', 'rice'].includes(q)) terms.push('paddy', 'rice');

        filtered = filtered.filter(p => {
          const text = `${p.name} ${p.category} ${p.categorySlug} ${p.description} ${p.shortDescription || ''} ${(p.suitableCrops || []).join(' ')}`.toLowerCase();
          return terms.some(t => text.includes(t));
        });
      }
      if (params?.crop) {
        const cVal = String(params.crop).toLowerCase();
        filtered = filtered.filter(p => 
          (Array.isArray(p.suitableCrops) && p.suitableCrops.some((c: string) => c.toLowerCase().includes(cVal))) ||
          p.name.toLowerCase().includes(cVal) ||
          p.description.toLowerCase().includes(cVal)
        );
      }
      if (params?.sort === 'price_asc' || params?.sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
      if (params?.sort === 'price_desc' || params?.sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
      if (params?.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

      return { products: filtered, total: filtered.length, categories: CATEGORIES };
    }
  },

  getProduct: async (slug: string) => {
    try {
      const res = await publicApi.get(`/products/${slug}`);
      const rawProduct = res.data.product || res.data;
      return mapProduct(rawProduct);
    } catch (e) {
      const p = INITIAL_PRODUCTS.find(prod => prod.slug === slug || prod.id === slug);
      if (!p) throw new Error('Product not found');
      return p;
    }
  },

  getCategories: async () => {
    try {
      const res = await publicApi.get('/categories');
      return res.data.map((c: any) => ({
        ...c,
        image: c.icon || c.image || 'https://via.placeholder.com/150',
        count: c.products_count || c.count || 0
      }));
    } catch (e) {
      return CATEGORIES;
    }
  },

  getFeatured: async () => {
    try {
      const res = await publicApi.get('/products/featured');
      return (Array.isArray(res.data) ? res.data : []).map(mapProduct);
    } catch (e) {
      return INITIAL_PRODUCTS.filter(p => p.isFeatured);
    }
  },

  getTrending: async () => {
    try {
      const res = await publicApi.get('/products/trending');
      return (Array.isArray(res.data) ? res.data : []).map(mapProduct);
    } catch (e) {
      return INITIAL_PRODUCTS.filter(p => p.isTrending);
    }
  },

  getLiveStats: async () => {
    try {
      const res = await publicApi.get('/analytics/live-stats');
      return res.data;
    } catch (e) {
      return { searches_today: 0, total_views: 0 };
    }
  },

  trackSearch: async (query: string) => {
    if (!query) return;
    try {
      await publicApi.post('/analytics/track-search', { query });
    } catch (e) {
      // Ignore network errors on search tracking
    }
  },

  getRecentlyViewed: async () => {
    const { authApi } = await import('./axiosInstances');
    try {
      const res = await authApi.get('/user/recently-viewed');
      return (Array.isArray(res.data) ? res.data : []).map(mapProduct);
    } catch (e) {
      return [];
    }
  },

  syncRecentlyViewed: async (productIds: (string | number)[]) => {
    const { authApi } = await import('./axiosInstances');
    try {
      await authApi.post('/user/recently-viewed/sync', { product_ids: productIds.map(Number) });
    } catch (e) {}
  },

  clearRecentlyViewedBackend: async () => {
    const { authApi } = await import('./axiosInstances');
    try {
      await authApi.delete('/user/recently-viewed');
    } catch (e) {}
  },

  getProductById: async (id: string) => productApi.getProduct(id),
  getProductBySlug: async (slug: string) => productApi.getProduct(slug),
  getRelated: async (category: string, excludeId?: string) => {
    const res = await productApi.getProducts({ category });
    return res.products.filter((p: any) => p.id !== excludeId).slice(0, 4);
  }
};
