import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const phone = searchParams.get('phone') || '';
  const [otp, setOtp] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter 4-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({ phone, otp });
      login(res.user, res.token);
      toast.success("Mobile Verified Successfully!");
      navigate('/');
    } catch (e: any) {
      if (e.response?.status === 429) {
        toast.error("Too many OTP verification attempts! Please wait 1 minute before trying again.");
      } else {
        toast.error(e.response?.data?.message || "Invalid OTP code. Default demo OTP is 1234.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Verify Mobile OTP</h1>
        <p className="text-xs text-gray-500">Enter the 4-digit SMS OTP sent to <span className="font-bold text-gray-800">{phone}</span></p>
      </div>

      <form onSubmit={handleVerify} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-6">
        <Input
          label="Enter 4-Digit OTP"
          type="text"
          maxLength={4}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-center text-2xl tracking-[1em] font-black"
          required
        />

        <p className="text-[11px] text-gray-400 text-center font-medium">
          Demo Verification Code: <span className="font-bold text-emerald-700">1234</span>
        </p>

        <Button type="submit" isLoading={isLoading} className="w-full py-3" icon={<CheckCircle2 className="w-4 h-4" />}>
          Verify & Continue
        </Button>
      </form>
    </div>
  );
};
