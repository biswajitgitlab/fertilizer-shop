import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/checkout/StepIndicator';
import { AddressForm } from '../components/checkout/AddressForm';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { PaymentSelector } from '../components/checkout/PaymentSelector';
import { Button } from '../components/common/Button';
import { useCart } from '../hooks/useCart';
import { ShippingAddress } from '../types';
import { orderApi } from '../api/orderApi';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { PaymentModal } from '../components/checkout/PaymentModal';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discount, shippingFee, tax, total, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<ShippingAddress>({
    name: "Ramesh Farmer",
    phone: "9876543210",
    line1: "Farm House No. 42, VPO Nilokheri",
    city: "Karnal",
    state: "Haryana",
    pincode: "132117"
  });

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment'>('Cash on Delivery');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [pendingOnlineOrder, setPendingOnlineOrder] = useState<{ id: string | number; amount: number } | null>(null);

  if (items.length === 0 && !pendingOnlineOrder) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const newOrder = await orderApi.createOrder({
        items,
        shippingAddress: address,
        paymentMethod,
        subtotal,
        discount,
        shippingFee,
        tax,
        total
      });

      const orderId = newOrder?.id || newOrder?.order?.id || newOrder?.order_number;
      localStorage.setItem('krishi_has_placed_orders', 'true');
      
      if (paymentMethod === 'Online Payment' && orderId) {
        setPendingOnlineOrder({ id: orderId, amount: total });
      } else {
        clearCart();
        toast.success("Order Placed Successfully!");
        if (orderId) {
          navigate(`/orders/${orderId}`);
        } else {
          navigate('/orders');
        }
      }
    } catch (e: any) {
      console.error("Place order error:", e);
      toast.error("Failed to place order. Try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (pendingOnlineOrder) {
      const orderId = pendingOnlineOrder.id;
      localStorage.setItem('krishi_has_placed_orders', 'true');
      setPendingOnlineOrder(null);
      clearCart();
      toast.success("Payment Verified & Order Confirmed!");
      navigate(`/orders/${orderId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Checkout Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900">Secure Farm Checkout</h1>
        <StepIndicator currentStep={step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {step === 1 && (
            <AddressForm
              address={address}
              onChangeAddress={setAddress}
              onSubmitNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Review Delivery Details
              </h3>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <p className="font-bold text-emerald-900">Shipping To:</p>
                <p className="font-semibold text-emerald-950">{address.name} ({address.phone})</p>
                <p className="text-emerald-800">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
              </div>

              <PaymentSelector
                paymentMethod={paymentMethod}
                onChangeMethod={setPaymentMethod}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Address
                </Button>
                <Button onClick={handlePlaceOrder} isLoading={isPlacingOrder} icon={<Lock className="w-4 h-4" />}>
                  Place Order Now
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <OrderSummary />
        </div>

      </div>

      {/* Online Payment Modal */}
      {pendingOnlineOrder && (
        <PaymentModal
          isOpen={!!pendingOnlineOrder}
          onClose={() => setPendingOnlineOrder(null)}
          orderId={pendingOnlineOrder.id}
          amount={pendingOnlineOrder.amount}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
