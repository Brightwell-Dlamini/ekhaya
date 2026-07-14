// app/list-property/form-steps.tsx

'use client';

import { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Upload,
  X,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Check,
  Home,
  User,
  Sparkles,
  Building2,
  Phone,
  Mail,
  LandPlot,
  Ruler,
  Store,
  Sprout,
  Car,
  AlertCircle,
  Calendar,
  Zap,
  Droplets,
  Fence,
  Trees,
  Shield,
  Wifi,
  ParkingCircle,
  Sun,
  Flame,
  Snowflake,
  Heart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  PropertyFormData,
  categoryConfigs,
  categoryOptions,
  listingTypeOptions,
  availabilityOptions,
  pricePeriodOptions,
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from './types';
import { cn } from '@/lib/utils';

interface StepProps {
  form: UseFormReturn<PropertyFormData>;
  isSubmitting?: boolean;
}

// ============================================================
// Step 1: Basic Details
// ============================================================

export function StepDetails({ form }: StepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const category = watch('category');
  const currentCategory = categoryConfigs[category];
  const subCategories = currentCategory?.subCategories || [];

  const renderCategoryFields = () => {
    switch (category) {
      case 'Residential':
      case 'Mixed-Use':
        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bedrooms *
                </label>
                <div className="relative">
                  <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className={cn(
                      'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                      errors.bedrooms && 'border-red-500 dark:border-red-500 focus:ring-red-200'
                    )}
                    {...register('bedrooms', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                  {errors.bedrooms && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.bedrooms.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bathrooms *
                </label>
                <div className="relative">
                  <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className={cn(
                      'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                      errors.bathrooms && 'border-red-500 dark:border-red-500 focus:ring-red-200'
                    )}
                    {...register('bathrooms', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                  {errors.bathrooms && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.bathrooms.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Floor Area (m²)
                </label>
                <div className="relative">
                  <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    className="pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all"
                    {...register('floor_area', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Optional - only if you know the exact floor area
                </p>
              </div>
            </div>
          </>
        );

      case 'Land/Plot':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Land Size (hectares)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 2.5"
                    className={cn(
                      'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                      errors.land_size_hectares &&
                        'border-red-500 dark:border-red-500 focus:ring-red-200'
                    )}
                    {...register('land_size_hectares', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Land Size (m²)
                </label>
                <div className="relative">
                  <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 10000"
                    className={cn(
                      'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                      errors.land_size_m2 && 'border-red-500 dark:border-red-500 focus:ring-red-200'
                    )}
                    {...register('land_size_m2', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
                {(errors.land_size_hectares || errors.land_size_m2) && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {(errors.land_size_hectares?.message as string) ||
                      (errors.land_size_m2?.message as string) ||
                      'Land size required'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Zoning
              </label>
              <select
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                {...register('zoning')}
              >
                <option value="">Select zoning (optional)</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Industrial">Industrial</option>
                <option value="Mixed-Use">Mixed-Use</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('road_access')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Road Access
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('fenced')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Fenced
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('electricity')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Electricity Available
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('irrigation')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Irrigation
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Water Source
              </label>
              <select
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                {...register('water_source')}
              >
                <option value="">Select water source (optional)</option>
                <option value="Borehole">Borehole</option>
                <option value="Municipal">Municipal Supply</option>
                <option value="River/Stream">River / Stream</option>
                <option value="Dam/Pond">Dam / Pond</option>
                <option value="Rainwater">Rainwater Harvesting</option>
              </select>
            </div>
          </>
        );

      case 'Commercial':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Floor Space (m²) *
                </label>
                <div className="relative">
                  <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 200"
                    className={cn(
                      'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                      errors.floor_space && 'border-red-500 dark:border-red-500 focus:ring-red-200'
                    )}
                    {...register('floor_space', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                  {errors.floor_space && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.floor_space.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Parking Spaces
                </label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    className="pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all"
                    {...register('parking_spaces', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Power Supply
              </label>
              <select
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                {...register('power_supply')}
              >
                <option value="">Select power supply (optional)</option>
                <option value="Single Phase">Single Phase</option>
                <option value="Three Phase">Three Phase</option>
                <option value="Generator">Generator Available</option>
              </select>
            </div>

            <label className="flex items-center gap-3 text-sm cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                {...register('storefront')}
              />
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Storefront / Street Visibility
              </span>
            </label>
          </>
        );

      case 'Agricultural':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Land Size (hectares) *
                </label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 10"
                    className={cn(
                      'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                      errors.land_size_hectares &&
                        'border-red-500 dark:border-red-500 focus:ring-red-200'
                    )}
                    {...register('land_size_hectares', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Land Size (m²)
                </label>
                <div className="relative">
                  <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    className="pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all"
                    {...register('land_size_m2', {
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
                {errors.land_size_hectares && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.land_size_hectares.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('road_access')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Road Access
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('fenced')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Fenced
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('electricity')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Electricity Available
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50"
                  {...register('irrigation')}
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Irrigation Available
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Water Source
              </label>
              <select
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
                {...register('water_source')}
              >
                <option value="">Select water source (optional)</option>
                <option value="Borehole">Borehole</option>
                <option value="Municipal">Municipal Supply</option>
                <option value="River/Stream">River / Stream</option>
                <option value="Dam/Pond">Dam / Pond</option>
                <option value="Rainwater">Rainwater Harvesting</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
          <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Property Details
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tell us about your space
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Property Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {categoryOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setValue('category', value);
                  setValue('sub_category', '');
                  // Reset category-specific fields
                  setValue('bedrooms', null);
                  setValue('bathrooms', null);
                  setValue('floor_area', null);
                  setValue('land_size_hectares', null);
                  setValue('land_size_m2', null);
                  setValue('zoning', null);
                  setValue('road_access', false);
                  setValue('fenced', false);
                  setValue('water_source', null);
                  setValue('electricity', false);
                  setValue('irrigation', false);
                  setValue('floor_space', null);
                  setValue('parking_spaces', null);
                  setValue('power_supply', null);
                  setValue('storefront', false);
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-sm',
                  category === value
                    ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-xs">{label}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.category.message as string}
            </p>
          )}
        </div>

        {/* Sub-category */}
        {subCategories.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Property Type *
            </label>
            <select
              className={cn(
                'w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200',
                errors.sub_category && 'border-red-500 dark:border-red-500 focus:ring-red-200'
              )}
              {...register('sub_category')}
            >
              <option value="">Select type...</option>
              {subCategories.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.sub_category && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.sub_category.message as string}
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Property Title *
          </label>
          <Input
            placeholder={currentCategory?.placeholder.title || 'Enter property title'}
            className={cn(
              'border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
              errors.title && 'border-red-500 dark:border-red-500 focus:ring-red-200'
            )}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.title.message as string}
            </p>
          )}
        </div>

        {/* Listing Type & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Listing Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {listingTypeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('listing_type', value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-sm',
                    watch('listing_type') === value
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-xs">{label}</span>
                </button>
              ))}
            </div>
            {errors.listing_type && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.listing_type.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="number"
                min="0"
                placeholder="10000"
                className={cn(
                  'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                  errors.price_amount && 'border-red-500 dark:border-red-500 focus:ring-red-200'
                )}
                {...register('price_amount', {
                  setValueAs: (v) => (v === '' ? 0 : Number(v)),
                })}
              />
              {errors.price_amount && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.price_amount.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Price Period */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Price Period *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {pricePeriodOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('price_period', value)}
                className={cn(
                  'flex items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 text-sm',
                  watch('price_period') === value
                    ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
          {errors.price_period && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.price_period.message as string}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="e.g. Ezulwini Valley, Mbabane"
              className={cn(
                'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                errors.location && 'border-red-500 dark:border-red-500 focus:ring-red-200'
              )}
              {...register('location')}
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.location.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Category-specific fields */}
        {renderCategoryFields()}

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            rows={4}
            className={cn(
              'w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200 resize-none',
              errors.description && 'border-red-500 dark:border-red-500 focus:ring-red-200'
            )}
            placeholder={currentCategory?.placeholder.description || 'Describe your property...'}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.description.message as string}
            </p>
          )}
          <div className="flex justify-end mt-1">
            <span
              className={cn(
                'text-xs',
                watch('description')?.length > 1800
                  ? 'text-orange-500'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {watch('description')?.length || 0}/2000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 2: Features & Media
// ============================================================

export function StepFeatures({ form, isSubmitting }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { watch, setValue, formState } = form;
  const { errors } = formState;

  const category = watch('category');
  const features = watch('features') || [];
  const imagePreviews = watch('imagePreviews') || [];
  const images = watch('images') || [];

  const currentCategory = categoryConfigs[category];
  const currentFeatures = currentCategory?.features || [];

  const toggleFeature = (featureLabel: string) => {
    const currentFeatures = watch('features') || [];
    const newFeatures = currentFeatures.includes(featureLabel)
      ? currentFeatures.filter((f) => f !== featureLabel)
      : [...currentFeatures, featureLabel];
    setValue('features', newFeatures);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const currentImages = watch('images') || [];
    const currentPreviews = watch('imagePreviews') || [];

    // Validate file count
    if (files.length + currentImages.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert(`File ${file.name} is not a supported image type`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`File ${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setValue('images', [...currentImages, ...validFiles]);
    setValue('imagePreviews', [...currentPreviews, ...validPreviews]);
  };

  const removeImage = (index: number) => {
    const currentImages = watch('images') || [];
    const currentPreviews = watch('imagePreviews') || [];

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(currentPreviews[index]);

    setValue('images', currentImages.filter((_, i) => i !== index));
    setValue('imagePreviews', currentPreviews.filter((_, i) => i !== index));
  };

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
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Features & Photos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showcase what makes your {category.toLowerCase()} special
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Features & Amenities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {currentFeatures.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleFeature(label)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200',
                features.includes(label)
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-gray-50/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Upload Photos{' '}
          <span className="text-gray-400 dark:text-gray-500 font-normal">
            (Max {MAX_IMAGES})
          </span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleImageUpload}
          disabled={isSubmitting}
        />

        <div
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer group',
            isDragging
              ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'p-4 rounded-full transition-colors',
                isDragging
                  ? 'bg-emerald-200 dark:bg-emerald-800/50'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50'
              )}
            >
              <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? 'Drop your images here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
        </div>

        {errors.images && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.images.message as string}
          </p>
        )}

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={preview}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                    disabled={isSubmitting}
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
      </div>
    </div>
  );
}

// ============================================================
// Step 3: Contact
// ============================================================

export function StepContact({ form }: StepProps) {
  const { register, watch, formState } = form;
  const { errors } = formState;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Contact Information
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            How can potential tenants or buyers reach you?
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="John Dlamini"
              className={cn(
                'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                errors.contact_name && 'border-red-500 dark:border-red-500 focus:ring-red-200'
              )}
              {...register('contact_name')}
            />
            {errors.contact_name && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.contact_name.message as string}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="+268 7612 3456"
              className={cn(
                'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                errors.contact_phone && 'border-red-500 dark:border-red-500 focus:ring-red-200'
              )}
              {...register('contact_phone')}
            />
            {errors.contact_phone && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.contact_phone.message as string}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="email"
              placeholder="john@email.com"
              className={cn(
                'pl-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 text-base py-6 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl transition-all',
                errors.contact_email && 'border-red-500 dark:border-red-500 focus:ring-red-200'
              )}
              {...register('contact_email')}
            />
            {errors.contact_email && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.contact_email.message as string}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Availability
          </label>
          <select
            className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 transition-all duration-200"
            {...register('availability')}
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Listing Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500 dark:text-gray-400">Category</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {watch('category') || 'Not set'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Title</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {watch('title') || 'Not set'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Price</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              E{watch('price_amount') ? watch('price_amount').toLocaleString() : '0'}
              {watch('price_period') === 'month' && '/month'}
              {watch('price_period') === 'year' && '/year'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Location</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {watch('location') || 'Not set'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Photos</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {(watch('images') || []).length} uploaded
            </div>
            <div className="text-gray-500 dark:text-gray-400">Features</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {(watch('features') || []).length} selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
