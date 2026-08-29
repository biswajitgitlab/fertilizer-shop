import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { productApi } from '../../api/productApi';
import { Category } from '../../types';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Save, Upload, Link as LinkIcon, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_AGRICULTURE_IMAGES = [
  { label: 'NPK Granules / Bags', url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600' },
  { label: 'Organic Neem Oil Bottle', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&q=80&w=600' },
  { label: 'Green Crop Growth Liquid', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600' },
  { label: 'Micronutrient Spray', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600' },
  { label: 'Wheat Field & Fertilizer', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600' },
];

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Chemical Fertilizers',
    price: '',
    originalPrice: '',
    stock: '',
    unit: '1 kg Pack',
    description: '',
    composition: '',
    dosage: '2-3 gm per liter of water',
    npk: { n: 0, p: 0, k: 0 },
    images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600'] as string[],
    suitableCrops: ['Wheat', 'Paddy', 'Vegetables']
  });

  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    productApi.getCategories().then(cats => setCategories(cats || []));
    if (isEdit && id) {
      adminApi.getProducts().then(prods => {
        const found = prods.find(p => p.id === id);
        if (found) {
          setFormData({
            name: found.name,
            category: found.category,
            price: found.price.toString(),
            originalPrice: found.originalPrice ? found.originalPrice.toString() : '',
            stock: found.stock.toString(),
            unit: found.unit,
            description: found.description,
            composition: found.composition || '',
            dosage: found.dosage || '',
            npk: found.npk || { n: 0, p: 0, k: 0 },
            images: Array.isArray(found.images) ? found.images : [found.images || PRESET_AGRICULTURE_IMAGES[0].url],
            suitableCrops: found.suitableCrops
          });
        }
      });
    }
  }, [id, isEdit]);

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()]
    }));
    setCustomImageUrl('');
    toast.success("Product image URL added!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
          toast.success(`Uploaded ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      toast.error("Product must have at least 1 image.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSelectPresetImage = (url: string) => {
    if (formData.images.includes(url)) {
      toast.error("Image already added to this product.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
    toast.success("Preset image selected!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error("Please add at least one product image.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock)
      };

      if (isEdit && id) {
        await adminApi.updateProduct(id, payload);
        toast.success("Product SKU updated successfully!");
      } else {
        await adminApi.createProduct(payload);
        toast.success("New Fertilizer SKU created!");
      }
      navigate('/admin/products');
    } catch (e) {
      toast.error("Failed to save product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? "Edit Fertilizer SKU" : "Create New Fertilizer SKU"}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button onClick={() => navigate('/admin/products')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>

        <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6 text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title / Chemical Brand Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Sarkar NPK 19:19:19 Soluble Fertilizer"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              >
                {categories.map(c => <option key={c.id} value={c.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pack Unit (e.g. 50 kg Bag, 1 L Bottle) *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Product Image Manager */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Product Images &amp; Visual Assets *</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{formData.images.length} Image(s) Attached</span>
            </div>

            {/* Current Attached Images Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-square">
                  <img src={img} alt={`Product asset ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      PRIMARY
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option A: Image File Uploader */}
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center transition-all bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Local File / Drag &amp; Drop</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">PNG, JPG, WebP up to 10MB</p>
              </div>

              {/* Option B: Direct URL Input */}
              <div className="p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Paste Image URL</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Option C: Preset Agriculture Images Library */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Quick Select High-Res Agriculture Stock Assets:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_AGRICULTURE_IMAGES.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSelectPresetImage(preset.url)}
                    className="text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <img src={preset.url} alt={preset.label} className="w-3.5 h-3.5 rounded object-cover" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Original MRP Price (₹)</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* NPK Inputs */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 space-y-2">
            <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-400">NPK Nitrogen-Phosphorus-Potassium Ratio (%)</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">Nitrogen (N)</span>
                <input
                  type="number"
                  value={formData.npk.n}
                  onChange={(e) => setFormData({ ...formData, npk: { ...formData.npk, n: Number(e.target.value) } })}
                  className="w-full text-xs bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 rounded-xl px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">Phosphorus (P)</span>
                <input
                  type="number"
                  value={formData.npk.p}
                  onChange={(e) => setFormData({ ...formData, npk: { ...formData.npk, p: Number(e.target.value) } })}
                  className="w-full text-xs bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 rounded-xl px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">Potassium (K)</span>
                <input
                  type="number"
                  value={formData.npk.k}
                  onChange={(e) => setFormData({ ...formData, npk: { ...formData.npk, k: Number(e.target.value) } })}
                  className="w-full text-xs bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 rounded-xl px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold" icon={<Save className="w-4 h-4" />}>
            Save Fertilizer Product SKU
          </Button>
        </form>

      </div>
    </AdminLayout>
  );
};
