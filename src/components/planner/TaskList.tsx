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
            className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all flex items-center justify-between gap-4 ${
              isDone
                ? 'bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800 opacity-85'
                : 'bg-white/90 dark:bg-slate-900/90 border-emerald-200/70 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => onToggleTask(task.id)}
                className="text-emerald-600 hover:scale-110 transition-transform cursor-pointer shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white" />
                ) : (
                  <Circle className="w-6 h-6 text-emerald-400/80 hover:text-emerald-600" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{task.stage}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                    {formatDate(task.date)}
                  </span>
                </div>
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mt-0.5">
                  {task.product} ({task.qty})
                </p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Method: {task.method}</p>
              </div>
            </div>

            <button
              onClick={() => handleBuyProduct(task.productId)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
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

