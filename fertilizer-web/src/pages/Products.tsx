import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { productApi } from '../api/productApi';
import { Product, Category } from '../types';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const crop = searchParams.get('crop') || '';
  const priceMax = Number(searchParams.get('priceMax')) || 2000;
  const sort = searchParams.get('sort') || 'featured';

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productApi.getProducts({
          category,
          search,
          crop,
          priceMax,
          sort
        });
        setProducts(res.products);
        setCategories(res.categories || []);
      } catch (e) {
        console.error("Products error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, crop, priceMax, sort]);

  const updateParam = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-200/80 dark:border-slate-800/80 shadow-lg shadow-emerald-900/5 relative overflow-hidden">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Fertilizer & Crop Care Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            Showing {products.length} lab-tested products for optimal field yield
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search fertilizers, seeds, pesticides..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all"
          />
          <Search className="w-4 h-4 text-emerald-600 dark:text-slate-400 absolute left-3.5 top-3" />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCategory={category}
            onSelectCategory={(slug) => updateParam('category', slug)}
            selectedCrop={crop}
            onSelectCrop={(c) => updateParam('crop', c)}
            priceRange={priceMax}
            onChangePriceRange={(val) => updateParam('priceMax', val.toString())}
            sortBy={sort}
            onChangeSortBy={(s) => updateParam('sort', s)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between bg-white/85 dark:bg-slate-900/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/70 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-white bg-emerald-100/70 dark:bg-slate-800 px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Filter & Sort Products</span>
          </button>
          <span className="text-xs font-bold text-emerald-800 dark:text-slate-400">{products.length} Found</span>
        </div>


        {/* Mobile Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)} />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xs bg-white dark:bg-slate-900 p-4 overflow-y-auto">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={category}
                  onSelectCategory={(slug) => updateParam('category', slug)}
                  selectedCrop={crop}
                  onSelectCrop={(c) => updateParam('crop', c)}
                  priceRange={priceMax}
                  onChangePriceRange={(val) => updateParam('priceMax', val.toString())}
                  sortBy={sort}
                  onChangeSortBy={(s) => updateParam('sort', s)}
                  onReset={handleResetFilters}
                  onCloseMobile={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          <ProductGrid products={products} isLoading={isLoading} />
        </div>

      </div>

    </div>
  );
};
