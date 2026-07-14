// app/properties/components/AdvancedFiltersModal.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Home,
  Bed,
  Bath,
  Square,
  Wifi,
  ParkingCircle,
  Shield,
  Trees,
  Droplets,
  Sun,
  Flame,
  Snowflake,
  Heart,
  Building2,
  Fence,
  Zap,
  Car,
  Store,
  Sprout,
  Ruler,
  Loader2,
  Check,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface AdvancedFilters {
  category: string;
  listing_type: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minFloorArea: number | null;
  maxFloorArea: number | null;
  minLandSize: number | null;
  maxLandSize: number | null;
  features: string[];
  amenities: string[];
  verified: boolean;
  featured: boolean;
  status: string[];
  pricePeriod: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterOption {
  id: string;
  label: string;
  icon: any;
  category: 'features' | 'amenities' | 'property';
}

// ============================================================
// Constants
// ============================================================

const FEATURES_OPTIONS: FilterOption[] = [
  { id: 'wifi', label: 'WiFi', icon: Wifi, category: 'features' },
  { id: 'parking', label: 'Parking', icon: ParkingCircle, category: 'features' },
  { id: 'security', label: 'Security', icon: Shield, category: 'features' },
  { id: 'garden', label: 'Garden', icon: Trees, category: 'features' },
  { id: 'pool', label: 'Swimming Pool', icon: Droplets, category: 'features' },
  { id: 'air_conditioning', label: 'Air Conditioning', icon: Sun, category: 'features' },
  { id: 'backup_power', label: 'Backup Power', icon: Flame, category: 'features' },
  { id: 'furnished', label: 'Furnished', icon: Snowflake, category: 'features' },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: Heart, category: 'features' },
  { id: 'balcony', label: 'Balcony', icon: Building2, category: 'features' },
];

const AMENITIES_OPTIONS: FilterOption[] = [
  { id: 'fenced', label: 'Fenced', icon: Fence, category: 'amenities' },
  { id: 'electricity', label: 'Electricity', icon: Zap, category: 'amenities' },
  { id: 'road_access', label: 'Road Access', icon: Car, category: 'amenities' },
  { id: 'storefront', label: 'Storefront', icon: Store, category: 'amenities' },
  { id: 'irrigation', label: 'Irrigation', icon: Sprout, category: 'amenities' },
  { id: 'three_phase', label: 'Three Phase Power', icon: Zap, category: 'amenities' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'views', label: 'Most Viewed' },
  { id: 'relevance', label: 'Relevance' },
];

const CATEGORY_OPTIONS = [
  { id: 'All', label: 'All Categories' },
  { id: 'Residential', label: 'Residential' },
  { id: 'Land/Plot', label: 'Land / Plot' },
  { id: 'Commercial', label: 'Commercial' },
  { id: 'Agricultural', label: 'Agricultural' },
  { id: 'Mixed-Use', label: 'Mixed-Use' },
];

const LISTING_TYPE_OPTIONS = [
  { id: 'All', label: 'All Types' },
  { id: 'Rent', label: 'For Rent' },
  { id: 'Sale', label: 'For Sale' },
  { id: 'Short Stay', label: 'Short Stay' },
];

const PRICE_PERIOD_OPTIONS = [
  { id: 'all', label: 'All Periods' },
  { id: 'month', label: 'Per Month' },
  { id: 'year', label: 'Per Year' },
  { id: 'one-time', label: 'One Time' },
];

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'rented', label: 'Rented' },
  { id: 'sold', label: 'Sold' },
];

// ============================================================
// Sub-components
// ============================================================

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
}

