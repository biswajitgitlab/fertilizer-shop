import React from 'react';
import { CROPS_LIST } from '../../utils/constants';
import { Category } from '../../types';
import { Filter, X, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
  priceRange: number;
  onChangePriceRange: (val: number) => void;
  sortBy: string;
  onChangeSortBy: (sort: string) => void;
  onReset: () => void;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedCrop,
  onSelectCrop,
  priceRange,
  onChangePriceRange,
  sortBy,
  onChangeSortBy,
  onReset,
  onCloseMobile
}) => {
  return (
    <aside className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <Filter className="w-5 h-5 text-emerald-600" />
          <span>Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium flex items-center justify-between ${
              selectedCategory === '' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium flex items-center justify-between ${
                selectedCategory === cat.slug ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-500 font-semibold">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort By Filter */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Sort By
        </h4>
        <select
          value={sortBy}
          onChange={(e) => onChangeSortBy(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="featured">Featured First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Customer Rating</option>
        </select>
      </div>

      {/* Suitable Crops Filter */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Suitable Crop
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectCrop('')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
              selectedCrop === '' ? 'bg-emerald-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Crops
          </button>
          {CROPS_LIST.map((crop) => (
            <button
              key={crop.name}
              onClick={() => onSelectCrop(crop.name)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                selectedCrop === crop.name ? 'bg-emerald-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{crop.icon}</span>
              <span>{crop.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Max Price
          </h4>
          <span className="text-xs font-black text-emerald-700">₹{priceRange}</span>
        </div>
        <input
          type="range"
          min="100"
          max="2000"
          step="50"
          value={priceRange}
          onChange={(e) => onChangePriceRange(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
          <span>₹100</span>
          <span>₹2,000+</span>
        </div>
      </div>

      {onCloseMobile && (
        <Button onClick={onCloseMobile} className="w-full lg:hidden">
          Apply Filters
        </Button>
      )}

    </aside>
  );
};
