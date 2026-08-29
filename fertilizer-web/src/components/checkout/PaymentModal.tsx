import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Banknote, Lock, X, Loader2, ShieldCheck, CreditCard, Smartphone, QrCode, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { orderApi } from '../../api/orderApi';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | number;
  amount: number;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onSuccess
}) => {
  const [processStep, setProcessStep] = useState<'idle' | 'gateway_connect' | 'verifying_signature' | 'success' | 'failed'>('idle');
  const [txnDetails, setTxnDetails] = useState<{ txnId: string; date: string; gateway: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCircuitOpen, setIsCircuitOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setProcessStep('idle');
      setErrorMessage('');
      setIsCircuitOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRazorpayCheckout = async () => {
    try {
      setProcessStep('gateway_connect');
      setIsCircuitOpen(false);
      const amountInPaise = Math.max(100, Math.round(amount * 100));

      const orderRes = await orderApi.createRazorpayOrder(
        amountInPaise,
        'INR',
        `rcpt_ord_${orderId}`
      );

      if (orderRes.circuit_open) {
        setIsCircuitOpen(true);
        const msg = orderRes.message || "Payment gateway downtime detected. Please use Cash on Delivery.";
        setErrorMessage(msg);
        toast.error(msg);
        setProcessStep('idle');
        return;
      }

      const razorpayOrderId = orderRes.order_id || orderRes.id;
      if (!razorpayOrderId) {
        throw new Error("Failed to create Razorpay Order on server");
      }

      setProcessStep('idle');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVWk5BV07S6AvH',
        amount: orderRes.amount || amountInPaise,
        currency: orderRes.currency || 'INR',
        name: 'Sarkar Fertilizer',
        description: `Payment for Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setProcessStep('verifying_signature');
          try {
            const verifyRes = await orderApi.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });

            if (verifyRes.status === 'success' || verifyRes.message?.includes('verified') || verifyRes.razorpay_payment_id) {
              setTxnDetails({
                txnId: response.razorpay_payment_id,
                date: new Date().toLocaleString('en-IN'),
                gateway: 'RAZORPAY'
              });
              setProcessStep('success');
              toast.success("Payment verified successfully!");
              setTimeout(() => {
                onSuccess();
              }, 1800);
            } else {
              setProcessStep('failed');
              setErrorMessage(verifyRes.message || "Payment signature verification failed");
              toast.error(verifyRes.message || "Payment verification failed");
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            setProcessStep('failed');
            const msg = verifyError.response?.data?.message || "Signature verification failed on server";
            setErrorMessage(msg);
            toast.error(msg);
          }
        },
        prefill: {
          name: "Farmer Customer",
          email: "farmer@example.com",
          contact: "9876543210"
        },
        theme: {
          color: "#059669"
        },
        modal: {
          ondismiss: function () {
            toast.error("Razorpay checkout closed");
            setProcessStep('idle');
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error("Razorpay Payment Failed:", resp.error);
          const failReason = resp.error?.description || 'Transaction declined by bank/gateway';
          setErrorMessage(failReason);
          toast.error(`Payment Failed: ${failReason}`);
          setProcessStep('failed');
          orderApi.markPaymentFailed(orderId, resp.error);
        });
        rzp.open();
      } else {
        toast.error("Razorpay Checkout SDK is loading. Please try again.");
        setProcessStep('idle');
      }
    } catch (err: any) {
      console.error("Razorpay checkout error:", err);
      const isCircuit = err.response?.data?.circuit_open || err.response?.status === 503;
      if (isCircuit) {
        setIsCircuitOpen(true);
      }
      const msg = err.response?.data?.message || err.message || "Failed to initialize Razorpay checkout";
      setErrorMessage(msg);
      toast.error(msg);
      setProcessStep('idle');
    }
  };

  const handleSwitchToCod = async () => {
    setProcessStep('gateway_connect');
    try {
      await orderApi.switchToCod(orderId);
      toast.success("Switched to Cash on Delivery! Order confirmed.");
      onSuccess();
    } catch (e) {
      toast.error("Failed to switch payment method.");
      setProcessStep('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 space-y-2 relative">
          {processStep === 'idle' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Razorpay 256-Bit SSL Secure</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <h2 className="text-2xl font-black">{formatCurrency(amount)}</h2>
              <p className="text-xs text-emerald-200">Order ID: <span className="font-bold text-white">#{orderId}</span></p>
            </div>
            <span className="text-xs bg-emerald-700/80 text-emerald-100 px-3 py-1 rounded-xl border border-emerald-500/30 font-semibold">
              Official Razorpay Gateway
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* STEP: SUCCESS */}
          {processStep === 'success' && (
            <div className="py-6 text-center space-y-5 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-inner">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900">Payment Successful!</h3>
                <p className="text-xs text-gray-500">Order #{orderId} has been confirmed & recorded in database.</p>
              </div>

              {txnDetails && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Razorpay Payment ID:</span>
                    <span className="font-mono font-bold text-emerald-900">{txnDetails.txnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Amount Paid:</span>
                    <span className="font-bold text-emerald-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Date & Time:</span>
                    <span className="text-gray-700 font-medium">{txnDetails.date}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-emerald-700 font-bold animate-pulse">
                Redirecting to order details...
              </p>
            </div>
          )}

          {/* STEP: FAILED */}
          {processStep === 'failed' && (
            <div className="py-6 text-center space-y-5 animate-scale-in">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50">
                <AlertCircle className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900">Payment Failed or Cancelled</h3>
                <p className="text-xs text-rose-600 font-semibold">{errorMessage || "Transaction could not be completed."}</p>
                <p className="text-[11px] text-gray-400">Your order #{orderId} remains saved as PENDING.</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleRazorpayCheckout}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment with Razorpay</span>
                </button>

                <button
                  onClick={handleSwitchToCod}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Switch to Cash on Delivery</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: GATEWAY CONNECT */}
          {processStep === 'gateway_connect' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Connecting to Razorpay...</h3>
                <p className="text-xs text-gray-500">Preparing secure payment checkout</p>
              </div>
            </div>
          )}

          {/* STEP: VERIFYING SIGNATURE */}
          {processStep === 'verifying_signature' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Verifying Payment Signature...</h3>
                <p className="text-xs text-gray-500">Validating HMAC token with backend server</p>
              </div>
            </div>
          )}

          {/* STEP: IDLE */}
          {processStep === 'idle' && (
            <div className="space-y-5">

              {/* CIRCUIT BREAKER DOWNTIME BANNER */}
              {isCircuitOpen && (
                <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-2 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-black">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                    <span>Payment Gateway Circuit Breaker Open</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {errorMessage || "Razorpay API is experiencing temporary server issues. Switch to Cash on Delivery for instant order fulfillment."}
                  </p>
                </div>
              )}

              {/* Payment Methods Supported */}
              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-emerald-950 block">Supported Payment Options:</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs flex flex-col items-center gap-1">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-[11px] text-gray-800">UPI / QR</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs flex flex-col items-center gap-1">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-[11px] text-gray-800">Cards</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs flex flex-col items-center gap-1">
                    <QrCode className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-[11px] text-gray-800">NetBanking</span>
                  </div>
                </div>
              </div>

              {/* Primary Razorpay Action Button */}
              <button
                type="button"
                onClick={handleRazorpayCheckout}
                className={`w-full py-4 font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] ring-4 ${
                  isCircuitOpen
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-amber-500/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white ring-emerald-500/20'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>{isCircuitOpen ? 'Retry Razorpay Gateway' : `Pay ${formatCurrency(amount)} with Razorpay`}</span>
              </button>

              {/* Secondary Option: Switch to COD */}
              <button
                type="button"
                onClick={handleSwitchToCod}
                className={`w-full py-3.5 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCircuitOpen
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>{isCircuitOpen ? '✨ Recommended: Switch to Cash on Delivery (COD)' : 'Switch to Cash on Delivery (COD)'}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-3">
                <span>🔒 Powered by Official Razorpay Gateway</span>
                <span>PCI-DSS Compliant</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
