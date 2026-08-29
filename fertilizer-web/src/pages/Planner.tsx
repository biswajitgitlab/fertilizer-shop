import React, { useState, useEffect } from 'react';
import { plannerApi } from '../api/plannerApi';
import { CropPlan } from '../types';
import { CropPlanCard } from '../components/planner/CropPlanCard';
import { PlanCreator } from '../components/planner/PlanCreator';
import { Calendar, Plus, Sprout } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Planner: React.FC = () => {
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await plannerApi.getMyPlans();
        setPlans(data);
      } catch (e) {
        console.error("Plans error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Seasonal Fertilizer & Spray Schedules</h1>
            <p className="text-xs text-gray-500">Calculate exact NPK doses and dates based on sowing date and acreage</p>
          </div>
        </div>

        <Button onClick={() => setShowCreator(!showCreator)} icon={<Plus className="w-4 h-4" />}>
          {showCreator ? 'View Existing Schedules' : 'Create New Crop Schedule'}
        </Button>
      </div>

      {showCreator ? (
        <PlanCreator />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded-3xl" />
          <div className="h-64 bg-gray-200 rounded-3xl" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 max-w-xl mx-auto">
          <Sprout className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No active seasonal schedules</h3>
          <p className="text-xs text-gray-500">Create a customized fertilizer calendar for Paddy, Wheat, Cotton, or Sugarcane.</p>
          <Button onClick={() => setShowCreator(true)}>Create Crop Schedule</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <CropPlanCard key={p.id} plan={p} />
          ))}
        </div>
      )}

    </div>
  );
};
