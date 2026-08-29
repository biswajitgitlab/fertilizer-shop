import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CROPS_LIST } from '../../utils/constants';
import { plannerApi } from '../../api/plannerApi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Calendar, Sprout, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const PlanCreator: React.FC = () => {
  const navigate = useNavigate();
  const [crop, setCrop] = useState('Wheat');
  const [fieldArea, setFieldArea] = useState('5');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldArea || Number(fieldArea) <= 0) {
      toast.error("Please enter a valid field area in acres.");
      return;
    }

    setIsLoading(true);
    try {
      const plan = await plannerApi.createPlan({
        crop,
        fieldArea: Number(fieldArea),
        sowingDate
      });
      toast.success("New Seasonal Fertilizer Plan Created!");
      navigate(`/planner/${plan.id}`);
    } catch (e) {
      toast.error("Failed to create plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900">Create New Seasonal Fertilizer Calendar</h2>
          <p className="text-xs text-gray-500">Auto-calculates basal, vegetative, & foliar NPK spray dates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Select Target Crop</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CROPS_LIST.map((c) => (
              <button
                type="button"
                key={c.name}
                onClick={() => setCrop(c.name)}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  crop === c.name
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{c.icon}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Field Area (in Acres)"
          type="number"
          min="0.5"
          step="0.5"
          value={fieldArea}
          onChange={(e) => setFieldArea(e.target.value)}
          required
        />

        <Input
          label="Sowing Date"
          type="date"
          value={sowingDate}
          onChange={(e) => setSowingDate(e.target.value)}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full py-3">
          Generate Fertilizer Schedule
        </Button>
      </form>
    </div>
  );
};
