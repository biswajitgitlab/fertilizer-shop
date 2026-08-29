import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState(images[0] || "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=800");

  return (
    <div className="space-y-4">
      {/* Main Large Display Image */}
      <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group shadow-sm">
        <img
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
          Zoom Enabled
        </div>
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                activeImage === img ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${productName} ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
