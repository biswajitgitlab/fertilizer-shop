import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { Product } from '../types';
import { ImageGallery } from '../components/product/ImageGallery';
import { RatingStars } from '../components/product/RatingStars';
import { QuantitySelector } from '../components/cart/QuantitySelector';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/common/Button';
import { useCart } from '../hooks/useCart';
import { formatCurrency, calculateDiscount } from '../utils/formatters';
import { ShieldCheck, Truck, Headphones, ShoppingCart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'dosage' | 'crops' | 'reviews'>('desc');

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        if (!slug) return;
        const data = await productApi.getProductBySlug(slug);
        setProduct(data);
        const rel = await productApi.getRelated(data.category, data.id);
        setRelated(rel);
      } catch (e) {
        console.error("Detail error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3 mx-auto" />
        <div className="h-64 bg-gray-200 rounded-3xl max-w-xl mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
        <Link to="/products" className="text-emerald-600 font-bold hover:underline">
          Back to Store
        </Link>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} x ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6">
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Info Column */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">
                {typeof product.category === 'object' ? (product.category as any).name : product.category}
              </span>
              {product.npk && (product.npk.n > 0 || product.npk.p > 0 || product.npk.k > 0) && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md">
                  NPK Ratio: {product.npk.n}:{product.npk.p}:{product.npk.k}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <RatingStars rating={product.rating} count={product.reviewsCount} size="md" />
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-emerald-800">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-rose-600 text-white font-black text-xs px-2 py-0.5 rounded-md">
                Save {discount}%
              </span>
            )}
            <span className="text-xs text-gray-500 font-medium ml-auto">Inclusive of all taxes</span>
          </div>

          {/* Pack Unit */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-700">Packaging Pack Size</span>
            <div className="inline-block bg-gray-100 text-gray-900 font-black text-xs px-4 py-2 rounded-xl border border-gray-200">
              {product.unit}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700">Quantity</span>
              <QuantitySelector
                quantity={quantity}
                onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                onIncrease={() => setQuantity(Math.min(product.stock, quantity + 1))}
                max={product.stock}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                variant="outline"
                className="py-3 text-sm"
                icon={<ShoppingCart className="w-4 h-4" />}
              >
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3 text-sm"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-600 font-medium">
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span>Lab Certified 100% Original</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span>2-3 Days Fast Delivery</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <Headphones className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span>Agri Expert Support</span>
            </div>
          </div>

        </div>

      </div>

      {/* Product Information Tabs */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Tab Buttons */}
        <div className="flex border-b border-gray-100 gap-6 overflow-x-auto text-xs font-bold">
          {[
            { id: 'desc', label: 'Product Overview' },
            { id: 'dosage', label: 'Application & Dosage' },
            { id: 'crops', label: 'Suitable Crops' },
            { id: 'reviews', label: `Customer Reviews (${product.reviewsCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'desc' && (
          <div className="text-xs text-gray-700 leading-relaxed space-y-3">
            <p>{product.description}</p>
            {product.composition && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Active Chemical Ingredients:</span>
                <span className="text-gray-700 font-semibold">{product.composition}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dosage' && (
          <div className="text-xs text-gray-700 space-y-3">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="font-bold text-emerald-900 block mb-1">Recommended Application Dosage:</span>
              <p className="text-emerald-950 font-bold">{product.dosage || "Drip / Foliar Spray: 2-3 gm per liter of water or 1-2 kg per acre."}</p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Apply during early morning or late evening hours for maximum absorption.</li>
              <li>Avoid tank mixing with non-compatible acidic copper pesticides.</li>
              <li>Ensure complete leaf spray coverage for pest & nutrient foliar feeds.</li>
            </ul>
          </div>
        )}

        {activeTab === 'crops' && (
          <div className="flex flex-wrap gap-2">
            {product.suitableCrops.map((c, i) => (
              <span key={i} className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {c}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="text-center pr-4 border-r border-gray-200">
                <span className="text-3xl font-black text-gray-900">{product.rating}</span>
                <RatingStars rating={product.rating} />
                <span className="text-[10px] text-gray-400 font-semibold">{product.reviewsCount} Ratings</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                100% verified farmer reviews from government licensed fertilizer buyers.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900">Recommended Related Fertilizers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
