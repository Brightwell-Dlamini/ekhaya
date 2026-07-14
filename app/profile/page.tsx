// app/profile/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk, SignInButton, UserProfile } from "@clerk/nextjs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Lock,
  Globe,
  Camera,
  Check,
  Edit2,
  Save,
  X,
  Sparkles,
  Star,
  Home,
  Heart,
  LogOut,
  ChevronRight,
  LogIn,
  Loader2,
  Trash2,
  Upload,
  AlertCircle,
  Building2,
  Key,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// Avatar Upload Component
// ============================================================

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

function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  onAvatarRemove,
  size = 128,
  className,
  isUploading = false,
  name = "",
  email = "",
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, or GIF image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onAvatarChange(file, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    if (onAvatarRemove) onAvatarRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
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
            "w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 transition-all duration-300",
            isHovering && "scale-105 shadow-2xl shadow-emerald-500/40"
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
          {preview ? "Change Photo" : "Upload Photo"}
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

// ============================================================
// Main Profile Page
// ============================================================

interface UserProfile {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);

  // Fetch user profile and property count from database
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First, try to get the profile
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        if (fetchError.code === '42P01') {
          setError('The user profile table does not exist. Please run the database migration.');
          setLoading(false);
          return;
        }
        
        setError('Failed to load profile');
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData(data);
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      } else {
        // No profile exists, create one
        try {
          const defaultProfile = {
            clerk_user_id: user.id,
            full_name: user.fullName || '',
            email: user.emailAddresses?.[0]?.emailAddress || '',
            phone: null,
            location: null,
            bio: null,
            avatar_url: null,
            role: 'User',
            verified: false,
          };

          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([defaultProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            
            if (createError.code === '42P01') {
              setError('The user profile table does not exist. Please run the database migration.');
            } else {
              setError('Failed to create profile');
            }
            setLoading(false);
            return;
          }

          setProfile(newProfile);
          setFormData(newProfile);
        } catch (insertError) {
          console.error('Error in profile creation:', insertError);
          setError('Failed to create profile');
          setLoading(false);
          return;
        }
      }

      // Fetch property count
      try {
        const { count, error: countError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!countError) {
          setPropertyCount(count || 0);
        }
      } catch (countErr) {
        console.error('Error fetching property count:', countErr);
        setPropertyCount(0);
      }

    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      fetchUserProfile();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isSignedIn, user, isLoaded]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (file: File, preview: string) => {
    setAvatarFile(file);
    setAvatarPreview(preview);
    setFormData((prev) => ({ ...prev, avatar_url: preview }));
  };

  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, avatar_url: null }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    setError(null);

    try {
      let avatarUrl = formData.avatar_url || null;
      
      // Upload avatar if changed
      if (avatarFile) {
        setIsUploadingAvatar(true);
        
        try {
          // Create a unique file path
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            
            // Check if the bucket doesn't exist
            if (uploadError.message?.includes('bucket not found')) {
              setError('Storage bucket "avatars" not found. Please create it in Supabase.');
              setIsUploadingAvatar(false);
              setIsSaving(false);
              return;
            }
            
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          avatarUrl = urlData.publicUrl;
          
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          setError(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload avatar');
          setIsUploadingAvatar(false);
          setIsSaving(false);
          return;
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Update profile in database
      const updates = {
        full_name: formData.full_name || profile.full_name,
        phone: formData.phone || null,
        location: formData.location || null,
        bio: formData.bio || null,
        role: formData.role || 'User',
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('clerk_user_id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update profile');
      }

      // Update Clerk user metadata (optional)
      try {
        if (formData.full_name) {
          const nameParts = formData.full_name.trim().split(' ');
          await user.update({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
          });
        }
      } catch (clerkError) {
        console.warn('Could not update Clerk user:', clerkError);
      }

      // Refresh profile data
      await fetchUserProfile();
      setIsEditing(false);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
      setIsUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setAvatarPreview(profile?.avatar_url || null);
    setAvatarFile(null);
    setIsEditing(false);
    setError(null);
  };

  // Role options for the dropdown
  const roleOptions = [
    { value: 'User', label: 'User (Renter/Buyer)' },
    { value: 'Property Owner', label: 'Property Owner' },
    { value: 'Real Estate Agent', label: 'Real Estate Agent' },
    { value: 'Property Manager', label: 'Property Manager' },
    { value: 'Developer', label: 'Developer' },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  // Auth loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-emerald-400 dark:text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Sign in to view your profile
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Manage your account settings, preferences, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignInButton mode="modal">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 py-6 shadow-lg shadow-emerald-500/25">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-200 dark:border-gray-700 rounded-2xl px-8 py-6"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading profile data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-12 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {error.includes('bucket') ? 'Storage Setup Required' : 'Profile Setup Required'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            {error.includes('bucket') && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left mb-6">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  To fix this, run this SQL in your Supabase SQL Editor:
                </h4>
                <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-xl overflow-x-auto text-slate-700 dark:text-slate-300">
{`-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their avatar images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their avatar images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );`}
                </pre>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 py-6 shadow-lg shadow-emerald-500/25"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-200 dark:border-gray-700 rounded-2xl px-8 py-6"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile data should be available at this point
  const currentProfile = profile || formData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Profile Settings
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Your Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage your profile and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-6 py-6 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="rounded-2xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-6"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-6 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <AvatarUpload
                      currentAvatar={avatarPreview || currentProfile.avatar_url}
                      onAvatarChange={handleAvatarChange}
                      onAvatarRemove={handleAvatarRemove}
                      isUploading={isUploadingAvatar}
                      size={112}
                      name={currentProfile.full_name || ''}
                      email={currentProfile.email || ''}
                    />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {currentProfile.full_name || 'User'}
                  </h2>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {currentProfile.role || 'User'}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-3">
                    {currentProfile.verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="p-2.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-center w-full"
                      >
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Properties</div>
                        <div className="font-bold text-slate-900 dark:text-white text-lg">
                          {propertyCount}
                        </div>
                      </button>
                      <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl">
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Joined</div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {currentProfile.created_at 
                            ? new Date(currentProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            : 'Recently'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="w-full flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <Home className="w-4 h-4" />
                        My Listings ({propertyCount})
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={() => router.push("/wishlist")}
                      className="w-full flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <Heart className="w-4 h-4" />
                        Saved Properties
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-between text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-2.5 rounded-xl hover:bg-red-50/80 dark:hover:bg-red-950/30 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl">
                    <CardContent className="p-6 sm:p-8">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-500" />
                        Personal Information
                      </h3>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Full Name
                          </label>
                          <Input
                            name="full_name"
                            value={isEditing ? formData.full_name || '' : currentProfile.full_name || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 rounded-2xl transition-all ${
                              !isEditing
                                ? "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <Input
                              name="email"
                              type="email"
                              value={isEditing ? formData.email || '' : currentProfile.email || ''}
                              onChange={handleInputChange}
                              disabled
                              className="pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 rounded-2xl transition-all bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                            />
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Email is managed by Clerk and cannot be changed here
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <Input
                              name="phone"
                              value={isEditing ? formData.phone || '' : currentProfile.phone || ''}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 rounded-2xl transition-all ${
                                !isEditing
                                  ? "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <Input
                              name="location"
                              value={isEditing ? formData.location || '' : currentProfile.location || ''}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 rounded-2xl transition-all ${
                                !isEditing
                                  ? "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Role
                          </label>
                          <div className="relative">
                            <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <select
                              name="role"
                              value={isEditing ? formData.role || 'User' : currentProfile.role || 'User'}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`w-full pl-11 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200 ${
                                !isEditing
                                  ? "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              }`}
                            >
                              {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            rows={4}
                            className={`w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200 resize-none ${
                              !isEditing
                                ? "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                : "bg-white dark:bg-slate-800"
                            }`}
                            value={isEditing ? formData.bio || '' : currentProfile.bio || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security Tab - Using Clerk's built-in UserProfile */}
                {activeTab === "security" && (
                  <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Security Settings
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage your password, email, and security preferences
                          </p>
                        </div>
                      </div>

                      {/* Clerk's built-in UserProfile component */}
                      <div className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                        <UserProfile />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl">
                    <CardContent className="p-6 sm:p-8">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-emerald-500" />
                        Notification Preferences
                      </h3>

                      <div className="space-y-4">
                        {[
                          {
                            title: "Email Notifications",
                            description: "Property inquiries and updates",
                            defaultChecked: true,
                          },
                          {
                            title: "SMS Alerts",
                            description: "New listings in your area",
                            defaultChecked: false,
                          },
                          {
                            title: "WhatsApp Alerts",
                            description: "Direct messages from tenants",
                            defaultChecked: true,
                          },
                          {
                            title: "Push Notifications",
                            description: "Real-time updates on your listings",
                            defaultChecked: true,
                          },
                          {
                            title: "Marketing Emails",
                            description: "Tips, news, and special offers",
                            defaultChecked: false,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.description}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                defaultChecked={item.defaultChecked}
                              />
                              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
