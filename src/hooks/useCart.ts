import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const store = useCartStore();
  return {
    items: store.items,
    isOpen: store.isOpen,
    couponCode: store.couponCode,
    addToCart: store.addToCart,
    updateQty: store.updateQty,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    toggleDrawer: store.toggleDrawer,
    setDrawerOpen: store.setDrawerOpen,
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,
    hasOutOfStockItems: store.hasOutOfStockItems(),
    getOutOfStockItems: store.getOutOfStockItems,
    syncWithServer: store.syncWithServer,
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    discount: store.getDiscount(),
    shippingFee: store.getShippingFee(),
    tax: store.getTax(),
    total: store.getTotal(),
    freeShippingThreshold: store.FREE_SHIPPING_THRESHOLD
  };
};
