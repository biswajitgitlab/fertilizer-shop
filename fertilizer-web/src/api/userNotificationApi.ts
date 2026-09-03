import { apiClient } from './axiosInstances';

export interface UserNotification {
  id: string;
  numeric_id?: number;
  title: string;
  message: string;
  time: string;
  timestamp: string;
  type: string;
  unread: boolean;
  link?: string;
}

export interface UserNotificationsResponse {
  notifications: UserNotification[];
  unread_count: number;
}

export const userNotificationApi = {
  getNotifications: async (): Promise<UserNotificationsResponse> => {
    try {
      const res = await apiClient.get('/user/notifications');
      return res.data;
    } catch (e) {
      return { notifications: [], unread_count: 0 };
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/user/notifications/${id}/read`);
    } catch (e) {
      console.error("markAsRead error:", e);
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.post('/user/notifications/read-all');
    } catch (e) {
      console.error("markAllAsRead error:", e);
    }
  }
};
