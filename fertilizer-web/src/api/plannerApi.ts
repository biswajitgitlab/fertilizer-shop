import { apiClient } from './axiosInstances';

export const plannerApi = {
  getPlans: async () => {
    try {
      const res = await apiClient.get('/planner');
      return res.data;
    } catch (e) {
      return [];
    }
  },

  createPlan: async (data: { crop: string; fieldArea: number; sowingDate: string }) => {
    try {
      const res = await apiClient.post('/planner', data);
      return res.data;
    } catch (e) {
      const sowing = new Date(data.sowingDate || Date.now());
      const harvest = new Date(sowing.getTime() + 120 * 86400000);
      return {
        id: `plan-${Date.now()}`,
        userId: "u1",
        crop: data.crop,
        fieldArea: data.fieldArea,
        sowingDate: sowing.toISOString().split("T")[0],
        expectedHarvestDate: harvest.toISOString().split("T")[0],
        currentStage: "Germination & Seedling",
        daysSinceSowing: 1,
        tasks: [
          { id: "t1", date: sowing.toISOString().split("T")[0], stage: "Basal Application", product: "AgriPower Vermicompost", productId: "p2", qty: `${data.fieldArea * 50} kg`, method: "Soil Dressing", status: "Pending" },
          { id: "t2", date: new Date(sowing.getTime() + 20 * 86400000).toISOString().split("T")[0], stage: "Vegetative Phase", product: "KrishiGold NPK 19:19:19", productId: "p1", qty: `${data.fieldArea * 1} kg`, method: "Foliar Spray", status: "Pending" },
          { id: "t3", date: new Date(sowing.getTime() + 45 * 86400000).toISOString().split("T")[0], stage: "Flowering Phase", product: "Bio-Vita Growth Tonic", productId: "p6", qty: `${data.fieldArea * 0.5} Litre`, method: "Foliar Spray", status: "Pending" }
        ],
        createdAt: new Date().toISOString()
      };
    }
  },

  getPlan: async (id: string) => {
    try {
      const res = await apiClient.get(`/planner/${id}`);
      return res.data;
    } catch (e) {
      throw new Error("Plan not found");
    }
  },

  toggleTask: async (planId: string, taskId: string) => {
    try {
      const res = await apiClient.post(`/planner/${planId}/mark-done/${taskId}`);
      return res.data;
    } catch (e) {
      return { success: true };
    }
  },
  getMyPlans: async () => plannerApi.getPlans(),
  getPlanById: async (id: string) => plannerApi.getPlan(id),
  toggleTaskStatus: async (planId: string, taskId: string) => plannerApi.toggleTask(planId, taskId)
};
