// components/ImageUpload.tsx

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile, compressImage } from '@/lib/cloudflare-r2';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  existingImages?: string[];
  maxImages?: number;
  maxSize?: number;
  folder?: string;
  type?: 'property' | 'avatar' | 'gallery';
  className?: string;
  label?: string;
  description?: string;
}

export function ImageUpload({
  onUpload,
  onRemove,
  existingImages = [],
  maxImages = 8,
  maxSize = 5 * 1024 * 1024,
  folder = 'properties',
  type = 'property',
  className,
  label = 'Upload Images',
  description = 'Drag and drop or click to upload',
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    
    // Check if we have room for more images
    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate all files
    const invalidFiles = fileArray.filter(file => {
      const validation = validateFile(file, maxSize);
      return !validation.valid;
    });

    if (invalidFiles.length > 0) {
      setError(`Some files are invalid: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Compress image if it's large
        let uploadFile: File | Blob = file;
        if (file.size > 1024 * 1024) { // Compress if > 1MB
          const compressed = await compressImage(file);
          uploadFile = new File([compressed], file.name, { type: 'image/jpeg' });
        }

        // Upload to API
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('type', type);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);

        // Update progress
        setUploadProgress(((i + 1) / fileArray.length) * 100);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
      onUpload(uploadedUrls);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [images, maxImages, maxSize, folder, type, onUpload]);

  const handleRemove = useCallback(async (url: string, index: number) => {
    try {
      // Delete from server
      await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      // Update local state
      setImages(prev => prev.filter((_, i) => i !== index));
      if (onRemove) onRemove(url);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  }, [onRemove]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-emerald-500 dark:hover:border-emerald-400 transition-all"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleRemove(url, index)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer group',
            isDragging
              ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10',
            isUploading && 'opacity-50 cursor-wait'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <div className="w-full max-w-xs h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                'p-4 rounded-full transition-colors',
                isDragging
                  ? 'bg-emerald-200 dark:bg-emerald-800/50'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50'
              )}>
                {isDragging ? (
                  <ImageIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDragging ? 'Drop your images here' : label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {description} • {maxImages - images.length} remaining
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  PNG, JPG, WebP • Max {maxSize / (1024 * 1024)}MB each
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
