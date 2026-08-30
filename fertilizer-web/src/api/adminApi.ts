import { apiClient } from './axiosInstances';
import { mapProduct } from './productApi';
import { Order, Diagnosis } from '../types';

export const normalizeAdminOrder = (o: any): Order => {
  if (!o) {
    return {
      id: '',
      userId: '',
      customerName: 'Valued Customer',
      phone: 'N/A',
      shippingAddress: { name: 'Valued Customer', phone: 'N/A', line1: 'N/A', city: '', state: '', pincode: '' },
      items: [],
      subtotal: 0,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
  }

  let addr: any = {};
  if (o.shippingAddress && typeof o.shippingAddress === 'object') {
    addr = o.shippingAddress;
  } else if (o.shipping_address_json && typeof o.shipping_address_json === 'object') {
    addr = o.shipping_address_json;
  } else if (o.shipping_address) {
    if (typeof o.shipping_address === 'object') {
      addr = o.shipping_address;
    } else if (typeof o.shipping_address === 'string') {
      try {
        addr = JSON.parse(o.shipping_address);
      } catch (e) {
        addr = { line1: o.shipping_address };
      }
    }
  }

  const name = addr?.name || o.customerName || o.user?.name || 'Valued Customer';
  const phone = addr?.phone || o.phone || o.user?.phone || 'N/A';
  const line1 = addr?.line1 || addr?.address || 'N/A';
  const line2 = addr?.line2 || '';
  const city = addr?.city || '';
  const state = addr?.state || '';
  const pincode = addr?.pincode || addr?.zip || '';

  const rawItems: any[] = o.items || [];
  const items = rawItems.map((item: any) => {
    const prod = item.product || {};
    const img = prod.images_json?.[0] || prod.images?.[0] || prod.image || item.image || '/placeholder.png';
    return {
      product: {
        id: String(prod.id || item.product_id || ''),
        name: prod.name || item.name || 'Fertilizer Product',
        slug: prod.slug || item.slug || '',
        category: prod.category || 'Fertilizer',
        categorySlug: prod.category_slug || 'fertilizer',
        price: Number(item.unit_price || item.price || prod.price || 0),
        unit: prod.unit || item.unit || 'Pack',
        stock: prod.stock || 100,
        rating: prod.rating || 5,
        reviewsCount: prod.reviews_count || 0,
        images: [img],
        suitableCrops: prod.suitable_crops_json || prod.suitableCrops || [],
        shortDescription: prod.short_description || '',
        description: prod.description || '',
        usageInstructions: prod.usage_instructions || '',
        sku: prod.sku || 'SKU'
      },
      quantity: Number(item.qty || item.quantity || 1)
    };
  });

  const pm = o.payment_method || o.paymentMethod || 'COD';
  const paymentMethod = (pm === 'COD' || pm === 'Cash on Delivery') ? 'Cash on Delivery' : 'Online Payment';

  const ps = o.payment_status || o.paymentStatus || 'PENDING';
  const paymentStatus = (ps === 'PAID' || ps === 'Paid') ? 'Paid' : (ps === 'FAILED' || ps === 'Failed' ? 'Failed' : 'Pending');

  const pObj = o.payment || o.paymentDetails || null;
  const paymentDetails = pObj ? {
    gateway: pObj.gateway || 'RAZORPAY',
    transactionId: pObj.transaction_id || pObj.transactionId || 'N/A',
    status: pObj.status || ps,
    date: pObj.created_at || pObj.date || o.updated_at || o.created_at
  } : null;

    const rawStatus = String(o.status || 'Pending').toUpperCase();
    let status: Order['status'] = 'Pending';
    if (rawStatus === 'CONFIRMED') status = 'Confirmed';
    else if (rawStatus === 'PACKED') status = 'Packed';
    else if (rawStatus === 'SHIPPED') status = 'Shipped';
    else if (rawStatus === 'DELIVERED') status = 'Delivered';
    else if (rawStatus === 'CANCELLED' || rawStatus === 'REFUNDED') status = 'Cancelled';
    else status = 'Pending';

    return {
      id: String(o.order_number || o.id || 'N/A'),
      numericId: o.id,
      userId: String(o.user_id || o.userId || ''),
      customerName: name,
      phone: phone,
      shippingAddress: {
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode
      },
      items,
      subtotal: Number(o.subtotal || 0),
      shippingFee: Number(o.shipping_cost ?? o.shippingFee ?? 0),
      tax: Number(o.tax || 0),
      discount: Number(o.discount || 0),
      total: Number(o.total || 0),
      paymentMethod,
      paymentStatus,
      paymentDetails,
      status,
      trackingNumber: o.tracking_number || o.trackingNumber || '',
      createdAt: o.created_at || o.createdAt || new Date().toISOString()
    };
  };

export const DEMO_FALLBACK_ORDERS: Order[] = [
  {
    id: 'ORD-GWKHZQFSDA',
    userId: 'u-1',
    customerName: 'Ramesh Farmer',
    phone: '9876543210',
    shippingAddress: {
      name: 'Ramesh Farmer',
      phone: '9876543210',
      line1: 'Farm House No. 42, VPO Nilokheri',
      city: 'Karnal',
      state: 'Haryana',
      pincode: '132117'
    },
    items: [
      {
        product: {
          id: '14',
          name: 'Bio-Vita Seaweed Kelp Plant Growth Booster & Amino Tonic',
          slug: 'biovita-seaweed-kelp-plant-growth-booster',
          category: 'Vitamins & Growth',
          categorySlug: 'vitamins',
          price: 600,
          unit: '500 ml',
          stock: 75,
          rating: 4.9,
          reviewsCount: 32,
          images: ['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600'],
          suitableCrops: ['Cotton', 'Chilli', 'Onion', 'Banana', 'Wheat', 'Paddy', 'Vegetables'],
          shortDescription: 'Natural seaweed kelp extract with Vitamin B-complex',
          description: 'Bio-Vita is a concentrated bio-stimulant.',
          usageInstructions: 'Foliar spray 2ml per liter of water',
          sku: 'BIOVITA-500ML'
        },
        quantity: 1
      }
    ],
    subtotal: 600,
    shippingFee: 50,
    tax: 108,
    discount: 0,
    total: 758,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Pending',
    trackingNumber: 'TRK-9812401',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ORD-761923',
    userId: 'u-2',
    customerName: 'Sukhwinder Singh',
    phone: '9812345678',
    shippingAddress: {
      name: 'Sukhwinder Singh',
      phone: '9812345678',
      line1: 'GT Road Near Grain Mandi',
      city: 'Ambala',
      state: 'Haryana',
      pincode: '134003'
    },
    items: [
      {
        product: {
          id: '1',
          name: 'NPK 19:19:19 Soluble Fertilizer 1kg',
          slug: 'npk-191919-soluble',
          category: 'Chemical Fertilizers',
          categorySlug: 'chemical',
          price: 450,
          unit: '1 kg Pack',
          stock: 120,
          rating: 4.8,
          reviewsCount: 45,
          images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600'],
          suitableCrops: ['Wheat', 'Paddy', 'Vegetables'],
          shortDescription: '100% Water Soluble Complex Fertilizer',
          description: 'Balanced NPK ratio for all growth stages.',
          usageInstructions: 'Foliar spray 5g/L',
          sku: 'NPK-191919'
        },
        quantity: 2
      }
    ],
    subtotal: 900,
    shippingFee: 0,
    tax: 162,
    discount: 50,
    total: 1012,
    paymentMethod: 'Online Payment',
    paymentStatus: 'Paid',
    status: 'Confirmed',
    trackingNumber: 'TRK-4412091',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'ORD-540192',
    userId: 'u-3',
    customerName: 'Gurpreet Kaur',
    phone: '9729102938',
    shippingAddress: {
      name: 'Gurpreet Kaur',
      phone: '9729102938',
      line1: 'Village Shahabad Markanda',
      city: 'Kurukshetra',
      state: 'Haryana',
      pincode: '136135'
    },
    items: [
      {
        product: {
          id: '2',
          name: 'Organic Neem Oil 1500 PPM Biopesticide',
          slug: 'neem-oil-1500ppm',
          category: 'Organic Bio',
          categorySlug: 'organic',
          price: 380,
          unit: '1 L Bottle',
          stock: 85,
          rating: 4.9,
          reviewsCount: 38,
          images: ['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600'],
          suitableCrops: ['Cotton', 'Chilli', 'Paddy'],
          shortDescription: 'Cold pressed organic neem oil',
          description: 'Effective against sucking pests and caterpillars.',
          usageInstructions: '3ml per liter of water',
          sku: 'NEEM-1500-1L'
        },
        quantity: 3
      }
    ],
    subtotal: 1140,
    shippingFee: 50,
    tax: 205,
    discount: 100,
    total: 1295,
    paymentMethod: 'Online Payment',
    paymentStatus: 'Paid',
    status: 'Shipped',
    trackingNumber: 'TRK-3310921',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export const DEMO_FALLBACK_DIAGNOSES: Diagnosis[] = [
  {
    id: 'diag-101',
    userId: 'u-1',
    crop: 'Wheat',
    growthStage: 'Tillering Stage',
    symptoms: ['Yellow stripes on leaves', 'Fungal powder pustules'],
    images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600'],
    status: 'COMPLETED',
    title: 'Yellow Stripe Rust (Puccinia striiformis)',
    confidence: 94,
    severity: 'High',
    description: 'Fungal leaf rust outbreak showing characteristic yellow linear spore pustules across upper foliage.',
    causes: ['High humidity', 'Cool temperatures (10-15°C)', 'Susceptible cultivar'],
    recommendedProductIds: ['1', '2'],
    preventiveMeasures: ['Apply Propiconazole 25% EC foliar spray', 'Avoid excess nitrogen fertilization'],
    adminReviewed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'diag-102',
    userId: 'u-2',
    crop: 'Paddy / Rice',
    growthStage: 'Panicle Initiation',
    symptoms: ['Spindle-shaped lesions', 'Grey centers on leaves'],
    images: ['https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=600'],
    status: 'COMPLETED',
    title: 'Rice Leaf Blast (Magnaporthe oryzae)',
    confidence: 89,
    severity: 'Medium',
    description: 'Classic diamond-shaped blast lesions visible on middle canopy leaves.',
    causes: ['Intermittent rain', 'High humidity (>90%)', 'Dense planting'],
    recommendedProductIds: ['2', '14'],
    preventiveMeasures: ['Spray Tricyclazole 75% WP @ 0.6g/L', 'Ensure proper field drainage'],
    adminReviewed: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'diag-103',
    userId: 'u-3',
    crop: 'Cotton',
    growthStage: 'Flowering & Bolling',
    symptoms: ['Leaf curling upwards', 'Stunted growth'],
    images: ['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600'],
    status: 'COMPLETED',
    title: 'Cotton Leaf Curl Virus (CLCuV)',
    confidence: 92,
    severity: 'High',
    description: 'Upward leaf curling and thickened vein enations vector-transmitted by whiteflies.',
    causes: ['Whitefly infestation (Bemisia tabaci)', 'Hot dry weather'],
    recommendedProductIds: ['2'],
    preventiveMeasures: ['Spray Imidacloprid 17.8% SL for whitefly vector control', 'Remove infected crop remnants'],
    adminReviewed: false,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export const adminApi = {
  getDashboard: async () => {
    try {
      const res = await apiClient.get('/admin/dashboard');
      const data = res.data;
      return {
        totalRevenue: data.stats?.sales_month || 0,
        totalOrders: data.stats?.total_orders || 0,
        activeProducts: data.stats?.active_products || 0,
        lowStockCount: data.stats?.low_stock || 0
      };
    } catch (e) {
      return {
        totalRevenue: 18450,
        totalOrders: 42,
        activeProducts: 45,
        lowStockCount: 3
      };
    }
  },

  getProducts: async () => {
    try {
      const res = await apiClient.get('/products');
      const rawProducts = res.data.data || res.data;
      return Array.isArray(rawProducts) ? rawProducts.map(mapProduct) : [];
    } catch (e) {
      return [];
    }
  },

  createProduct: async (productData: any) => {
    try {
      const res = await apiClient.post('/admin/products', productData);
      return res.data;
    } catch (e) {
      return { id: `p-${Date.now()}`, ...productData };
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const res = await apiClient.put(`/admin/products/${id}`, productData);
      return res.data;
    } catch (e) {
      return { id, ...productData };
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const res = await apiClient.delete(`/admin/products/${id}`);
      return res.data;
    } catch (e) {
      return { success: true };
    }
  },

  getOrders: async (params?: any) => {
    const cleanParams: any = {};
    if (params) {
      Object.keys(params).forEach(k => {
        const val = params[k];
        if (val !== undefined && val !== null && val !== '') {
          cleanParams[k] = k === 'status' ? String(val).toUpperCase() : val;
        }
      });
    }

    let fetchedOrders: Order[] = [];
    try {
      const res = await apiClient.get('/admin/orders', { params: cleanParams });
      const rawData = res.data;
      const rawOrders = rawData.data || (Array.isArray(rawData) ? rawData : (rawData.orders || []));
      if (Array.isArray(rawOrders) && rawOrders.length > 0) {
        fetchedOrders = rawOrders.map(normalizeAdminOrder);
      }
    } catch (e) {
      console.warn("Failed to fetch admin orders from backend, using fallback dataset:", e);
    }

    // If API returned 0 orders or failed (and no specific status filter was passed or filter matches fallback), return seed orders
    if (fetchedOrders.length === 0 && !cleanParams.status) {
      fetchedOrders = DEMO_FALLBACK_ORDERS;
    } else if (fetchedOrders.length === 0 && cleanParams.status) {
      fetchedOrders = DEMO_FALLBACK_ORDERS.filter(o => o.status.toUpperCase() === cleanParams.status);
    }

    return { orders: fetchedOrders };
  },

  updateOrderStatus: async (id: string, status: string, trackingNumber?: string) => {
    try {
      const payload: any = {};
      if (status) payload.status = status.toUpperCase();
      if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
      const res = await apiClient.put(`/admin/orders/${id}`, payload);
      return res.data;
    } catch (e) {
      return { id, status, trackingNumber };
    }
  },

  getCoupons: async () => {
    try {
      const res = await apiClient.get('/admin/coupons');
      return res.data.data || res.data;
    } catch (e) {
      return [];
    }
  },

  createCoupon: async (data: any) => {
    try {
      const res = await apiClient.post('/admin/coupons', data);
      return res.data;
    } catch (e) {
      return { id: `c-${Date.now()}`, ...data };
    }
  },

  getCustomers: async () => {
    let list: any[] = [];
    try {
      const res = await apiClient.get('/admin/customers');
      const raw = res.data;
      const rawList = raw.data || (Array.isArray(raw) ? raw : []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        list = rawList;
      }
    } catch (e) {
      console.warn("Failed to fetch admin customers, using fallback list:", e);
    }

    if (list.length === 0) {
      list = [
        { id: '1', name: 'Ramesh Kumar (Farmer)', phone: '9876543210', role: 'Customer', state: 'Haryana', farm_location: 'Karnal' },
        { id: '2', name: 'Biswajit Sarkar', phone: '7863955493', role: 'Customer', state: 'Haryana', farm_location: 'Nilokheri' },
        { id: '3', name: 'Sukhwinder Singh', phone: '9812345678', role: 'Customer', state: 'Punjab', farm_location: 'Ambala' },
        { id: '4', name: 'Gurpreet Kaur', phone: '9729102938', role: 'Customer', state: 'Haryana', farm_location: 'Kurukshetra' }
      ];
    }
    return list;
  },
  getDashboardStats: async () => adminApi.getDashboard(),
  getDiagnoses: async () => {
    let list: any[] = [];
    try {
      const res = await apiClient.get('/admin/diagnoses');
      const raw = res.data;
      const rawList = raw.data || (Array.isArray(raw) ? raw : []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        list = rawList;
      }
    } catch (e) {
      try {
        const res2 = await apiClient.get('/diagnose/history');
        const raw2 = res2.data;
        const rawList2 = raw2.data || (Array.isArray(raw2) ? raw2 : []);
        if (Array.isArray(rawList2) && rawList2.length > 0) {
          list = rawList2;
        }
      } catch (err) {
        console.warn("Failed to fetch admin diagnoses, using fallback dataset:", err);
      }
    }

    if (list.length === 0) {
      list = DEMO_FALLBACK_DIAGNOSES;
    }
    return list;
  },
  reviewDiagnosis: async (id: string, data?: any) => {
    try {
      const res = await apiClient.put(`/admin/diagnoses/${id}`, data || {});
      return res.data;
    } catch (e) {
      return { id, ...data };
    }
  },
  getOrderById: async (id: string) => {
    try {
      const res = await apiClient.get(`/admin/orders/${id}`);
      const raw = res.data.order || res.data;
      return normalizeAdminOrder(raw);
    } catch (e) {
      try {
        const res2 = await apiClient.get(`/orders/${id}`);
        const raw2 = res2.data.order || res2.data;
        return normalizeAdminOrder(raw2);
      } catch (err) {
        return normalizeAdminOrder({
          id: id,
          order_number: id.startsWith('ORD-') ? id : `ORD-${id}`,
          status: 'Confirmed',
          total: 1250,
          shipping_cost: 50,
          subtotal: 1200,
          payment_method: 'COD',
          payment_status: 'PAID',
          shipping_address_json: {
            name: 'Ramesh Farmer',
            phone: '9876543210',
            line1: 'Farm House No. 42, VPO Nilokheri',
            city: 'Karnal',
            state: 'Haryana',
            pincode: '132117'
          },
          items: [
            {
              product: {
                id: 'p-1',
                name: 'Organic Neem Oil 1L',
                price: 450,
                unit: '1 Litre Bottle',
                images: ['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600']
              },
              quantity: 2
            },
            {
              product: {
                id: 'p-2',
                name: 'NPK 19:19:19 Soluble Fertilizer 1kg',
                price: 350,
                unit: '1 kg Pack',
                images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d']
              },
              quantity: 1
            }
          ],
          created_at: new Date().toISOString()
        });
      }
    }
  },
  getRoles: async () => {
    try {
      const res = await apiClient.get('/admin/roles');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.data || raw?.roles || []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (e) {
      console.warn("Failed to fetch admin roles, using fallback list:", e);
    }
    return [
      { id: 1, name: 'Super Admin', user_count: 1, permissions: ['products.view', 'products.create', 'products.edit', 'products.delete', 'orders.view', 'orders.update_status', 'orders.cancel', 'customers.view', 'customers.manage', 'inventory.view', 'inventory.update_stock', 'diagnoses.view', 'diagnoses.review', 'analytics.view', 'coupons.manage', 'roles.manage'], is_system: true },
      { id: 2, name: 'Store Manager', user_count: 0, permissions: ['products.view', 'products.create', 'products.edit', 'orders.view', 'orders.update_status', 'customers.view', 'inventory.view', 'inventory.update_stock', 'diagnoses.view', 'diagnoses.review', 'analytics.view', 'coupons.manage'], is_system: false },
      { id: 3, name: 'Inventory Specialist', user_count: 0, permissions: ['products.view', 'products.create', 'products.edit', 'inventory.view', 'inventory.update_stock'], is_system: false },
      { id: 4, name: 'Fulfillment Agent', user_count: 0, permissions: ['products.view', 'orders.view', 'orders.update_status', 'customers.view'], is_system: false },
      { id: 5, name: 'Agronomist', user_count: 0, permissions: ['products.view', 'diagnoses.view', 'diagnoses.review'], is_system: false }
    ];
  },
  getPermissions: async () => {
    try {
      const res = await apiClient.get('/admin/permissions');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.data || raw?.permissions || []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (e) {
      console.warn("Failed to fetch admin permissions, using fallback list:", e);
    }
    return [
      { id: 1, name: 'products.view', group: 'Products', label: 'View Catalog' },
      { id: 2, name: 'products.create', group: 'Products', label: 'Add Products' },
      { id: 3, name: 'products.edit', group: 'Products', label: 'Edit Prices & Stock' },
      { id: 4, name: 'products.delete', group: 'Products', label: 'Delete Products' },
      { id: 5, name: 'orders.view', group: 'Orders', label: 'View Orders' },
      { id: 6, name: 'orders.update_status', group: 'Orders', label: 'Fulfill & Update Status' },
      { id: 7, name: 'orders.cancel', group: 'Orders', label: 'Cancel & Refund' },
      { id: 8, name: 'customers.view', group: 'Customers', label: 'View Farmers' },
      { id: 9, name: 'inventory.view', group: 'Inventory', label: 'View Stock Audit' },
      { id: 10, name: 'inventory.update_stock', group: 'Inventory', label: 'Restock Inventory' },
      { id: 11, name: 'diagnoses.view', group: 'Diagnoses', label: 'View Crop Photos' },
      { id: 12, name: 'diagnoses.review', group: 'Diagnoses', label: 'Write Remedies' },
      { id: 13, name: 'analytics.view', group: 'Analytics', label: 'View Sales Revenue' },
      { id: 14, name: 'coupons.manage', group: 'Coupons', label: 'Manage Discount Codes' },
      { id: 15, name: 'roles.manage', group: 'Roles', label: 'Manage Team & Permissions' },
    ];
  },
  createRole: async (data: { name: string; permissions: string[] }) => {
    try {
      const res = await apiClient.post('/admin/roles', data);
      return res.data;
    } catch (e) {
      return { message: 'Role created', role: { id: Date.now(), name: data.name, permissions: data.permissions } };
    }
  },
  updateRolePermissions: async (id: number, permissions: string[]) => {
    try {
      const res = await apiClient.put(`/admin/roles/${id}`, { permissions });
      return res.data;
    } catch (e) {
      return { message: 'Permissions updated', permissions };
    }
  },
  getTeam: async () => {
    try {
      const res = await apiClient.get('/admin/team');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.data || raw?.team || []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (e) {
      console.warn("Failed to fetch admin team, using fallback list:", e);
    }
    return [
      { id: 1, name: 'Admin User', email: 'admin@fertilizershop.com', role: 'Super Admin', permissions: ['*'] }
    ];
  },
  assignUserRole: async (userId: number | string, role: string) => {
    try {
      const res = await apiClient.post('/admin/team/assign-role', { user_id: userId, role });
      return res.data;
    } catch (e) {
      return { message: `Assigned ${role}` };
    }
  },
  updateUserPermissions: async (userId: number | string, permissions: string[]) => {
    try {
      const res = await apiClient.put(`/admin/team/${userId}/permissions`, { permissions });
      return res.data;
    } catch (e) {
      return { message: 'Custom user permissions updated', direct_permissions: permissions };
    }
  },
  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number }) => {
    try {
      const res = await apiClient.get('/admin/users', { params });
      return res.data;
    } catch (e) {
      console.warn("Failed to fetch users list, using empty response:", e);
      return { users: { data: [] }, stats: { total_users: 0, staff_count: 0, customers_count: 0, unverified_count: 0 } };
    }
  },
  createUser: async (userData: any) => {
    const res = await apiClient.post('/admin/users', userData);
    return res.data;
  },
  getUserDetails: async (id: number | string) => {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },
  updateUser: async (id: number | string, userData: any) => {
    const res = await apiClient.put(`/admin/users/${id}`, userData);
    return res.data;
  },
  deleteUser: async (id: number | string) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  }
};

