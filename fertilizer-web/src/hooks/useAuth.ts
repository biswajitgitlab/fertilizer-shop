import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, isAdmin, login, logout, updateUser } = useAuthStore();
  return { user, token, isAuthenticated, isAdmin, login, logout, updateUser };
};