function RangeSlider({ min, max, value, onChange, step = 1000, label }: RangeSliderProps) {
  const [minVal, maxVal] = value;
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, val]);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
            E
          </span>
          <Input
            type="number"
            value={minVal}
            onChange={handleMinChange}
            className="pl-6 w-full border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm h-10"
          />
        </div>
        <span className="mx-2 text-gray-400 dark:text-gray-500">-</span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
            E
          </span>
          <Input
            type="number"
            value={maxVal}
            onChange={handleMaxChange}
            className="pl-6 w-full border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm h-10"
          />
        </div>
      </div>

      <div className="relative pt-1">
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            style={{
              left: `${((minVal - min) / (max - min)) * 100}%`,
              right: `${100 - ((maxVal - min) / (max - min)) * 100}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          onMouseDown={() => setIsDragging('min')}
          onMouseUp={() => setIsDragging(null)}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ pointerEvents: isDragging === 'max' ? 'none' : 'auto' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          onMouseDown={() => setIsDragging('max')}
          onMouseUp={() => setIsDragging(null)}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ pointerEvents: isDragging === 'min' ? 'none' : 'auto' }}
        />
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  icon?: any;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function FilterChip({ label, icon: Icon, selected, onClick, disabled }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
        selected
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
          : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

// ============================================================
// Main Component
// ============================================================

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilters) => void;
  onClear: () => void;
  currentFilters: Partial<AdvancedFilters>;
}

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  currentFilters,
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(() => ({
    category: currentFilters.category || 'All',
    listing_type: currentFilters.listing_type || 'All',
    minPrice: currentFilters.minPrice || null,
    maxPrice: currentFilters.maxPrice || null,
    bedrooms: currentFilters.bedrooms || null,
    bathrooms: currentFilters.bathrooms || null,
    minFloorArea: currentFilters.minFloorArea || null,
    maxFloorArea: currentFilters.maxFloorArea || null,
    minLandSize: currentFilters.minLandSize || null,
    maxLandSize: currentFilters.maxLandSize || null,
    features: currentFilters.features || [],
    amenities: currentFilters.amenities || [],
    verified: currentFilters.verified || false,
    featured: currentFilters.featured || false,
    status: currentFilters.status || [],
    pricePeriod: currentFilters.pricePeriod || 'all',
    sortBy: currentFilters.sortBy || 'newest',
    sortOrder: currentFilters.sortOrder || 'desc',
  }));

  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000000,
  ]);
  const [floorAreaRange, setFloorAreaRange] = useState<[number, number]>([
    filters.minFloorArea || 0,
    filters.maxFloorArea || 10000,
  ]);
  const [landSizeRange, setLandSizeRange] = useState<[number, number]>([
    filters.minLandSize || 0,
    filters.maxLandSize || 1000,
  ]);

  // Reset to current filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters({
        category: currentFilters.category || 'All',
        listing_type: currentFilters.listing_type || 'All',
        minPrice: currentFilters.minPrice || null,
        maxPrice: currentFilters.maxPrice || null,
        bedrooms: currentFilters.bedrooms || null,
        bathrooms: currentFilters.bathrooms || null,
        minFloorArea: currentFilters.minFloorArea || null,
        maxFloorArea: currentFilters.maxFloorArea || null,
        minLandSize: currentFilters.minLandSize || null,
        maxLandSize: currentFilters.maxLandSize || null,
        features: currentFilters.features || [],
        amenities: currentFilters.amenities || [],
        verified: currentFilters.verified || false,
        featured: currentFilters.featured || false,
        status: currentFilters.status || [],
        pricePeriod: currentFilters.pricePeriod || 'all',
        sortBy: currentFilters.sortBy || 'newest',
        sortOrder: currentFilters.sortOrder || 'desc',
      });

      setPriceRange([
        currentFilters.minPrice || 0,
        currentFilters.maxPrice || 1000000,
      ]);
      setFloorAreaRange([
        currentFilters.minFloorArea || 0,
        currentFilters.maxFloorArea || 10000,
      ]);
      setLandSizeRange([
        currentFilters.minLandSize || 0,
        currentFilters.maxLandSize || 1000,
      ]);
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply({
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : null,
      maxPrice: priceRange[1] < 1000000 ? priceRange[1] : null,
      minFloorArea: floorAreaRange[0] > 0 ? floorAreaRange[0] : null,
      maxFloorArea: floorAreaRange[1] < 10000 ? floorAreaRange[1] : null,
      minLandSize: landSizeRange[0] > 0 ? landSizeRange[0] : null,
      maxLandSize: landSizeRange[1] < 1000 ? landSizeRange[1] : null,
    });
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: AdvancedFilters = {
      category: 'All',
      listing_type: 'All',
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      minFloorArea: null,
      maxFloorArea: null,
      minLandSize: null,
      maxLandSize: null,
      features: [],
      amenities: [],
      verified: false,
      featured: false,
      status: [],
      pricePeriod: 'all',
      sortBy: 'newest',
      sortOrder: 'desc',
    };
    setFilters(emptyFilters);
    setPriceRange([0, 1000000]);
    setFloorAreaRange([0, 10000]);
    setLandSizeRange([0, 1000]);
    onClear();
  };

  const toggleFeature = (featureId: string) => {
    setFilters((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const toggleStatus = (statusId: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(statusId)
        ? prev.status.filter((s) => s !== statusId)
        : [...prev.status, statusId],
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.listing_type !== 'All') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.minFloorArea) count++;
    if (filters.maxFloorArea) count++;
    if (filters.minLandSize) count++;
    if (filters.maxLandSize) count++;
    if (filters.features.length > 0) count += filters.features.length;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.verified) count++;
    if (filters.featured) count++;
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.pricePeriod !== 'all') count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                  <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Advanced Filters
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getActiveFilterCount()} filters active
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Sort & Quick Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FilterSection title="Sort By">
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <FilterChip
                        key={option.id}
                        label={option.label}
                        selected={filters.sortBy === option.id}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, sortBy: option.id }))
                        }
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Quick Filters">
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="Verified Only"
                      selected={filters.verified}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, verified: !prev.verified }))
                      }
                    />
                    <FilterChip
                      label="Featured"
                      selected={filters.featured}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, featured: !prev.featured }))
                      }
                    />
                    <FilterChip
                      label="Pet Friendly"
                      selected={filters.features.includes('pet_friendly')}
                      onClick={() => toggleFeature('pet_friendly')}
                    />
                    <FilterChip
                      label="Furnished"
                      selected={filters.features.includes('furnished')}
                      onClick={() => toggleFeature('furnished')}
                    />
                  </div>
                </FilterSection>
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FilterSection title="Category">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((option) => (
                      <FilterChip
                        key={option.id}
                        label={option.label}
                        selected={filters.category === option.id}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, category: option.id }))
                        }
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Listing Type">
                  <div className="flex flex-wrap gap-2">
                    {LISTING_TYPE_OPTIONS.map((option) => (
                      <FilterChip
                        key={option.id}
                        label={option.label}
                        selected={filters.listing_type === option.id}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, listing_type: option.id }))
                        }
                      />
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Price Range */}
              <FilterSection title="Price Range">
                <RangeSlider
                  min={0}
                  max={1000000}
                  value={priceRange}
                  onChange={setPriceRange}
                  step={1000}
                />
              </FilterSection>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <FilterSection title="Bedrooms">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <FilterChip
                        key={num}
                        label={`${num}+`}
                        selected={filters.bedrooms === num}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            bedrooms: prev.bedrooms === num ? null : num,
                          }))
                        }
                      />
                    ))}
                    <FilterChip
                      label="Any"
                      selected={filters.bedrooms === null}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, bedrooms: null }))
                      }
                    />
                  </div>
                </FilterSection>

                <FilterSection title="Bathrooms">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <FilterChip
                        key={num}
                        label={num === 4 ? '4+' : `${num}`}
                        selected={filters.bathrooms === num}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            bathrooms: prev.bathrooms === num ? null : num,
                          }))
                        }
                      />
                    ))}
                    <FilterChip
                      label="Any"
                      selected={filters.bathrooms === null}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, bathrooms: null }))
                      }
                    />
                  </div>
                </FilterSection>
              </div>

              {/* Floor Area */}
              <FilterSection title="Floor Area (m²)">
                <RangeSlider
                  min={0}
                  max={10000}
                  value={floorAreaRange}
                  onChange={setFloorAreaRange}
                  step={50}
                />
              </FilterSection>

              {/* Land Size */}
              <FilterSection title="Land Size (hectares)">
                <RangeSlider
                  min={0}
                  max={1000}
                  value={landSizeRange}
                  onChange={setLandSizeRange}
                  step={0.5}
                />
              </FilterSection>

              {/* Features */}
              <FilterSection title="Features & Amenities">
                <div className="flex flex-wrap gap-2">
                  {FEATURES_OPTIONS.map((feature) => (
                    <FilterChip
                      key={feature.id}
                      label={feature.label}
                      icon={feature.icon}
                      selected={filters.features.includes(feature.id)}
                      onClick={() => toggleFeature(feature.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Amenities */}
              <FilterSection title="Property Amenities">
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <FilterChip
                      key={amenity.id}
                      label={amenity.label}
                      icon={amenity.icon}
                      selected={filters.amenities.includes(amenity.id)}
                      onClick={() => toggleAmenity(amenity.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Price Period */}
              <FilterSection title="Price Period">
                <div className="flex flex-wrap gap-2">
                  {PRICE_PERIOD_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.id}
                      label={option.label}
                      selected={filters.pricePeriod === option.id}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, pricePeriod: option.id }))
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Status */}
              <FilterSection title="Property Status">
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.id}
                      label={option.label}
                      selected={filters.status.includes(option.id)}
                      onClick={() => toggleStatus(option.id)}
                    />
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <Button
                variant="outline"
                onClick={handleClear}
                className="rounded-2xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear All
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-2xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 shadow-lg shadow-emerald-500/25"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
