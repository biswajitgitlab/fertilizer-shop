import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Product } from '../../types';
import { Warehouse, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (e) {
      console.error("Inventory error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await adminApi.updateProduct(id, { stock: newStock });
      toast.success("Stock quantity updated!");
      fetchInventory();
    } catch (e) {
      toast.error("Failed to update stock.");
    }
  };

  return (
    <AdminLayout title="Warehouse Inventory Management">
      <div className="space-y-6">
        
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-[11px] font-bold text-gray-500 uppercase">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Size</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs text-gray-800 font-medium">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{p.name}</td>
                  <td className="py-3.5 px-4">{p.category}</td>
                  <td className="py-3.5 px-4">{p.unit}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 flex items-center gap-1 w-fit'
                    }`}>
                      {p.stock <= 10 && <AlertTriangle className="w-3.5 h-3.5" />}
                      {p.stock} Units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button onClick={() => handleUpdateStock(p.id, p.stock, 10)} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 cursor-pointer">
                      +10 Bags
                    </button>
                    <button onClick={() => handleUpdateStock(p.id, p.stock, 50)} className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 cursor-pointer">
                      +50 Bags
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
};
