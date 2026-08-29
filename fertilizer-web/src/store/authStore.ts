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

const savedToken = localStorage.getItem('token');
const savedUserStr = localStorage.getItem('user');
let initialUser: User | null = null;

if (savedUserStr) {
  try {
    initialUser = JSON.parse(savedUserStr);
  } catch (e) {
    console.error("Failed to parse saved user:", e);
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

// Only consider authenticated if we have both token AND user stored
const isInitiallyAuthenticated = !!(savedToken && initialUser);

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: isInitiallyAuthenticated ? savedToken : null,
  isAuthenticated: isInitiallyAuthenticated,
  isAdmin: initialUser?.role?.toLowerCase() === 'admin' && isInitiallyAuthenticated,

  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role?.toLowerCase() === 'admin'
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        isAdmin: newUser.role?.toLowerCase() === 'admin'
      };
    });
  }
}));
