// app/list-property/types.ts

import { z } from 'zod';
import {
  Home,
  LandPlot,
  Store,
  Sprout,
  Building2,
  Wifi,
  ParkingCircle,
  Shield,
  Trees,
  Droplets,
  Sun,
  Flame,
  Snowflake,
  Heart,
  Fence,
  Zap,
  Car,
  Ruler,
  Square,
  DollarSign,
  Calendar,
} from 'lucide-react';

// ============================================================
// Zod Schema for Form Validation
// ============================================================

export const propertyFormSchema = z
  .object({
    // Core fields
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
    category: z.enum(['Residential', 'Land/Plot', 'Commercial', 'Agricultural', 'Mixed-Use']),
    sub_category: z.string().optional(),
    listing_type: z.enum(['Rent', 'Sale', 'Short Stay']),
    price_amount: z.number().positive('Price must be greater than 0'),
    price_period: z.enum(['month', 'year', 'one-time']),
    location: z.string().min(3, 'Location must be at least 3 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),

    // Residential / Mixed-Use
    bedrooms: z.number().nullable().optional(),
    bathrooms: z.number().nullable().optional(),
    floor_area: z.number().nullable().optional(),

    // Land / Agricultural
    land_size_hectares: z.number().nullable().optional(),
    land_size_m2: z.number().nullable().optional(),
    zoning: z.string().nullable().optional(),
    road_access: z.boolean().nullable().optional(),
    fenced: z.boolean().nullable().optional(),
    water_source: z.string().nullable().optional(),
    electricity: z.boolean().nullable().optional(),
    irrigation: z.boolean().nullable().optional(),

    // Commercial
    floor_space: z.number().nullable().optional(),
    parking_spaces: z.number().nullable().optional(),
    power_supply: z.string().nullable().optional(),
    storefront: z.boolean().nullable().optional(),

    // Features & Media
    features: z.array(z.string()).default([]),
    images: z.array(z.instanceof(File)).max(8, 'Maximum 8 images allowed'),
    imagePreviews: z.array(z.string()).default([]),

    // Contact
    contact_name: z.string().min(2, 'Name must be at least 2 characters'),
    contact_phone: z.string().min(6, 'Valid phone number required'),
    contact_email: z.string().email('Invalid email address'),
    availability: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const category = data.category;

    // Helper to check if a number is valid
    const isValidNumber = (val: any): boolean => {
      if (typeof val === 'number') return !isNaN(val) && val >= 0;
      return false;
    };

    // Residential / Mixed-Use validation
    if (category === 'Residential' || category === 'Mixed-Use') {
      if (!isValidNumber(data.bedrooms)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bedrooms required',
          path: ['bedrooms'],
        });
      }
      if (!isValidNumber(data.bathrooms)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bathrooms required',
          path: ['bathrooms'],
        });
      }
    }

    // Land / Agricultural validation
    if (category === 'Land/Plot' || category === 'Agricultural') {
      const hasSize =
        isValidNumber(data.land_size_hectares) || isValidNumber(data.land_size_m2);
      if (!hasSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Land size (hectares or m²) required',
          path: ['land_size_hectares'],
        });
      }
    }

    // Commercial validation
    if (category === 'Commercial') {
      if (!isValidNumber(data.floor_space)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Floor space in m² required',
          path: ['floor_space'],
        });
      }
    }
  });

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

// ============================================================
// Type Aliases
// ============================================================

export type PropertyCategory = z.infer<typeof propertyFormSchema.shape.category>;
export type ListingType = z.infer<typeof propertyFormSchema.shape.listing_type>;
export type PricePeriod = z.infer<typeof propertyFormSchema.shape.price_period>;

// ============================================================
// Category Configurations
// ============================================================

export const categoryConfigs: Record<
  PropertyCategory,
  {
    icon: any;
    label: string;
    description: string;
    subCategories: { value: string; label: string }[];
    features: { icon: any; label: string }[];
    placeholder: {
      title: string;
      description: string;
    };
    fields: string[];
  }
