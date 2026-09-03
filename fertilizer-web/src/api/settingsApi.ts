import { apiClient, publicApi } from './axiosInstances';

export interface SiteSettingsData {
  app_name: string;
  app_tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  admin_color: string;
  theme_mode: 'light' | 'dark';
}

export const settingsApi = {
  /**
   * Public: fetch all settings from DB (called on app boot, no auth needed)
   */
  getPublic: async (): Promise<SiteSettingsData> => {
    const res = await publicApi.get('/settings');
    return res.data;
  },

  /**
   * Admin: save settings to DB (requires admin auth token)
   */
  save: async (data: Partial<SiteSettingsData>): Promise<SiteSettingsData> => {
    const res = await apiClient.put('/admin/settings', data);
    return res.data.settings;
  },
};
