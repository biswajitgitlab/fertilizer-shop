import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Truck, Headphones, Award } from 'lucide-react';
import { Logo } from './Logo';

const FernFrondSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M100 390 C95 280 100 150 105 10" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    {[
      { y: 350, w: 85, angle: -25 },
      { y: 310, w: 80, angle: -22 },
      { y: 270, w: 73, angle: -20 },
      { y: 230, w: 65, angle: -18 },
      { y: 190, w: 56, angle: -15 },
      { y: 150, w: 48, angle: -12 },
      { y: 110, w: 38, angle: -10 },
      { y: 70,  w: 28, angle: -8 },
      { y: 35,  w: 18, angle: -5 }
    ].map((leaf, idx) => (
      <g key={idx}>
        <path
          d={`M100 ${leaf.y} Q${100 + leaf.w * 0.6} ${leaf.y - 15} ${100 + leaf.w} ${leaf.y + leaf.angle} Q${100 + leaf.w * 0.5} ${leaf.y + 10} 100 ${leaf.y}`}
          fill="#10b981"
          opacity="0.22"
        />
        <path
          d={`M100 ${leaf.y} Q${100 - leaf.w * 0.6} ${leaf.y - 15} ${100 - leaf.w} ${leaf.y - leaf.angle} Q${100 - leaf.w * 0.5} ${leaf.y + 10} 100 ${leaf.y}`}
          fill="#10b981"
          opacity="0.22"
        />
      </g>
    ))}
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#011e17] text-emerald-100/90 pt-16 pb-12 border-t border-emerald-800/40 relative overflow-hidden">
      {/* High Quality Authentic Fern Frond Leaves Photo Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1920')` }}
      />

      {/* Decorative Botanical Vector Fern Frond Watermarks */}
      <FernFrondSVG className="absolute -top-10 -left-12 w-64 h-auto text-emerald-500 opacity-40 pointer-events-none rotate-[25deg]" />
      <FernFrondSVG className="absolute -bottom-10 -right-12 w-72 h-auto text-emerald-500 opacity-40 pointer-events-none -rotate-[35deg]" />

      <div className="absolute top-10 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top 4 Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-700/60 shadow-lg shadow-emerald-950/50">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Farm Delivery</h4>
              <p className="text-xs text-emerald-200/70">Direct to village &amp; field</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-700/60 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
              <p className="text-xs text-emerald-200/70">Government lab tested</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-700/60 shadow-lg shadow-emerald-950/50">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Agri Helpline</h4>
              <p className="text-xs text-emerald-200/70">Talk to Krishi experts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-700/60 shadow-lg shadow-emerald-950/50">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Wholesale Rates</h4>
              <p className="text-xs text-emerald-200/70">Best price guarantee</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <Logo variant="footer" />
            </Link>
            <p className="text-xs leading-relaxed text-emerald-200/70">
              India's premier digital agriculture platform for high-quality fertilizers, pesticides, seeds, plant vitamins, and AI crop disease diagnosis.
            </p>
            <div className="pt-2 text-xs space-y-2 text-emerald-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>1800-888-FARM (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@sarkarfertilizer.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Agri Tech Park, Karnal, Haryana 132001</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product Categories</h3>
            <ul className="space-y-2.5 text-xs text-emerald-200/70">
              <li><Link to="/products?category=chemical-fertilizers" className="hover:text-emerald-300 transition-colors">Chemical Fertilizers (NPK / Urea)</Link></li>
              <li><Link to="/products?category=organic-bio-fertilizers" className="hover:text-emerald-300 transition-colors">Organic Vermicompost &amp; Bio-Fertilizers</Link></li>
              <li><Link to="/products?category=insecticides" className="hover:text-emerald-300 transition-colors">Insecticides &amp; Pest Controls</Link></li>
              <li><Link to="/products?category=herbicides" className="hover:text-emerald-300 transition-colors">Herbicides &amp; Selective Weedicides</Link></li>
              <li><Link to="/products?category=pesticides" className="hover:text-emerald-300 transition-colors">Fungicides &amp; Crop Protection</Link></li>
              <li><Link to="/products?category=vitamins-bio-stimulants" className="hover:text-emerald-300 transition-colors">Plant Growth Tonics &amp; Vitamins</Link></li>
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Smart Agri Tools</h3>
            <ul className="space-y-2.5 text-xs text-emerald-200/70">
              <li><Link to="/diagnose" className="hover:text-emerald-300 transition-colors font-semibold text-emerald-400">AI Crop Disease Diagnosis</Link></li>
              <li><Link to="/planner" className="hover:text-emerald-300 transition-colors font-semibold text-amber-400">Seasonal Crop Fertilizer Planner</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-300 transition-colors">Track Order Status</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-300 transition-colors">Merchant Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Farmer Newsletter</h3>
            <p className="text-xs text-emerald-200/70 mb-4">
              Get weekly seasonal crop advisory, weather alerts, and special fertilizer discount coupons.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to SarkarFertilizer newsletter!"); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email or mobile..."
                required
                className="w-full bg-[#022c22]/90 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-emerald-950/50"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-emerald-800/40 text-center text-xs text-emerald-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SarkarFertilizer Agriculture Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-emerald-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-emerald-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-emerald-200 cursor-pointer">Fertilizer License No. HYR-2026-9041</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
