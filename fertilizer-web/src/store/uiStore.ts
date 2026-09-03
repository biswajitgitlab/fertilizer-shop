import { create } from 'zustand';
import { settingsApi } from '../api/settingsApi';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  chatOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleChat: () => void;
  setChatOpen: (isOpen: boolean) => void;
}

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }
};

const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (saved === 'light' || saved === 'dark') return saved;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const initialCollapsed = typeof localStorage !== 'undefined' ? localStorage.getItem('sidebar_collapsed') === 'true' : false;

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: initialCollapsed,
  theme: initialTheme,
  language: (localStorage.getItem('language') as 'en' | 'hi') || 'en',
  chatOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  toggleSidebarCollapsed: () => set((state) => {
    const nextCollapsed = !state.sidebarCollapsed;
    localStorage.setItem('sidebar_collapsed', String(nextCollapsed));
    return { sidebarCollapsed: nextCollapsed };
  }),

  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
      // Sync to DB asynchronously (non-blocking)
      settingsApi.save({ theme_mode: nextTheme }).catch(() => {});
      return { theme: nextTheme };
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    // Sync to DB asynchronously (non-blocking)
    settingsApi.save({ theme_mode: theme }).catch(() => {});
    set({ theme });
  },

  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },

  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setChatOpen: (isOpen) => set({ chatOpen: isOpen })
}));

