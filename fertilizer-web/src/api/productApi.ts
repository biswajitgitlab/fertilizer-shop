import { publicApi } from './axiosInstances';
import { INITIAL_PRODUCTS, CATEGORIES } from '../utils/constants';

export const mapProduct = (p: any): any => {
  if (!p) return p;
  if (p.price !== undefined && p.stock !== undefined && p.images !== undefined) return p; // Already mapped (mock)
  return {
    ...p,
    id: p.id?.toString(),
    category: p.category?.name || p.categorySlug || 'Uncategorized',
    categorySlug: p.category?.slug || p.categorySlug || '',
    price: Number(p.price) || 0,
    originalPrice: Number(p.discount_price) || Number(p.price) || 0, // In Laravel, maybe discount_price was original? Or vice versa. Let's assume original price is discount_price if > price
    stock: Number(p.stock_qty) || 0,
    images: Array.isArray(p.images_json) ? p.images_json : (p.images || []),
    suitableCrops: Array.isArray(p.suitable_crops_json) ? p.suitable_crops_json : (p.suitableCrops || []),
    npk: p.composition_json || p.npk,
    description: p.description || '',
    shortDescription: p.short_desc || p.shortDescription || '',
    usageInstructions: p.usage_instructions || p.usageInstructions || '',
    rating: Number(p.reviews_avg_rating) || p.rating || 0,
    reviewsCount: Number(p.reviews_count) || p.reviewsCount || 0,
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
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
          (Array.isArray(p.suitableCrops) && p.suitableCrops.some((c: string) => c.toLowerCase().includes(q)))
        );
      }
      if (params?.crop) {
        const cVal = String(params.crop).toLowerCase();
        filtered = filtered.filter(p => 
          (Array.isArray(p.suitableCrops) && p.suitableCrops.some((c: string) => c.toLowerCase().includes(cVal))) ||
          p.name.toLowerCase().includes(cVal) ||
          p.description.toLowerCase().includes(cVal)
        );
      }
      if (params?.sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
      if (params?.sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
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
  getProductById: async (id: string) => productApi.getProduct(id),
  getProductBySlug: async (slug: string) => productApi.getProduct(slug),
  getRelated: async (category: string, excludeId?: string) => {
    const res = await productApi.getProducts({ category });
    return res.products.filter((p: any) => p.id !== excludeId).slice(0, 4);
  }
};
