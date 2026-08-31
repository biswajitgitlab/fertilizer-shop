import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePalette = 'emerald' | 'indigo' | 'blue' | 'violet' | 'rose' | 'amber';

export interface ColorPreset {
  id: ThemePalette;
  name: string;
  p500: string;
  p600: string;
  p700: string;
  previewClass: string;
}

export const THEME_PALETTES: ColorPreset[] = [
  { id: 'emerald', name: 'Emerald Green (Agri / Eco)', p500: '#10b981', p600: '#059669', p700: '#047857', previewClass: 'bg-emerald-500' },
  { id: 'indigo', name: 'Royal Indigo (Tech / Modern)', p500: '#6366f1', p600: '#4f46e5', p700: '#4338ca', previewClass: 'bg-indigo-500' },
  { id: 'blue', name: 'Ocean Blue (Corporate / E-com)', p500: '#3b82f6', p600: '#2563eb', p700: '#1d4ed8', previewClass: 'bg-blue-500' },
  { id: 'violet', name: 'Deep Violet (Fashion / Luxury)', p500: '#8b5cf6', p600: '#7c3aed', p700: '#6d28d9', previewClass: 'bg-violet-500' },
  { id: 'rose', name: 'Crimson Rose (Beauty / Lifestyle)', p500: '#f43f5e', p600: '#e11d48', p700: '#be123c', previewClass: 'bg-rose-500' },
  { id: 'amber', name: 'Warm Amber (Hardware / Food)', p500: '#f59e0b', p600: '#d97706', p700: '#b45309', previewClass: 'bg-amber-500' },
];

export interface SiteSettings {
  appName: string;
  appTagline: string;
  logoUrl: string;
  darkLogoUrl?: string;
  faviconUrl: string;
  primaryColor: ThemePalette;
}

interface SiteSettingsState extends SiteSettings {
  updateSettings: (settings: Partial<SiteSettings>) => void;
  applyThemeToDOM: () => void;
  resetToDefault: () => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  appName: 'Sarkar Fertilizer',
  appTagline: 'Govt Certified Agri Store',
  logoUrl: '/logo.png',
  darkLogoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  primaryColor: 'emerald',
};

export const useSiteSettingsStore = create<SiteSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
        get().applyThemeToDOM();
      },

      resetToDefault: () => {
        set(DEFAULT_SETTINGS);
        get().applyThemeToDOM();
      },

      applyThemeToDOM: () => {
        const { appName, faviconUrl, primaryColor } = get();

        // 1. Update browser tab title if on home page
        if (typeof document !== 'undefined') {
          // 2. Update favicon
          let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(faviconLink);
          }
          if (faviconUrl) {
            faviconLink.href = faviconUrl;
          }

          // 3. Inject CSS Variables
          const selectedPalette = THEME_PALETTES.find((p) => p.id === primaryColor) || THEME_PALETTES[0];
          const root = document.documentElement;
          root.style.setProperty('--color-primary-500', selectedPalette.p500);
          root.style.setProperty('--color-primary-600', selectedPalette.p600);
          root.style.setProperty('--color-primary-700', selectedPalette.p700);
        }
      },
    }),
    {
      name: 'app-site-settings-v1',
      onRehydrateStorage: () => (state) => {
        state?.applyThemeToDOM();
      },
    }
  )
);
