import React from 'react';
import { ShippingAddress } from '../../types';
import { INDIAN_STATES } from '../../utils/constants';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface AddressFormProps {
  address: ShippingAddress;
  onChangeAddress: (updated: ShippingAddress) => void;
  onSubmitNext: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onChangeAddress,
  onSubmitNext
}) => {
  const handleChange = (field: keyof ShippingAddress, value: string) => {
    onChangeAddress({ ...address, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitNext();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
        Delivery & Farm Shipping Address
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name / Farmer Name *"
          value={address.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
        <Input
          label="Mobile Phone (10 digits) *"
          type="tel"
          pattern="[0-9]{10}"
          value={address.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Alternate Contact Number"
          type="tel"
          value={address.altPhone || ''}
          onChange={(e) => handleChange('altPhone', e.target.value)}
        />
        <Input
          label="6-Digit Pincode *"
          pattern="[0-9]{6}"
          value={address.pincode}
          onChange={(e) => handleChange('pincode', e.target.value)}
          required
        />
      </div>

      <Input
        label="House / Farm House / Street Address *"
        value={address.line1}
        onChange={(e) => handleChange('line1', e.target.value)}
        required
      />

      <Input
        label="Landmark / Village / Khasra No."
        value={address.line2 || ''}
        onChange={(e) => handleChange('line2', e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="City / Tehsil *"
          value={address.city}
          onChange={(e) => handleChange('city', e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">State *</label>
          <select
            value={address.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="px-8">
          Continue to Order Review
        </Button>
      </div>
    </form>
  );
};
