import { publicApi } from './axiosInstances';
import { useSiteSettingsStore } from '../store/siteSettingsStore';

export const chatApi = {
  startSession: async () => {
    try {
      const res = await publicApi.post('/chat/start');
      return res.data;
    } catch (e) {
      return { session_token: `sess_${Date.now()}` };
    }
  },

  sendMessage: async (message: string) => {
    try {
      const res = await publicApi.post('/chat/message', { message });
      return res.data;
    } catch (e) {
      let replyText = `Namaste! I am KrishiMitra, your ${useSiteSettingsStore.getState().appName} fertilizer assistant. How can I help you today?`;
      const q = message.toLowerCase();
      if (q.includes("paddy") || q.includes("rice")) {
        replyText = "For Paddy crops, apply Zinc EDTA 12% to prevent leaf yellowing and NPK 19:19:19 for maximum tillers!";
      } else if (q.includes("pest") || q.includes("bug")) {
        replyText = "For sucking insects like whiteflies and thrips, apply Imidacloprid 17.8% SL (Confidor).";
      } else if (q.includes("herbicide") || q.includes("weed")) {
        replyText = "For weed control, Glycel 41% SL Systemic Herbicide is highly effective!";
      }
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  }
};
