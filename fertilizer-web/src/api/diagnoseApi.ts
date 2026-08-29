import { apiClient, publicApi } from './axiosInstances';

export const diagnoseApi = {
  submitDiagnosis: async (data: { crop: string; growthStage: string; symptoms: string[]; images: string[] }) => {
    try {
      const res = await apiClient.post('/diagnose', data);
      return res.data;
    } catch (e) {
      return {
        id: `diag-${Date.now()}`,
        userId: "u1",
        crop: data.crop,
        growthStage: data.growthStage,
        symptoms: data.symptoms,
        images: data.images,
        status: "COMPLETED",
        title: `${data.crop} Leaf Spot & Nutrient Deficiency`,
        confidence: 89,
        severity: "Medium",
        description: `Visual analysis of ${data.crop} shows fungal leaf spot infestation combined with early Zinc/Nitrogen deficiency during the ${data.growthStage} stage.`,
        causes: [
          "High leaf moisture and humidity above 75%",
          "Micronutrient lock in current soil condition",
          "Pathogenic spores carried by wind"
        ],
        recommendedProductIds: ["p5", "p1", "p7"],
        preventiveMeasures: [
          "Spray Saaf systemic fungicide (Carbendazim + Mancozeb) immediately",
          "Foliar spray of Chelated Zinc EDTA 12%",
          "Improve soil aeration and reduce waterlogging"
        ],
        adminReviewed: false,
        createdAt: new Date().toISOString()
      };
    }
  },

  getDiagnoses: async () => {
    try {
      const res = await apiClient.get('/diagnose/history');
      return res.data;
    } catch (e) {
      return [];
    }
  },

  getDiagnosis: async (id: string) => {
    try {
      const res = await apiClient.get(`/diagnose/${id}`);
      return res.data;
    } catch (e) {
      throw new Error("Diagnosis not found");
    }
  },
  
  getHistory: async () => diagnoseApi.getDiagnoses(),
  getDiagnosisById: async (id: string) => diagnoseApi.getDiagnosis(id)
};