> = {
  Residential: {
    icon: Home,
    label: 'Residential',
    description: 'Houses, apartments, and homes for living',
    placeholder: {
      title: 'e.g. Modern 2-Bedroom Apartment in Mbabane',
      description: 'Describe your home, including the number of rooms, amenities, nearby facilities, and what makes it special for living...',
    },
    subCategories: [
      { value: 'House', label: 'House' },
      { value: 'Apartment', label: 'Apartment' },
      { value: 'Townhouse', label: 'Townhouse' },
      { value: 'Duplex', label: 'Duplex' },
      { value: 'Garden Flat', label: 'Garden Flat' },
    ],
    features: [
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
    ],
    fields: ['bedrooms', 'bathrooms', 'floor_area'],
  },
  'Land/Plot': {
    icon: LandPlot,
    label: 'Land / Plot',
    description: 'Vacant land, plots, and development sites',
    placeholder: {
      title: 'e.g. Prime Residential Plot in Ezulwini Valley',
      description: 'Describe the land including access, utilities, topography, views, and development potential...',
    },
    subCategories: [
      { value: 'Residential Plot', label: 'Residential Plot' },
      { value: 'Commercial Plot', label: 'Commercial Plot' },
      { value: 'Agricultural Land', label: 'Agricultural Land' },
      { value: 'Farm', label: 'Farm' },
      { value: 'Ranch', label: 'Ranch' },
    ],
    features: [
      { icon: Fence, label: 'Fenced' },
      { icon: Droplets, label: 'Water Source' },
      { icon: Zap, label: 'Electricity' },
      { icon: Car, label: 'Road Access' },
      { icon: Trees, label: 'Trees/Vegetation' },
      { icon: Shield, label: 'Security' },
      { icon: Sprout, label: 'Cultivated' },
    ],
    fields: [
      'land_size_hectares',
      'land_size_m2',
      'zoning',
      'road_access',
      'fenced',
      'water_source',
      'electricity',
      'irrigation',
    ],
  },
  Commercial: {
    icon: Store,
    label: 'Commercial',
    description: 'Business premises, shops, and offices',
    placeholder: {
      title: 'e.g. Modern Office Space in Central Mbabane',
      description: 'Describe the premises including location, visibility, parking, foot traffic, and business potential...',
    },
    subCategories: [
      { value: 'Office', label: 'Office' },
      { value: 'Retail', label: 'Retail / Shop' },
      { value: 'Warehouse', label: 'Warehouse' },
      { value: 'Industrial', label: 'Industrial' },
      { value: 'Restaurant/Cafe', label: 'Restaurant / Cafe' },
    ],
    features: [
      { icon: ParkingCircle, label: 'Parking' },
      { icon: Shield, label: 'Security' },
      { icon: Zap, label: 'Three Phase Power' },
      { icon: Wifi, label: 'Office WiFi' },
      { icon: Building2, label: 'Storefront' },
      { icon: Sun, label: 'Air Conditioning' },
      { icon: Flame, label: 'Backup Power' },
    ],
    fields: ['floor_space', 'parking_spaces', 'power_supply', 'storefront'],
  },
  Agricultural: {
    icon: Sprout,
    label: 'Agricultural',
    description: 'Farms, plantations, and agricultural land',
    placeholder: {
      title: 'e.g. 10-Hectare Farm in Malkerns',
      description: 'Describe the land, water sources, fencing, infrastructure, soil type, crops, and agricultural potential...',
    },
    subCategories: [
      { value: 'Cropland', label: 'Cropland' },
      { value: 'Pasture', label: 'Pasture / Grazing' },
      { value: 'Mixed Farm', label: 'Mixed Farm' },
      { value: 'Orchard', label: 'Orchard' },
      { value: 'Plantation', label: 'Plantation' },
    ],
    features: [
      { icon: Droplets, label: 'Water Source' },
      { icon: Zap, label: 'Electricity' },
      { icon: Fence, label: 'Fenced' },
      { icon: Car, label: 'Road Access' },
      { icon: Trees, label: 'Trees/Vegetation' },
      { icon: Shield, label: 'Security' },
      { icon: Sprout, label: 'Irrigation' },
    ],
    fields: [
      'land_size_hectares',
      'land_size_m2',
      'zoning',
      'road_access',
      'fenced',
      'water_source',
      'electricity',
      'irrigation',
    ],
  },
  'Mixed-Use': {
    icon: Building2,
    label: 'Mixed-Use',
    description: 'Combined residential and commercial properties',
    placeholder: {
      title: 'e.g. Mixed-Use Building in Mbabane CBD',
      description: 'Describe the property including residential units, commercial space, location, and unique features...',
    },
    subCategories: [
      { value: 'House', label: 'House' },
      { value: 'Apartment', label: 'Apartment' },
      { value: 'Townhouse', label: 'Townhouse' },
      { value: 'Duplex', label: 'Duplex' },
      { value: 'Garden Flat', label: 'Garden Flat' },
    ],
    features: [
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
    ],
    fields: ['bedrooms', 'bathrooms', 'floor_area'],
  },
};

// ============================================================
// Options for Selects
// ============================================================

export const categoryOptions: { value: PropertyCategory; icon: any; label: string }[] = [
  { value: 'Residential', icon: Home, label: 'Residential' },
  { value: 'Land/Plot', icon: LandPlot, label: 'Land / Plot' },
  { value: 'Commercial', icon: Store, label: 'Commercial' },
  { value: 'Agricultural', icon: Sprout, label: 'Agricultural' },
  { value: 'Mixed-Use', icon: Building2, label: 'Mixed-Use' },
];

export const listingTypeOptions = [
  { value: 'Rent' as const, icon: Home, label: 'For Rent' },
  { value: 'Sale' as const, icon: DollarSign, label: 'For Sale' },
  { value: 'Short Stay' as const, icon: Calendar, label: 'Short Stay' },
];

export const pricePeriodOptions = [
  { value: 'month' as const, label: 'Per Month' },
  { value: 'year' as const, label: 'Per Year' },
  { value: 'one-time' as const, label: 'One Time' },
];

export const availabilityOptions = [
  'Available Now',
  'Available from July 2026',
  'Available from August 2026',
  'Available from September 2026',
] as const;

// ============================================================
// Image Upload Constants
// ============================================================

export const MAX_IMAGES = 8;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
