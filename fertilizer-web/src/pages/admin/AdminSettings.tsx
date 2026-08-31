import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useSiteSettingsStore, THEME_PALETTES, ThemePalette } from '../../store/siteSettingsStore';
import { Palette, Image, Type, Globe, Check, RotateCcw, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const settings = useSiteSettingsStore();

  const [appName, setAppName] = useState(settings.appName);
  const [appTagline, setAppTagline] = useState(settings.appTagline);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [selectedColor, setSelectedColor] = useState<ThemePalette>(settings.primaryColor);

  useEffect(() => {
    setAppName(settings.appName);
    setAppTagline(settings.appTagline);
    setLogoUrl(settings.logoUrl);
    setFaviconUrl(settings.faviconUrl);
    setSelectedColor(settings.primaryColor);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    settings.updateSettings({
      appName,
      appTagline,
      logoUrl,
      faviconUrl,
      primaryColor: selectedColor,
    });
    toast.success('Store identity & theme settings updated successfully!');
  };

  const handleReset = () => {
    settings.resetToDefault();
    toast.success('Settings reset to default!');
  };

  return (
    <AdminLayout title="Store Branding & Theme Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Header Card */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> White-Label Settings
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Store Identity & Theme Customizer</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize app name, logo, favicon, and primary accent color palette live for storefront and merchant portal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset Default
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Store Branding Text */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-500" />
              <span>General Store Branding</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Sarkar Fertilizer, AgriShop, AgriStore"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Appears in Navbar, Footer, Sidebar, and Document Titles.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={appTagline}
                  onChange={(e) => setAppTagline(e.target.value)}
                  placeholder="e.g. Govt Certified Agri Store"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Displayed below the main logo in headers and footers.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Logo & Favicon Assets */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-emerald-500" />
              <span>Brand Assets (Logo & Favicon)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Logo Image URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/logo.png or https://domain.com/logo.png"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">Preview:</span>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
                    <img src={logoUrl || '/logo.png'} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Favicon URL
                </label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="/favicon.ico or https://domain.com/favicon.png"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">Preview:</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
                    <img src={faviconUrl || '/favicon.ico'} alt="Favicon Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Accent Color Theme Selector */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-500" />
              <span>Primary Theme Accent Palette</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a primary brand color theme to apply dynamically across buttons, focus rings, highlights, and status badges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEME_PALETTES.map((palette) => (
                <div
                  key={palette.id}
                  onClick={() => setSelectedColor(palette.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedColor === palette.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl ${palette.previewClass} shadow-xs border border-white/20`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{palette.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{palette.p500}</p>
                    </div>
                  </div>

                  {selectedColor === palette.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button Bar */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Brand Settings
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
