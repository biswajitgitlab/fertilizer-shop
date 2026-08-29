import React, { useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  onChangeImages: (images: string[]) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChangeImages,
  maxFiles = 3
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} leaf photos allowed.`);
      return;
    }

    const newCompressed: string[] = [];
    for (const file of files as File[]) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB.`);
        continue;
      }
      const dataUrl = await compressImage(file);
      newCompressed.push(dataUrl);
    }

    onChangeImages([...images, ...newCompressed]);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChangeImages(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-900">Upload Crop Leaf Photos</h4>
        <p className="text-xs text-gray-500">
          Click or drag clear close-up photos of affected leaves or fruits (Up to {maxFiles} images)
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Uploaded Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
              <img src={img} alt={`Crop upload ${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
