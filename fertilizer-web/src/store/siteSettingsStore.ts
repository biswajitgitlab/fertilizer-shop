import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsApi } from '../api/settingsApi';

export type ThemePalette =
  | 'emerald'
  | 'indigo'
  | 'blue'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'teal'
  | 'cyan'
  | 'lime'
  | 'fuchsia'
  | 'slate'
  | 'orange';

export interface ColorPreset {
  id: ThemePalette;
  name: string;
  p50: string; p100: string; p200: string; p300: string; p400: string;
  p500: string; p600: string; p700: string; p800: string; p900: string;
  p950: string;
  previewClass: string;
}

export const THEME_PALETTES: ColorPreset[] = [
  { id: 'emerald', name: 'Emerald Green (Agri / Eco)', p50: '#f0fdf4', p100: '#dcfce7', p200: '#bbf7d0', p300: '#86efac', p400: '#34d399', p500: '#10b981', p600: '#059669', p700: '#047857', p800: '#065f46', p900: '#064e3b', p950: '#022c22', previewClass: 'bg-emerald-500' },
  { id: 'indigo', name: 'Royal Indigo (Tech / Modern)', p50: '#eef2ff', p100: '#e0e7ff', p200: '#c7d2fe', p300: '#a5b4fc', p400: '#818cf8', p500: '#6366f1', p600: '#4f46e5', p700: '#4338ca', p800: '#3730a3', p900: '#312e81', p950: '#0f172a', previewClass: 'bg-indigo-500' },
  { id: 'blue', name: 'Ocean Blue (Corporate / Trust)', p50: '#eff6ff', p100: '#dbeafe', p200: '#bfdbfe', p300: '#93c5fd', p400: '#60a5fa', p500: '#3b82f6', p600: '#2563eb', p700: '#1d4ed8', p800: '#1e40af', p900: '#1e3a8a', p950: '#0b192c', previewClass: 'bg-blue-500' },
  { id: 'violet', name: 'Deep Violet (Luxury / Premium)', p50: '#f5f3ff', p100: '#ede9fe', p200: '#ddd6fe', p300: '#c4b5fd', p400: '#a78bfa', p500: '#8b5cf6', p600: '#7c3aed', p700: '#6d28d9', p800: '#5b21b6', p900: '#4c1d95', p950: '#130924', previewClass: 'bg-violet-500' },
  { id: 'rose', name: 'Crimson Rose (Bold / Lifestyle)', p50: '#fff1f2', p100: '#ffe4e6', p200: '#fecdd3', p300: '#fda4af', p400: '#fb7185', p500: '#f43f5e', p600: '#e11d48', p700: '#be123c', p800: '#9f1239', p900: '#881337', p950: '#1f040c', previewClass: 'bg-rose-500' },
  { id: 'amber', name: 'Warm Amber (Harvest / Earthy)', p50: '#fffbeb', p100: '#fef3c7', p200: '#fde68a', p300: '#fcd34d', p400: '#fbbf24', p500: '#f59e0b', p600: '#d97706', p700: '#b45309', p800: '#92400e', p900: '#78350f', p950: '#1c0c02', previewClass: 'bg-amber-500' },
  { id: 'teal', name: 'Teal Breeze (Bio / Refresh)', p50: '#f0fdfa', p100: '#ccfbf1', p200: '#99f6e4', p300: '#5eead4', p400: '#2dd4bf', p500: '#14b8a6', p600: '#0d9488', p700: '#0f766e', p800: '#115e59', p900: '#134e4a', p950: '#042f2e', previewClass: 'bg-teal-500' },
  { id: 'cyan', name: 'Electric Cyan (Futuristic)', p50: '#ecfeff', p100: '#cffaff', p200: '#a5f3fc', p300: '#67e8f9', p400: '#22d3ee', p500: '#06b6d4', p600: '#0891b2', p700: '#0e7490', p800: '#155e75', p900: '#164e63', p950: '#083344', previewClass: 'bg-cyan-500' },
  { id: 'lime', name: 'Neon Lime (Organic / Vital)', p50: '#f7fee7', p100: '#ecfccb', p200: '#d9f99d', p300: '#bef264', p400: '#a3e635', p500: '#84cc16', p600: '#65a30d', p700: '#4d7c0f', p800: '#3f6212', p900: '#365314', p950: '#1a2e05', previewClass: 'bg-lime-500' },
  { id: 'fuchsia', name: 'Vibrant Fuchsia (Modern Retail)', p50: '#fdf4ff', p100: '#fae8ff', p200: '#f5d0fe', p300: '#f0abfc', p400: '#e879f9', p500: '#d946ef', p600: '#c026d3', p700: '#a21caf', p800: '#86198f', p900: '#701a75', p950: '#2e0933', previewClass: 'bg-fuchsia-500' },
  { id: 'slate', name: 'Slate Steel (Minimal / Pro)', p50: '#f8fafc', p100: '#f1f5f9', p200: '#e2e8f0', p300: '#cbd5e1', p400: '#94a3b8', p500: '#64748b', p600: '#475569', p700: '#334155', p800: '#1e293b', p900: '#0f172a', p950: '#020617', previewClass: 'bg-slate-500' },
  { id: 'orange', name: 'Sunset Orange (Warm Energy)', p50: '#fff7ed', p100: '#ffedd5', p200: '#fed7aa', p300: '#fdba74', p400: '#fb923c', p500: '#f97316', p600: '#ea580c', p700: '#c2410c', p800: '#9a3412', p900: '#7c2d12', p950: '#2e1005', previewClass: 'bg-orange-500' },
];

