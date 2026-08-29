import React from 'react';
import { CropTask } from '../../types';
import { CheckCircle2, Circle, Calendar, ShoppingBag } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { productApi } from '../../api/productApi';
import toast from 'react-hot-toast';

interface TaskListProps {
  tasks: CropTask[];
  onToggleTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask }) => {
  const { addToCart } = useCart();

  const handleBuyProduct = async (productId?: string) => {
    if (!productId) {
      toast.error('No product linked to this task.');
      return;
    }
    try {
      const prod = await productApi.getProductById(productId);
      if (prod) {
        addToCart(prod, 1);
        toast.success(`Added ${prod.name} to cart!`);
      }
    } catch (e) {
      toast.error('Failed to fetch product.');
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isDone = task.status === 'Done';
        return (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              isDone ? 'bg-emerald-50/40 border-emerald-200 opacity-80' : 'bg-white border-gray-100 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleTask(task.id)}
                className="text-emerald-600 hover:scale-110 transition-transform cursor-pointer"
              >
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 hover:text-emerald-500" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{task.stage}</span>
                  <span className="text-[10px] text-gray-400 font-medium">({formatDate(task.date)})</span>
                </div>
                <p className="text-sm font-black text-emerald-800">{task.product} ({task.qty})</p>
                <p className="text-[11px] text-gray-500">Method: {task.method}</p>
              </div>
            </div>

            <button
              onClick={() => handleBuyProduct(task.productId)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Product</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
