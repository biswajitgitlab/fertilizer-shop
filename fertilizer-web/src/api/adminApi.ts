import { apiClient } from './axiosInstances';
import { mapProduct } from './productApi';
import { Order } from '../types';

export const adminAuthApi = {
  login: async (credentials: { login: string; password: string }) => {
    const res = await apiClient.post('/admin/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/admin/auth/logout');
    return res.data;
  },
  me: async () => {
    const res = await apiClient.get('/admin/auth/me');
    return res.data;
  },
  requestForgotPassword: async (credential: string) => {
    const res = await apiClient.post('/admin/auth/forgot-password/request', { credential });
    return res.data;
  },
  verifyForgotPasswordOtp: async (credential: string, otp: string) => {
    const res = await apiClient.post('/admin/auth/forgot-password/verify', { credential, otp });
    return res.data;
  },
  resetPassword: async (data: { credential: string; otp: string; password: string }) => {
    const res = await apiClient.post('/admin/auth/forgot-password/reset', data);
    return res.data;
  }
};

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

  const realUserName = o.user?.name;
  const shippingName = addr?.name;
  const name = (shippingName && shippingName !== 'Valued Customer' && shippingName !== 'Farmer Customer')
    ? shippingName
    : (realUserName && realUserName !== 'Valued Customer' && realUserName !== 'Farmer Customer'
      ? realUserName
      : (o.customer_name || o.customerName || realUserName || shippingName || 'Valued Customer'));
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
    const unitPrice = Number(item.unit_price ?? item.unitPrice ?? item.price ?? prod.price ?? 0);
    const qty = Number(item.qty || item.quantity || 1);
    return {
      product: {
        id: String(prod.id || item.product_id || ''),
        name: prod.name || item.name || 'Fertilizer Product',
        slug: prod.slug || item.slug || '',
        category: prod.category || 'Fertilizer',
        categorySlug: prod.category_slug || 'fertilizer',
        price: unitPrice,
        unit: prod.unit || item.unit || 'Pack',
        stock: prod.stock || 100,
        rating: prod.rating || 5,
        reviewsCount: prod.reviewsCount || 10,
        images: [img],
        suitableCrops: prod.suitableCrops || ['All Crops'],
        shortDescription: prod.shortDescription || '',
        description: prod.description || '',
        usageInstructions: prod.usageInstructions || '',
        sku: prod.sku || 'SKU-GEN'
      },
      quantity: qty,
      assigned_batch: item.assigned_batch || item.batch_code || item.batchCode || null,
      batch_code: item.assigned_batch || item.batch_code || item.batchCode || null,
      expiry_date: item.expiry_date || item.expiryDate || null,
      warehouse_zone: item.warehouse_zone || item.warehouseZone || null,
    };
  });

  const rawSubtotal = Number(o.subtotal ?? o.sub_total ?? 0);
  const rawShipping = Number(o.shipping_cost ?? o.shippingFee ?? o.shipping_fee ?? 0);
  const rawTax = Number(o.tax ?? o.tax_amount ?? 0);
  const rawDiscount = Number(o.discount ?? o.discount_amount ?? 0);

  let rawTotal = Number(o.total ?? o.total_amount ?? 0);
  if (rawTotal <= 0) {
    if (rawSubtotal > 0) {
      rawTotal = rawSubtotal + rawShipping + rawTax - rawDiscount;
    } else {
      const itemsSum = items.reduce((sum: number, it: any) => sum + (it.product.price * it.quantity), 0);
      const computedTax = Math.round(itemsSum * 0.18);
      rawTotal = itemsSum + rawShipping + computedTax - rawDiscount;
    }
  }

  let finalStatus = o.status ? String(o.status) : 'Pending';
  const statusUpper = finalStatus.toUpperCase();
  if (statusUpper === 'PENDING') finalStatus = 'Pending';
  else if (statusUpper === 'CONFIRMED') finalStatus = 'Confirmed';
  else if (statusUpper === 'PROCESSING') finalStatus = 'Processing';
  else if (statusUpper === 'PACKED' || statusUpper === 'READY_TO_SHIP') finalStatus = 'Packed';
  else if (statusUpper === 'SHIPPED' || statusUpper === 'IN_TRANSIT') finalStatus = 'Shipped';
  else if (statusUpper === 'OUT_FOR_DELIVERY') finalStatus = 'Out for Delivery';
  else if (statusUpper === 'DELIVERED') finalStatus = 'Delivered';
  else if (statusUpper === 'CANCELLED') finalStatus = 'Cancelled';
  else if (statusUpper === 'REFUNDED') finalStatus = 'Refunded';

  const rawPaymentMethod = o.payment_method || o.paymentMethod || 'COD';
  const paymentMethodUpper = String(rawPaymentMethod).toUpperCase();
  let finalPaymentMethod = 'Cash on Delivery';
  if (['ONLINE', 'RAZORPAY', 'ONLINE PAYMENT', 'CARD', 'UPI', 'NET_BANKING'].includes(paymentMethodUpper)) {
    finalPaymentMethod = 'Online Payment';
  } else if (['KCC', 'KISAN_CREDIT_CARD'].includes(paymentMethodUpper)) {
    finalPaymentMethod = 'Kisan Credit Card (KCC)';
  } else if (['SUBSIDY', 'GOVT_SUBSIDY'].includes(paymentMethodUpper)) {
    finalPaymentMethod = 'Govt Direct Subsidy';
  }

  const rawPayStatus = o.payment_status || o.paymentStatus || 'PENDING';
  let finalPaymentStatus = 'Pending';
  const payStatusUpper = String(rawPayStatus).toUpperCase();
  if (['PAID', 'SUCCESS', 'COMPLETED', 'SETTLED_TO_BANK'].includes(payStatusUpper)) {
    finalPaymentStatus = 'Paid';
  } else if (['FAILED', 'DECLINED'].includes(payStatusUpper)) {
    finalPaymentStatus = 'Failed';
  } else if (['REFUNDED'].includes(payStatusUpper)) {
    finalPaymentStatus = 'Refunded';
  }

  const orderNum = o.order_number || o.orderNumber || (o.id ? (String(o.id).startsWith('ORD-') ? o.id : `ORD-${o.id}`) : `ORD-${Date.now()}`);

  return {
    id: String(o.id || orderNum),
    userId: String(o.user_id || o.userId || 'u-1'),
    orderNumber: orderNum,
    customerName: name,
    phone,
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
    subtotal: rawSubtotal > 0 ? rawSubtotal : (rawTotal - rawShipping - rawTax + rawDiscount),
    shippingFee: rawShipping,
    tax: rawTax,
    discount: rawDiscount,
    total: rawTotal,
    paymentMethod: finalPaymentMethod,
    paymentStatus: finalPaymentStatus,
    status: finalStatus,
    trackingNumber: o.tracking_number || o.trackingNumber || null,
    packer_id: o.packer_id || o.packerId || o.packer?.id || null,
    packerId: o.packer_id || o.packerId || o.packer?.id || null,
    driver_id: o.driver_id || o.driverId || o.driver?.id || null,
    driverId: o.driver_id || o.driverId || o.driver?.id || null,
    packer: o.packer ? { id: o.packer.id, name: o.packer.name, phone: o.packer.phone } : null,
    driver: o.driver ? { id: o.driver.id, name: o.driver.name, phone: o.driver.phone } : null,
    packerName: o.packer?.name || o.packer_name || o.packerName || '',
    driverName: o.driver?.name || o.driver_name || o.driverName || '',
    packed_at: o.packed_at || null,
    shipped_at: o.shipped_at || null,
    delivered_at: o.delivered_at || null,
    cancelled_at: o.cancelled_at || null,
    cancellation_reason: o.cancellation_reason || null,
    refund_status: o.refund_status || null,
    refund_amount: o.refund_amount ? Number(o.refund_amount) : null,
    coupon_code: o.coupon_code || o.couponCode || null,
    createdAt: o.created_at ? (isFinite(new Date(o.created_at).getTime()) ? new Date(o.created_at).toISOString() : new Date().toISOString()) : new Date().toISOString()
  };
};