export interface SiteSettings {
  appName: string;
  appTagline: string;
  logoUrl: string;
  darkLogoUrl?: string;
  faviconUrl: string;
  primaryColor: ThemePalette;
  adminColor: ThemePalette;
}

interface SiteSettingsState extends SiteSettings {
  updateSettings: (settings: Partial<SiteSettings>) => void;
  applyThemeToDOM: (targetPath?: string) => void;
  resetToDefault: () => void;
  /** Fetch settings from DB and hydrate store — call once on app boot */
  loadFromDB: () => Promise<void>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  appName: 'Sarkar Fertilizer',
  appTagline: 'Govt Certified Agri Store',
  logoUrl: '/logo.png',
  darkLogoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  primaryColor: 'emerald',
  adminColor: 'indigo',
};

export const useSiteSettingsStore = create<SiteSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
        get().applyThemeToDOM();

        // Map camelCase → snake_case for DB
        const dbPayload: Record<string, string> = {};
        if (newSettings.appName      != null) dbPayload.app_name      = newSettings.appName;
        if (newSettings.appTagline   != null) dbPayload.app_tagline   = newSettings.appTagline;
        if (newSettings.logoUrl      != null) dbPayload.logo_url      = newSettings.logoUrl;
        if (newSettings.faviconUrl   != null) dbPayload.favicon_url   = newSettings.faviconUrl;
        if (newSettings.primaryColor != null) dbPayload.primary_color = newSettings.primaryColor;
        if (newSettings.adminColor   != null) dbPayload.admin_color   = newSettings.adminColor;

        if (Object.keys(dbPayload).length > 0) {
          settingsApi.save(dbPayload as any).catch((err) =>
            console.warn('[SiteSettings] DB save failed (non-critical):', err)
          );
        }
      },

      resetToDefault: () => {
        set(DEFAULT_SETTINGS);
        get().applyThemeToDOM();
        settingsApi.save({
          app_name:      DEFAULT_SETTINGS.appName,
          app_tagline:   DEFAULT_SETTINGS.appTagline,
          logo_url:      DEFAULT_SETTINGS.logoUrl,
          favicon_url:   DEFAULT_SETTINGS.faviconUrl,
          primary_color: DEFAULT_SETTINGS.primaryColor,
          admin_color:   DEFAULT_SETTINGS.adminColor,
        }).catch(() => {});
      },

      loadFromDB: async () => {
        try {
          const data = await settingsApi.getPublic();
          const merged: Partial<SiteSettings> = {};
          if (data.app_name)      merged.appName      = data.app_name;
          if (data.app_tagline)   merged.appTagline   = data.app_tagline;
          if (data.logo_url)      merged.logoUrl      = data.logo_url;
          if (data.favicon_url)   merged.faviconUrl   = data.favicon_url;
          if (data.primary_color) merged.primaryColor = data.primary_color as ThemePalette;
          if (data.admin_color)   merged.adminColor   = data.admin_color   as ThemePalette;
          set((state) => ({ ...state, ...merged }));
          get().applyThemeToDOM();
        } catch (err) {
          // Non-critical: localStorage cache used as fallback
          console.warn('[SiteSettings] DB load failed, using cached settings:', err);
        }
      },

      applyThemeToDOM: (targetPath?: string) => {
        const { faviconUrl, primaryColor, adminColor } = get();

        if (typeof document !== 'undefined') {
          let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(faviconLink);
          }
          if (faviconUrl) faviconLink.href = faviconUrl;

          const currentPath = targetPath !== undefined ? targetPath : window.location.pathname;
          const isAdmin = currentPath.startsWith('/admin');
          const activeColor = isAdmin ? (adminColor || 'indigo') : (primaryColor || 'emerald');

          const selectedPalette = THEME_PALETTES.find((p) => p.id === activeColor) || THEME_PALETTES[0];
          const root = document.documentElement;
          root.style.setProperty('--color-primary-50',  selectedPalette.p50);
          root.style.setProperty('--color-primary-100', selectedPalette.p100);
          root.style.setProperty('--color-primary-200', selectedPalette.p200);
          root.style.setProperty('--color-primary-300', selectedPalette.p300);
          root.style.setProperty('--color-primary-400', selectedPalette.p400);
          root.style.setProperty('--color-primary-500', selectedPalette.p500);
          root.style.setProperty('--color-primary-600', selectedPalette.p600);
          root.style.setProperty('--color-primary-700', selectedPalette.p700);
          root.style.setProperty('--color-primary-800', selectedPalette.p800);
          root.style.setProperty('--color-primary-900', selectedPalette.p900);
          root.style.setProperty('--color-primary-950', selectedPalette.p950);
          root.setAttribute('data-theme-color', selectedPalette.id);
          root.setAttribute('data-layout-scope', isAdmin ? 'admin' : 'storefront');
        }
      },
    }),
    {
      name: 'app-site-settings-v2',
      onRehydrateStorage: () => (state) => {
        state?.applyThemeToDOM();
      },
    }
  )
);
