// components/AvatarUpload.tsx

'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, Trash2, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (file: File, preview: string) => void;
  onAvatarRemove?: () => void;
  size?: number;
  className?: string;
  isUploading?: boolean;
  name?: string;
  email?: string;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  onAvatarRemove,
  size = 128,
  className,
  isUploading = false,
  name = '',
  email = '',
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = useCallback(() => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  }, [name, email]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onAvatarChange(file, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreview(null);
    if (onAvatarRemove) onAvatarRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFilePicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <div
        className="relative cursor-pointer group"
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={openFilePicker}
      >
        <div
          className={cn(
            'w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 transition-all duration-300',
            isHovering && 'scale-105 shadow-2xl shadow-emerald-500/40'
          )}
        >
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
              {getInitials()}
            </div>
          )}
        </div>

        <AnimatePresence>
          {isHovering && !isUploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {preview && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFilePicker}
          disabled={isUploading}
          className="rounded-full"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {preview ? 'Change Photo' : 'Upload Photo'}
        </Button>
        <p className="text-xs text-gray-400 dark:text-gray-500">JPEG, PNG, WebP • Max 2MB</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
