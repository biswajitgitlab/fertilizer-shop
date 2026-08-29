import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  chatOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleChat: () => void;
  setChatOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  language: (localStorage.getItem('language') as 'en' | 'hi') || 'en',
  chatOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },

  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setChatOpen: (isOpen) => set({ chatOpen: isOpen })
}));
