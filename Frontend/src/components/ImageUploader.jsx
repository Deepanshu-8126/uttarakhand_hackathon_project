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
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-xs font-semibold text-[#0f3d2e] hover:text-[#144c3a] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LinkIcon size={12} />
          {showUrlField ? 'Hide URL input' : '+ Add via Image URL'}
        </button>
      </div>

      {showUrlField && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image link (https://images.unsplash.com/... or https://...)"
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20 focus:border-[#0f3d2e]"
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
            className="px-3.5 py-1.5 bg-[#0f3d2e] hover:bg-[#144c3a] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 shadow-sm"
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
              className="relative aspect-square rounded-xl border border-stone-200 overflow-hidden bg-stone-100 group shadow-sm"
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
              
              {/* Always accessible remove button badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1.5 right-1.5 z-20 w-6 h-6 bg-red-600/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border border-white/20 active:scale-95 cursor-pointer"
                title="Remove this photo"
              >
                <X size={12} strokeWidth={2.5} />
              </button>

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                <button
                  type="button"
                  onClick={() => setPreviewImage(src)}
                  className="p-1.5 bg-white text-slate-800 rounded-full hover:bg-stone-100 transition-all hover:scale-110 pointer-events-auto shadow cursor-pointer"
                  title="View large preview"
                >
                  <Eye size={14} />
                </button>
              </div>

              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-[#0f3d2e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none">
                  Cover
                </span>
              )}
            </div>
          );
        })}
        
        {(!images.length || (multiple && images.length < maxFiles)) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-[#0f3d2e] bg-stone-50 hover:bg-emerald-50/40 transition-all flex flex-col items-center justify-center text-slate-600 hover:text-[#0f3d2e] p-2 text-center cursor-pointer group active:scale-95"
          >
            <Upload size={22} className="mb-1.5 text-stone-400 group-hover:text-[#0f3d2e] transition-colors" />
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#0f3d2e]">Upload File</span>
            <span className="text-[10px] text-slate-400">or drop image</span>
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
      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
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

