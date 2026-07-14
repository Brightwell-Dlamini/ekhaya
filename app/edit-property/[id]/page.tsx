// app/edit-property/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  Upload,
  X,
  ArrowLeft,
  Check,
  AlertCircle,
  Trash2,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  Sparkles,
  Building2,
  Heart,
  Wifi,
  ParkingCircle,
  Trees,
  Droplets,
  Sun,
  Flame,
  Snowflake,
  Loader2,
  Star,
  LandPlot,
  Store,
  Sprout,
  Car,
  Ruler,
  Zap,
  Fence,
  LogIn,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '@/lib/supabase/queries';
import { Property, getCategoryDisplayInfo, getFormattedPrice } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

// ============================================================
// Constants
// ============================================================

const categoryOptions = [
  'Residential',
  'Land/Plot',
  'Commercial',
  'Agricultural',
  'Mixed-Use',
] as const;

const listingTypeOptions = ['Rent', 'Sale', 'Short Stay'] as const;
const pricePeriodOptions = ['month', 'year', 'one-time'] as const;
const availabilityOptions = [
  'Available Now',
  'Available from July 2026',
  'Available from August 2026',
  'Available from September 2026',
] as const;

const statusOptions = ['Active', 'Inactive', 'Rented', 'Sold'] as const;

const allFeatures = [
  { icon: Wifi, label: 'WiFi' },
  { icon: ParkingCircle, label: 'Parking' },
  { icon: Shield, label: 'Security' },
  { icon: Trees, label: 'Garden' },
  { icon: Droplets, label: 'Pool' },
  { icon: Sun, label: 'Air Conditioning' },
  { icon: Flame, label: 'Backup Power' },
  { icon: Snowflake, label: 'Furnished' },
  { icon: Heart, label: 'Pet Friendly' },
  { icon: Building2, label: 'Balcony' },
  { icon: Home, label: 'Carport' },
  { icon: Sparkles, label: 'Water Tank' },
  { icon: Car, label: 'Road Access' },
  { icon: Fence, label: 'Fenced' },
  { icon: Zap, label: 'Electricity' },
  { icon: Droplets, label: 'Irrigation' },
  { icon: Store, label: 'Storefront' },
  { icon: Zap, label: 'Three Phase Power' },
];

// ============================================================
// Helper Functions
// ============================================================

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Residential':
      return Home;
    case 'Land/Plot':
      return LandPlot;
    case 'Commercial':
      return Store;
    case 'Agricultural':
      return Sprout;
    case 'Mixed-Use':
      return Building2;
    default:
      return Home;
  }
};

