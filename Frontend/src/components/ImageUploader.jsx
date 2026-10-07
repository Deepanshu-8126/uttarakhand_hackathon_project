import React, { useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon, Eye, Plus, Check } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

/**
 * Reusable & Interactive ImageUploader for Admin Forms
 * Supports file uploads, direct image URLs, and instant lightbox preview
 */
const ImageUploader = ({ 
  label, 
  images = [], 
  onChange, 
  multiple = false,
  maxFiles = 10
}) => {
  const fileInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB)`);
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'].includes(file.type)) {
        alert(`${file.name} has an invalid type`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (multiple) {
      if (images.length + validFiles.length > maxFiles) {
        alert(`You can only have up to ${maxFiles} images`);
        return;
      }
      onChange([...images, ...validFiles]);
    } else {
      onChange([validFiles[0]]);
    }
  };

  const handleAddUrl = (e) => {
    e?.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (multiple) {
      if (images.length >= maxFiles) {
        alert(`You can only have up to ${maxFiles} images`);
        return;
      }
      onChange([...images, trimmed]);
    } else {
      onChange([trimmed]);
    }
    setUrlInput('');
    setShowUrlField(false);
  };

  const handleRemove = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-bold text-stone-800 dark:text-stone-200">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <LinkIcon size={12} />
          {showUrlField ? 'Hide URL input' : '+ Add via Image URL'}
        </button>
      </div>

      {showUrlField && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 animate-in fade-in">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image link (https://images.unsplash.com/... or https://...)"
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-2">
        {images.map((img, idx) => {
          const isFile = img instanceof File;
          const src = isFile ? URL.createObjectURL(img) : getImageUrl(img);

          return (
            <div 
              key={idx} 
              className="relative aspect-square rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-stone-100 dark:bg-stone-900 group shadow-sm"
            >
              <img 
                src={src} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                onClick={() => setPreviewImage(src)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                }}
              />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                <button
                  type="button"
                  onClick={() => setPreviewImage(src)}
                  className="p-1.5 bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 rounded-full hover:bg-white transition-colors pointer-events-auto shadow"
                  title="View large preview"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors pointer-events-auto shadow"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>

              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-emerald-700/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                  Primary
                </span>
              )}
            </div>
          );
        })}
        
        {(!images.length || (multiple && images.length < maxFiles)) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 p-2 text-center"
          >
            <Upload size={22} className="mb-1.5" />
            <span className="text-xs font-bold">Upload File</span>
            <span className="text-[10px] text-stone-400">or drop image</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/webp, image/avif"
        multiple={multiple}
      />
      <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 mt-1">
        <span>Accepts JPG, PNG, WEBP (Max 10MB) or direct Web URLs</span>
        {multiple && <span>{images.length} / {maxFiles} images</span>}
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            <img 
              src={previewImage} 
              alt="High Resolution Preview" 
              className="max-h-[80vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

