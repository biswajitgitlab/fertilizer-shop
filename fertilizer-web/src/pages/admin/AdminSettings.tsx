import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useSiteSettingsStore, THEME_PALETTES, ThemePalette } from '../../store/siteSettingsStore';
import { useUIStore } from '../../store/uiStore';
import { Palette, Image as ImageIcon, Type, Check, RotateCcw, Save, Sparkles, Upload, FileImage, RefreshCw, Sun, Moon, Monitor, LayoutDashboard, Store, ExternalLink, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Client-side HTML5 Canvas Image Resizer & Optimizer
 */
const resizeImageFile = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.92
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);
          width = Math.round(width * bestRatio);
          height = Math.round(height * bestRatio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const AdminSettings: React.FC = () => {
  const settings = useSiteSettingsStore();
  const { theme, setTheme } = useUIStore();

  const [appName, setAppName] = useState(settings.appName);
  const [appTagline, setAppTagline] = useState(settings.appTagline);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [selectedCustomerColor, setSelectedCustomerColor] = useState<ThemePalette>(settings.primaryColor);
  const [selectedAdminColor, setSelectedAdminColor] = useState<ThemePalette>(settings.adminColor || 'indigo');

  const [isResizingLogo, setIsResizingLogo] = useState(false);
  const [isResizingFavicon, setIsResizingFavicon] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAppName(settings.appName);
    setAppTagline(settings.appTagline);
    setLogoUrl(settings.logoUrl);
    setFaviconUrl(settings.faviconUrl);
    setSelectedCustomerColor(settings.primaryColor);
    setSelectedAdminColor(settings.adminColor || 'indigo');
  }, [settings]);

  // Handle Storefront Theme Accent Change
  const handleCustomerColorChange = (paletteId: ThemePalette, paletteName: string) => {
    setSelectedCustomerColor(paletteId);
    settings.updateSettings({ primaryColor: paletteId });
    toast.success(`Customer Storefront theme set to ${paletteName}! Navigating to storefront will display this theme.`);
  };

  // Handle Admin Theme Accent Change
  const handleAdminColorChange = (paletteId: ThemePalette, paletteName: string) => {
    setSelectedAdminColor(paletteId);
    settings.updateSettings({ adminColor: paletteId });
    toast.success(`Admin Portal theme set to ${paletteName}!`);
  };

  // Handle Logo File Choice & Auto-Resize (512x512 max aspect ratio PNG)
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file (.png, .jpg, .svg, .webp)");
      return;
    }

    setIsResizingLogo(true);
    try {
      const resizedDataUrl = await resizeImageFile(file, 512, 512, 'image/png', 0.92);
      setLogoUrl(resizedDataUrl);
      settings.updateSettings({ logoUrl: resizedDataUrl });
      toast.success(`Logo image uploaded & auto-fitted to 512px max bounds!`);
    } catch (err) {
      console.error("Logo resize error:", err);
      toast.error("Failed to process logo image file.");
    } finally {
      setIsResizingLogo(false);
    }
  };

  // Handle Favicon File Choice & Auto-Resize (64x64 square favicon PNG)
  const handleFaviconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file (.png, .ico, .jpg)");
      return;
    }

    setIsResizingFavicon(true);
    try {
      const resizedDataUrl = await resizeImageFile(file, 64, 64, 'image/png', 1.0);
      setFaviconUrl(resizedDataUrl);
      settings.updateSettings({ faviconUrl: resizedDataUrl });
      toast.success(`Favicon uploaded & auto-fitted to 64x64 square format!`);
    } catch (err) {
      console.error("Favicon resize error:", err);
      toast.error("Failed to process favicon image file.");
    } finally {
      setIsResizingFavicon(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    settings.updateSettings({
      appName,
      appTagline,
      logoUrl,
      faviconUrl,
      primaryColor: selectedCustomerColor,
      adminColor: selectedAdminColor,
    });
    toast.success('Store branding & dual theme settings updated live!');
  };

  const handleReset = () => {
    settings.resetToDefault();
    setTheme('dark');
    toast.success('Settings reset to default!');
  };

  const customerPaletteObj = THEME_PALETTES.find((p) => p.id === selectedCustomerColor) || THEME_PALETTES[0];
  const adminPaletteObj = THEME_PALETTES.find((p) => p.id === selectedAdminColor) || THEME_PALETTES[1];

  return (
    <AdminLayout title="Store Branding & Theme Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Header Card */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> White-Label Settings
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Store Identity &amp; Dual Theme Customizer</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure independent color palettes for Customer Storefront and Admin Portal, upload brand assets, and set app title.
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

        {/* Section 0: Light Mode vs Dark Mode Quick Switcher */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-500" />
              <span>App Mode (Light / Dark Theme)</span>
            </h3>
            <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">
              Active: {theme.toUpperCase()} MODE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                toast.success('Switched to Light Mode');
              }}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-sm transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Light Theme</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                toast.success('Switched to Dark Mode');
              }}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-sm transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-slate-950 text-white shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span>Dark Theme</span>
            </button>
          </div>
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
                  placeholder="e.g. Sarkar Fertilizer, AgriShop, E-Store"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={appTagline}
                  onChange={(e) => setAppTagline(e.target.value)}
                  placeholder="e.g. Govt Certified Agri Inputs & Direct Delivery"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Logo & Favicon Image Processor */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <span>Brand Assets (Logo &amp; Favicon Uploader)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LOGO FILE CHANGER */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Storefront &amp; Admin Header Logo
                </label>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* File Dropzone & Chooser Button */}
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 rounded-2xl p-5 text-center transition-all cursor-pointer space-y-2 group"
                >
                  {isResizingLogo ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Resizing &amp; Fitting Logo...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to Choose Logo File</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Auto-resizes &amp; fits to 512px max bounds</p>
                      </div>
                    </>
                  )}
                </div>

                {/* URL Input (Alternative) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Or Paste Image URL directly:</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/logo.png or https://domain.com/logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Logo Live Preview Card */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Live Logo Preview</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">Auto-Fit Applied</span>
                  </div>
                  <div className="h-16 rounded-xl bg-slate-900 p-2 flex items-center justify-center border border-slate-800">
                    <img src={logoUrl || '/logo.png'} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              </div>

              {/* FAVICON FILE CHANGER */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Favicon Icon Asset
                </label>

                <input
                  type="file"
                  ref={faviconInputRef}
                  onChange={handleFaviconFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* File Dropzone & Chooser Button */}
                <div
                  onClick={() => faviconInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 rounded-2xl p-5 text-center transition-all cursor-pointer space-y-2 group"
                >
                  {isResizingFavicon ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Cropping &amp; Fitting Favicon...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <FileImage className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to Choose Favicon File</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Auto-crops to 64x64 Square Favicon PNG</p>
                      </div>
                    </>
                  )}
                </div>

                {/* URL Input (Alternative) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Or Paste Favicon URL directly:</label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="/favicon.ico or https://domain.com/favicon.png"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Favicon Simulated Browser Tab Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Simulated Browser Tab Preview</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">64x64 Square</span>
                  </div>
                  <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-900 px-3 flex items-center gap-2 border border-slate-300 dark:border-slate-800">
                    <img src={faviconUrl || '/favicon.ico'} alt="Favicon Tab Preview" className="w-5 h-5 object-contain" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{appName || 'Sarkar Fertilizer'}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Section 3A: Customer Storefront Theme Selector */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <span>Customer Storefront Color Theme</span>
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active: {customerPaletteObj.name}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select the default color palette used for public customers on the storefront, product catalog, cart, and diagnosis pages.
            </p>

            {/* Live Customer UI Swatch Preview Box */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
                  style={{ backgroundColor: customerPaletteObj.p600 }}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Customer Storefront UI Swatch</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buttons, badges, and highlights will render in <span className="font-semibold text-slate-700 dark:text-slate-300">{customerPaletteObj.name}</span>
                  </p>
                </div>
              </div>

              <Link
                to="/"
                target="_blank"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-105 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                style={{ backgroundColor: customerPaletteObj.p600 }}
              >
                <span>View Storefront Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEME_PALETTES.map((palette) => (
                <div
                  key={`customer-${palette.id}`}
                  onClick={() => handleCustomerColorChange(palette.id, palette.name)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedCustomerColor === palette.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl ${palette.previewClass} shadow-xs border border-white/20`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{palette.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{palette.p500}</p>
                    </div>
                  </div>

                  {selectedCustomerColor === palette.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3B: Admin Portal Theme Selector */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                <span>Admin Portal Color Theme (Separate Theme)</span>
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Active: {adminPaletteObj.name}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a dedicated color palette for the Admin Portal dashboard, inventory, orders, settlement ledgers, and audit logs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEME_PALETTES.map((palette) => (
                <div
                  key={`admin-${palette.id}`}
                  onClick={() => handleAdminColorChange(palette.id, palette.name)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedAdminColor === palette.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl ${palette.previewClass} shadow-xs border border-white/20`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{palette.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{palette.p500}</p>
                    </div>
                  </div>

                  {selectedAdminColor === palette.id && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
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
