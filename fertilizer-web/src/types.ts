export interface NPK {
  n: number;
  p: number;
  k: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  unit: string; // e.g. "1 kg", "25 kg Bag", "500 ml"
  stock: number;
  rating: number;
  reviewsCount: number;
  viewsCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  images: string[];
  npk?: NPK;
  suitableCrops: string[];
  shortDescription: string;
  description: string;
  usageInstructions: string;
  sku: string;
  weight?: string;
  metaTitle?: string;
  metaDescription?: string;
  active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  farmLocation?: string;
  farmSize?: string;
  farm_location?: string;
  role: string;
  roles?: string[];
  effective_permissions?: string[];
  is_staff?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  altPhone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  customerName: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Online Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  packerId?: string | number;
  packerName?: string;
  driverId?: string | number;
  driverName?: string;
  driverPhone?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  createdAt: string;
  adminNotes?: string;
  numericId?: string | number;
  cancelledAt?: string;
  cancelledBy?: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
  cancellationReason?: string;
  refundStatus?: 'NOT_APPLICABLE' | 'PENDING' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  refundAmount?: number;
  refundReferenceId?: string;
  paymentDetails?: {
    gateway: string;
    transactionId: string;
    status: string;
    date: string;
  } | null;
}

export interface Diagnosis {
  id: string;
  userId: string;
  crop: string;
  growthStage: string;
  symptoms: string[];
  images: string[];
  status: 'PENDING' | 'COMPLETED';
  title?: string;
  confidence?: number;
  severity?: 'High' | 'Medium' | 'Low';
  description?: string;
  causes?: string[];
  recommendedProductIds?: string[];
  preventiveMeasures?: string[];
  adminReviewed?: boolean;
  expertNote?: string;
  createdAt: string;
}

export interface CropTask {
  id: string;
  date: string;
  stage: string;
  product: string;
  productId?: string;
  qty: string;
  method: string;
  status: 'Pending' | 'Done';
}

export interface CropPlan {
  id: string;
  userId: string;
  crop: string;
  fieldArea: number; // in acres
  sowingDate: string;
  expectedHarvestDate: string;
  currentStage: string;
  daysSinceSowing: number;
  tasks: CropTask[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  productCards?: Product[];
  attachments?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  uses: number;
  expiry: string;
  active: boolean;
}

export interface AdminStats {
  totalRevenue: number;
  salesGrowth: number;
  totalOrders: number;
  newCustomers: number;
  lowStockCount: number;
  activeProducts: number;
}
