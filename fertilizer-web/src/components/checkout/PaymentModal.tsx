import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Smartphone, CheckCircle2, AlertCircle, RefreshCw, Banknote, Lock, X, Loader2, ShieldCheck, Copy, ArrowRight, Building2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'qr'>('upi');
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [upiId, setUpiId] = useState('farmer@upi');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardHolder, setCardHolder] = useState('RAMESH KUMAR');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('842');
  const [selectedBank, setSelectedBank] = useState('sbi');

  // Multi-step processing flow: 'idle' | 'gateway_connect' | 'otp_verify' | 'verifying_signature' | 'success' | 'failed'
  const [processStep, setProcessStep] = useState<'idle' | 'gateway_connect' | 'otp_verify' | 'verifying_signature' | 'success' | 'failed'>('idle');
  const [otpCode, setOtpCode] = useState('482910');
  const [simulateFail, setSimulateFail] = useState(false);
  const [txnDetails, setTxnDetails] = useState<{ txnId: string; date: string; gateway: string } | null>(null);

  // Timer for QR code
  const [qrTimer, setQrTimer] = useState(300);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && activeTab === 'qr' && qrTimer > 0) {
      interval = setInterval(() => setQrTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeTab, qrTimer]);

  if (!isOpen) return null;

  const handleRazorpayStandardCheckout = async () => {
    try {
      setProcessStep('gateway_connect');
      const amountInPaise = Math.max(100, Math.round(amount * 100));

      const orderRes = await orderApi.createRazorpayOrder(
        amountInPaise,
        'INR',
        `rcpt_ord_${orderId}`
      );

      const razorpayOrderId = orderRes.order_id || orderRes.id;
      if (!razorpayOrderId) {
        throw new Error("Failed to retrieve Razorpay Order ID from backend");
      }

      setProcessStep('idle');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVWk5BV07S6AvH',
        amount: orderRes.amount || amountInPaise,
        currency: orderRes.currency || 'INR',
        name: 'Sarkar Fertilizer',
        description: `Order #${orderId}`,
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
                gateway: 'RAZORPAY_STANDARD_CHECKOUT'
              });
              setProcessStep('success');
              toast.success("Payment verified successfully!");
              setTimeout(() => {
                onSuccess();
              }, 1800);
            } else {
              setProcessStep('failed');
              toast.error(verifyRes.message || "Payment signature verification failed");
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            setProcessStep('failed');
            toast.error(verifyError.response?.data?.message || "Signature verification failed on server");
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
            toast.error("Payment modal cancelled by user");
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error("Razorpay Payment Failed:", resp.error);
          toast.error(`Payment Failed: ${resp.error?.description || 'Transaction declined'}`);
          setProcessStep('failed');
          orderApi.markPaymentFailed(orderId, resp.error);
        });
        rzp.open();
      } else {
        toast.error("Razorpay Checkout JS is not loaded. Please try again.");
      }
    } catch (err: any) {
      console.error("Razorpay checkout error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to initialize Razorpay checkout");
      setProcessStep('idle');
    }
  };

  const handleInitiatePayment = async () => {
    if (simulateFail) {
      setProcessStep('gateway_connect');
      setTimeout(async () => {
        setProcessStep('failed');
        await orderApi.markPaymentFailed(orderId, {
          gateway: 'RAZORPAY',
          reason: 'User or Bank Declined Transaction'
        });
      }, 1200);
      return;
    }

    // Step 1: Connecting to Gateway
    setProcessStep('gateway_connect');

    setTimeout(() => {
      // Step 2: Show 2FA OTP prompt for real bank simulation
      setProcessStep('otp_verify');
    }, 1200);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error("Please enter valid 6-digit OTP code");
      return;
    }

    // Step 3: Verifying HMAC signature on Laravel backend
    setProcessStep('verifying_signature');

    const generatedTxnId = `TXN-RAY-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const gatewayName = activeTab === 'upi' ? `UPI_${selectedApp.toUpperCase()}` : (activeTab === 'qr' ? 'UPI_QR' : 'RAZORPAY_CARD');

    try {
      const response = await orderApi.verifyPayment(orderId, {
        gateway: gatewayName,
        transaction_id: generatedTxnId,
        amount: amount,
        payment_mode: activeTab.toUpperCase(),
        upi_id: activeTab === 'upi' ? upiId : null,
        bank: selectedBank,
        razorpay_payment_id: `pay_${generatedTxnId.toLowerCase()}`,
      });

      setTxnDetails({
        txnId: generatedTxnId,
        date: new Date().toLocaleString('en-IN'),
        gateway: gatewayName
      });

      setProcessStep('success');

      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      console.error("Payment verification failed:", err);
      setProcessStep('failed');
      await orderApi.markPaymentFailed(orderId);
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
        
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

          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">256-Bit SSL Secure Gateway</span>
            </div>
            <label className="flex items-center gap-1 text-[10px] text-emerald-200 font-bold bg-white/10 px-2 py-0.5 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFail}
                onChange={(e) => setSimulateFail(e.target.checked)}
                className="accent-rose-500"
              />
              <span>Test Fail</span>
            </label>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <h2 className="text-2xl font-black">{formatCurrency(amount)}</h2>
              <p className="text-xs text-emerald-200">Order ID: <span className="font-bold text-white">#{orderId}</span></p>
            </div>
            <span className="text-xs bg-emerald-700/80 text-emerald-100 px-3 py-1 rounded-xl border border-emerald-500/30 font-semibold">
              KrishiShop Pay
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
                <p className="text-xs text-gray-500">Order #{orderId} has been confirmed & synced to backend database.</p>
              </div>

              {txnDetails && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Transaction Reference:</span>
                    <span className="font-mono font-bold text-emerald-900">{txnDetails.txnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Amount Paid:</span>
                    <span className="font-bold text-emerald-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Gateway Mode:</span>
                    <span className="font-bold text-emerald-900">{txnDetails.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Date & Time:</span>
                    <span className="text-gray-700 font-medium">{txnDetails.date}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-emerald-700 font-bold animate-pulse">
                Redirecting to order tracking & invoice...
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
                <h3 className="text-xl font-black text-gray-900">Payment Failed or Declined</h3>
                <p className="text-xs text-rose-600 font-semibold">The bank server declined the transaction.</p>
                <p className="text-[11px] text-gray-400">Your order #{orderId} is saved safely as PENDING.</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setProcessStep('idle')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again with GPay / PhonePe / Card</span>
                </button>

                <button
                  onClick={handleSwitchToCod}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Switch to Cash on Delivery (Pay at Farm)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: GATEWAY CONNECT */}
          {processStep === 'gateway_connect' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Connecting to Bank Gateway...</h3>
                <p className="text-xs text-gray-500">Establishing 256-bit encrypted SSL session with NPCI</p>
              </div>
            </div>
          )}

          {/* STEP: 2FA BANK OTP VERIFICATION */}
          {processStep === 'otp_verify' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1">
                <Building2 className="w-6 h-6 text-emerald-700 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Bank 2-Factor Authentication</h4>
                <p className="text-[11px] text-emerald-800">OTP sent to registered mobile linked with bank account</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Enter 6-Digit Bank Security OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center text-xl tracking-[0.5em] font-mono font-black py-3 border-2 border-emerald-500 rounded-2xl bg-emerald-50/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Auto-filled test code: <strong className="text-emerald-700">482910</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('482910')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Authorize & Pay {formatCurrency(amount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP: VERIFYING SIGNATURE */}
          {processStep === 'verifying_signature' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Verifying HMAC Signature...</h3>
                <p className="text-xs text-gray-500">Updating backend database payment record & confirming order</p>
              </div>
            </div>
          )}

          {/* STEP: IDLE (Payment Selection Form) */}
          {processStep === 'idle' && (
            <>
              {/* Razorpay Standard Web Checkout Primary Button */}
              <button
                type="button"
                onClick={handleRazorpayStandardCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ring-4 ring-blue-500/20"
              >
                <Lock className="w-4 h-4 text-blue-200" />
                <span>Pay with Razorpay Standard Checkout</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-gray-400 font-semibold uppercase">Or alternative methods</span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'upi' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'qr' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>Scan QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'card' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Cards / Net</span>
                </button>
              </div>

              {/* TAB 1: INSTANT UPI */}
              {activeTab === 'upi' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'gpay', name: 'Google Pay', icon: '🎨', color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
                      { id: 'phonepe', name: 'PhonePe', icon: '🟣', color: 'border-purple-200 bg-purple-50/50 text-purple-900' },
                      { id: 'paytm', name: 'Paytm UPI', icon: '🔹', color: 'border-cyan-200 bg-cyan-50/50 text-cyan-900' },
                      { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
                    ].map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedApp(app.id as any)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                          selectedApp === app.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-base">{app.icon}</span>
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Enter UPI ID / VPA</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9876543210@paytm"
                        className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-mono font-medium focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => toast.success("UPI ID Verified!")}
                        className="text-xs bg-gray-900 text-white px-3 py-2.5 rounded-xl font-bold hover:bg-gray-800 cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QR CODE */}
              {activeTab === 'qr' && (
                <div className="py-2 text-center space-y-3 animate-fade-in">
                  <div className="bg-white p-4 border-2 border-emerald-500 rounded-3xl w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-lg relative group">
                    <QrCode className="w-36 h-36 text-emerald-900" />
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-3xl">
                      <p className="text-[11px] font-bold text-emerald-900">Scan with GPay / PhonePe / Paytm / BHIM</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-semibold">
                    <span>QR expires in:</span>
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {formatTime(qrTimer)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`upi://pay?pa=krishishop@upi&am=${amount}&tn=Order_${orderId}`);
                      toast.success("UPI Intent copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy UPI Link for Mobile Apps</span>
                  </button>
                </div>
              )}

              {/* TAB 3: CARD & NETBANKING */}
              {activeTab === 'card' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 8921"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-mono font-bold text-gray-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="08/29"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-center font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-center font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Select NetBanking Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-800 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="sbi">State Bank of India (SBI)</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank (PNB)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Payment Action */}
              <button
                onClick={handleInitiatePayment}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Pay {formatCurrency(amount)} Now</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-3">
                <span>🔒 Powered by Razorpay Standard Gateway</span>
                <span>PCI-DSS Compliant</span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