export const adminApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/admin/dashboard');
    const data = res.data;
    return {
      totalRevenue: data.stats?.sales_month || 0,
      totalOrders: data.stats?.total_orders || 0,
      activeProducts: data.stats?.active_products || 0,
      lowStockCount: data.stats?.low_stock || 0
    };
  },

  getAnalytics: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  getProducts: async () => {
    const res = await apiClient.get('/products');
    const rawProducts = res.data.data || res.data;
    return Array.isArray(rawProducts) ? rawProducts.map(mapProduct) : [];
  },

  createProduct: async (productData: any) => {
    const res = await apiClient.post('/admin/products', productData);
    return res.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const res = await apiClient.put(`/admin/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id: string) => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data;
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

    const res = await apiClient.get('/admin/orders', { params: cleanParams });
    const rawData = res.data;
    const rawOrders = rawData.data || (Array.isArray(rawData) ? rawData : (rawData.orders || []));
    const meta = rawData.meta || { current_page: 1, last_page: 1, per_page: cleanParams.per_page || 10, total: Array.isArray(rawOrders) ? rawOrders.length : 0 };
    const fetchedOrders = Array.isArray(rawOrders) ? rawOrders.map(normalizeAdminOrder) : [];
    return { orders: fetchedOrders, meta };
  },

  updateOrderStatus: async (id: string, status: string, trackingNumber?: string, packerId?: number | string, driverId?: number | string) => {
    const payload: any = {};
    if (status) payload.status = status.toUpperCase();
    if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
    if (packerId !== undefined) payload.packer_id = packerId;
    if (driverId !== undefined) payload.driver_id = driverId;
    const res = await apiClient.put(`/admin/orders/${id}`, payload);
    return res.data;
  },

  getCoupons: async () => {
    const res = await apiClient.get('/admin/coupons');
    return res.data.data || res.data;
  },

  createCoupon: async (data: any) => {
    const res = await apiClient.post('/admin/coupons', data);
    return res.data;
  },

  getCustomers: async (params?: any) => {
    const res = await apiClient.get('/admin/customers', { params });
    const raw = res.data;
    const list = raw.data || (Array.isArray(raw) ? raw : []);
    const meta = raw.meta || { current_page: 1, last_page: 1, per_page: params?.per_page || 10, total: Array.isArray(list) ? list.length : 0 };
    return { data: Array.isArray(list) ? list : [], meta };
  },

  getCustomerDetails: async (id: number | string) => {
    const res = await apiClient.get(`/admin/customers/${id}`);
    return res.data;
  },

  getDashboardStats: async () => adminApi.getDashboard(),

  getDiagnoses: async () => {
    const res = await apiClient.get('/admin/diagnoses');
    const raw = res.data;
    return raw.data || (Array.isArray(raw) ? raw : []);
  },

  reviewDiagnosis: async (id: string, data?: any) => {
    const res = await apiClient.put(`/admin/diagnoses/${id}`, data || {});
    return res.data;
  },

  getOrderById: async (id: string) => {
    const res = await apiClient.get(`/admin/orders/${id}`);
    const raw = res.data.order || res.data;
    return normalizeAdminOrder(raw);
  },

  getRoles: async () => {
    const res = await apiClient.get('/admin/roles');
    const raw = res.data;
    return Array.isArray(raw) ? raw : (raw?.data || raw?.roles || []);
  },

  getPermissions: async () => {
    const res = await apiClient.get('/admin/permissions');
    const raw = res.data;
    return Array.isArray(raw) ? raw : (raw?.data || raw?.permissions || []);
  },

  createRole: async (data: { name: string; permissions: string[] }) => {
    const res = await apiClient.post('/admin/roles', data);
    return res.data;
  },

  updateRolePermissions: async (id: number, permissions: string[]) => {
    const res = await apiClient.put(`/admin/roles/${id}`, { permissions });
    return res.data;
  },

  getTeam: async () => {
    try {
      const res = await apiClient.get('/admin/team');
      const raw = res.data;
      return Array.isArray(raw) ? raw : (raw?.data || raw?.users || []);
    } catch (e) {
      try {
        const res2 = await apiClient.get('/admin/users');
        const raw2 = res2.data;
        return Array.isArray(raw2) ? raw2 : (raw2?.data || raw2?.users || []);
      } catch (err) {
        return [];
      }
    }
  },

  assignUserRole: async (userId: number | string, role: string) => {
    const res = await apiClient.post('/admin/team/assign-role', { user_id: userId, role });
    return res.data;
  },

  updateUserPermissions: async (userId: number | string, permissions: string[]) => {
    const res = await apiClient.put(`/admin/team/${userId}/permissions`, { permissions });
    return res.data;
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number; per_page?: number }) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
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
  },

  getNotifications: async () => {
    const res = await apiClient.get('/admin/notifications');
    return res.data;
  },

  markNotificationAsRead: async (id: string | number) => {
    const res = await apiClient.post(`/admin/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await apiClient.post('/admin/notifications/read-all');
    return res.data;
  },

  // Enterprise RBSC Reports API Endpoints (Live DB & Redis Cached)
  getRegulatoryReport: async (params?: any) => {
    const res = await apiClient.get('/admin/reports/regulatory', { params });
    return res.data;
  },
  getFefoReport: async (params?: any) => {
    const res = await apiClient.get('/admin/reports/fefo-inventory', { params });
    return res.data;
  },
  getDiseaseOutbreakReport: async (params?: any) => {
    const res = await apiClient.get('/admin/reports/disease-outbreak', { params });
    return res.data;
  },
  getSecurityAuditReport: async (params?: any) => {
    const res = await apiClient.get('/admin/reports/security-audit', { params });
    return res.data;
  },
  getFinancialReconcileReport: async (params?: any) => {
    const res = await apiClient.get('/admin/reports/financial-reconcile', { params });
    return res.data;
  }
};
