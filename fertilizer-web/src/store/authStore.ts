import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const savedToken = localStorage.getItem('token');
const savedUserStr = localStorage.getItem('user');
const savedLoginTime = localStorage.getItem('login_timestamp');

let initialUser: User | null = null;
let isExpired = false;

if (savedLoginTime) {
  const loginTime = parseInt(savedLoginTime, 10);
  if (Date.now() - loginTime > TWENTY_FOUR_HOURS_MS) {
    isExpired = true;
  }
}

if (savedUserStr && !isExpired) {
  try {
    initialUser = JSON.parse(savedUserStr);
  } catch (e) {
    console.error("Failed to parse saved user:", e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('login_timestamp');
  }
} else if (isExpired) {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('login_timestamp');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

const isStaffRole = (user: any): boolean => {
  if (!user) return false;
  if (user.is_staff === true) return true;
  if (user.role && typeof user.role === 'string' && user.role.toLowerCase() !== 'customer') return true;
  return false;
};

// Only consider authenticated if we have token, user, and it's not expired
const isInitiallyAuthenticated = !!(savedToken && initialUser && !isExpired);

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: isInitiallyAuthenticated ? savedToken : null,
  isAuthenticated: isInitiallyAuthenticated,
  isAdmin: isInitiallyAuthenticated && isStaffRole(initialUser),

  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('login_timestamp', Date.now().toString());
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: isStaffRole(user),
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('login_timestamp');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    try {
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false
    });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return {
        user: newUser,
        isAdmin: isStaffRole(newUser),
      };
    });
  }
}));
