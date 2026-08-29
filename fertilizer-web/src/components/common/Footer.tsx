import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Truck, Headphones, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4 Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Farm Delivery</h4>
              <p className="text-xs text-slate-400">Direct to village & field</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
              <p className="text-xs text-slate-400">Government lab tested</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Agri Helpline</h4>
              <p className="text-xs text-slate-400">Talk to Krishi experts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Wholesale Rates</h4>
              <p className="text-xs text-slate-400">Best price guarantee</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">Krishi<span className="text-emerald-500">Shop</span></span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              India's premier digital agriculture platform for high-quality fertilizers, pesticides, seeds, plant vitamins, and AI crop disease diagnosis.
            </p>
            <div className="pt-2 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>1800-888-FARM (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>support@sarkarfertilizer.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Agri Tech Park, Karnal, Haryana 132001</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product Categories</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products?category=chemical-fertilizers" className="hover:text-emerald-400 transition-colors">Chemical Fertilizers (NPK / Urea)</Link></li>
              <li><Link to="/products?category=organic-bio-fertilizers" className="hover:text-emerald-400 transition-colors">Organic Vermicompost & Bio-Fertilizers</Link></li>
              <li><Link to="/products?category=insecticides" className="hover:text-emerald-400 transition-colors">Insecticides & Pest Controls</Link></li>
              <li><Link to="/products?category=herbicides" className="hover:text-emerald-400 transition-colors">Herbicides & Selective Weedicides</Link></li>
              <li><Link to="/products?category=pesticides" className="hover:text-emerald-400 transition-colors">Fungicides & Crop Protection</Link></li>
              <li><Link to="/products?category=vitamins-bio-stimulants" className="hover:text-emerald-400 transition-colors">Plant Growth Tonics & Vitamins</Link></li>
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Smart Agri Tools</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/diagnose" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">AI Crop Disease Diagnosis</Link></li>
              <li><Link to="/planner" className="hover:text-emerald-400 transition-colors font-semibold text-amber-400">Seasonal Crop Fertilizer Planner</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400 transition-colors">Track Order Status</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Merchant Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Farmer Newsletter</h3>
            <p className="text-xs text-slate-400 mb-4">
              Get weekly seasonal crop advisory, weather alerts, and special fertilizer discount coupons.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to SarkarFertilizer newsletter!"); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email or mobile..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SarkarFertilizer Agriculture Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Fertilizer License No. HYR-2026-9041</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
