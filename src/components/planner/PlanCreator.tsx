import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CROPS_LIST } from '../../utils/constants';
import { plannerApi } from '../../api/plannerApi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Calendar, Sprout, Check, Sparkles } from 'lucide-react';
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
    <div className="max-w-xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-emerald-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-emerald-900/5 space-y-6">
      <div className="flex items-center gap-3 border-b border-emerald-100 dark:border-slate-800 pb-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-2xs shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>Create Seasonal Fertilizer Calendar</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Auto-calculates basal, vegetative, & foliar NPK spray dates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">Select Target Crop</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CROPS_LIST.map((c) => (
              <button
                type="button"
                key={c.name}
                onClick={() => setCrop(c.name)}
                className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  crop === c.name
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                    : 'bg-emerald-50/40 dark:bg-slate-800/40 text-gray-700 dark:text-slate-300 border-emerald-100 dark:border-slate-700 hover:bg-emerald-100/50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span className="truncate">{c.name}</span>
                {crop === c.name && <Check className="w-3.5 h-3.5 ml-auto text-white" />}
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

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all"
        >
          Generate Fertilizer Schedule
        </Button>
      </form>
    </div>
  );
};