// ============================================================
// Main Component
// ============================================================

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [originalProperty, setOriginalProperty] = useState<Property | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const property = await getPropertyById(id);

        // Check if user owns this property
        if (user && property.user_id !== user.id) {
          setError("You don't have permission to edit this property");
          setIsLoading(false);
          return;
        }

        setOriginalProperty(property);
        setFormData({
          ...property,
          imagePreviews: property.images || [],
        });
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && isLoaded && isSignedIn && user) {
      fetchProperty();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [id, user, isLoaded, isSignedIn]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }

    if (type === 'number') {
      setFormData((prev: any) => ({ ...prev, [name]: value === '' ? null : Number(value) }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev: any) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f: string) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.imagePreviews.length > 8) {
      alert('Maximum 8 images allowed');
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setFormData((prev: any) => ({
      ...prev,
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      imagePreviews: prev.imagePreviews.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updateData: any = {
        title: formData.title,
        category: formData.category,
        sub_category: formData.sub_category || null,
        listing_type: formData.listing_type,
        price_amount: formData.price_amount,
        price_period: formData.price_period,
        location: formData.location,
        description: formData.description,
        features: formData.features || [],
        images: formData.imagePreviews || [],
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        availability: formData.availability || null,
        status: formData.status,
        verified: formData.verified,
        featured: formData.featured || false,
        bedrooms: formData.bedrooms ?? null,
        bathrooms: formData.bathrooms ?? null,
        floor_area: formData.floor_area ?? null,
        land_size_hectares: formData.land_size_hectares ?? null,
        land_size_m2: formData.land_size_m2 ?? null,
        zoning: formData.zoning || null,
        road_access: formData.road_access ?? false,
        fenced: formData.fenced ?? false,
        water_source: formData.water_source || null,
        electricity: formData.electricity ?? false,
        irrigation: formData.irrigation ?? false,
        floor_space: formData.floor_space ?? null,
        parking_spaces: formData.parking_spaces ?? null,
        power_supply: formData.power_supply || null,
        storefront: formData.storefront ?? false,
      };

      await updateProperty(id, updateData);
      router.push('/dashboard?success=true');
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await deleteProperty(id);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete property');
      setIsDeleting(false);
    }
  };

  // Auth loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading...
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
              <Home className="w-12 h-12 text-emerald-400 dark:text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Sign in to edit properties
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              You need to be signed in to edit property listings.
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
                onClick={() => router.push('/')}
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading property...
          </p>
        </div>
      </div>
    );
  }

  // Error or no permission
  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 blur-3xl"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-12 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {error === "You don't have permission to edit this property"
                  ? 'Access Denied'
                  : 'Property Not Found'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {error || "The property you're trying to edit doesn't exist."}
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 shadow-lg shadow-emerald-500/25"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  // (The edit form rendering code stays the same as before)
  // ...

  const CategoryIcon = getCategoryIcon(formData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Edit Property
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your listing details
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-2xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl">
            <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl ${
                    formData.status === 'Active'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {formData.status === 'Active' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {formData.status}
                </span>
                <button
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      status: prev.status === 'Active' ? 'Inactive' : 'Active',
                    }))
                  }
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ml-auto"
                >
                  Toggle Status
                </button>
              </motion.div>

              {/* Basic Information */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                    <CategoryIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Basic Information
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Update your property details
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Property Type
                  </label>
                  <input
                    name="sub_category"
                    type="text"
                    placeholder="e.g. House, Apartment, Office..."
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                    value={formData.sub_category || ''}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Property Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl transition-all"
                  />
                </div>

                {/* Listing Type & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Listing Type *
                    </label>
                    <select
                      name="listing_type"
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                      value={formData.listing_type}
                      onChange={handleInputChange}
                    >
                      {listingTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        name="price_amount"
                        type="number"
                        min="0"
                        value={formData.price_amount}
                        onChange={handleInputChange}
                        className="pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Period */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Price Period *
                  </label>
                  <select
                    name="price_period"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                    value={formData.price_period}
                    onChange={handleInputChange}
                  >
                    {pricePeriodOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'month' && 'Per Month'}
                        {option === 'year' && 'Per Year'}
                        {option === 'one-time' && 'One Time'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl transition-all"
                    />
                  </div>
                </div>

                {/* Category-specific fields - same as before */}
                {/* ... (keep the existing category-specific rendering code) ... */}

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200 resize-none"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                    <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Amenities & Features
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Select what your property offers
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allFeatures.map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleFeature(label)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                        formData.features.includes(label)
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                          : 'bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <Upload className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Photos
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Manage your property images
                    </p>
                  </div>
                </div>

                {formData.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.imagePreviews.map((preview: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800"
                      >
                        <img
                          src={preview}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-200 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="image-upload"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                        <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Add more photos
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Max 8 total
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-5 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                    <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Contact Information
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      How potential tenants can reach you
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      className="pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="pl-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Availability
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <select
                      name="availability"
                      className="w-full pl-11 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                      value={formData.availability || ''}
                      onChange={handleInputChange}
                    >
                      {availabilityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Featured Status */}
              <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Featured Status
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Feature your property for better visibility
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/30">
                  <div className="flex-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured || false}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-purple-300 dark:border-purple-700 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Feature this property
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Featured properties appear at the top of search results and on the homepage
                        </p>
                      </div>
                    </label>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      Premium
                    </span>
                  </div>
                </div>

                {formData.featured && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                      <p className="font-medium">This property is now featured!</p>
                      <p className="text-purple-600/70 dark:text-purple-400/70">
                        It will appear in the featured section on the homepage and receive priority
                        visibility.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="rounded-2xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-8"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
