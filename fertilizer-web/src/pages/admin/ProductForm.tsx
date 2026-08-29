import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { productApi } from '../../api/productApi';
import { Category } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
    images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600'],
    suitableCrops: ['Wheat', 'Paddy', 'Vegetables']
  });

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
            images: found.images,
            suitableCrops: found.suitableCrops
          });
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        
        <button onClick={() => navigate('/admin/products')} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-5">
          <Input
            label="Product Title / Chemical Brand Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5"
                required
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <Input
              label="Pack Unit (e.g. 50 kg Bag, 1 L Bottle) *"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Selling Price (₹) *"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Original MRP Price (₹)"
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            />
            <Input
              label="Stock Quantity *"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          {/* NPK Inputs */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <label className="block text-xs font-bold text-emerald-900">NPK Nitrogen-Phosphorus-Potassium Ratio (%)</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Nitrogen (N)</span>
                <input
                  type="number"
                  value={formData.npk.n}
                  onChange={(e) => setFormData({ ...formData, npk: { ...formData.npk, n: Number(e.target.value) } })}
                  className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Phosphorus (P)</span>
                <input
                  type="number"
                  value={formData.npk.p}
                  onChange={(e) => setFormData({ ...formData, npk: { ...formData.npk, p: Number(e.target.value) } })}
                  className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Potassium (K)</span>
                <input
                  type="number"
                  value={formData.npk.k}
                  onChange={(e) => setFormData({ ...formData, npk: { ...formData.npk, k: Number(e.target.value) } })}
                  className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-3" icon={<Save className="w-4 h-4" />}>
            Save Fertilizer Product SKU
          </Button>
        </form>

      </div>
    </AdminLayout>
  );
};
