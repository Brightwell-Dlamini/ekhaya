// lib/supabase/types.ts

export type Property = {
  // Core fields
  id: string;
  user_id: string;
  title: string;
  category: 'Residential' | 'Land/Plot' | 'Commercial' | 'Agricultural' | 'Mixed-Use';
  sub_category: string | null;
  listing_type: 'Rent' | 'Sale' | 'Short Stay';
  price_amount: number;
  price_period: 'month' | 'year' | 'one-time';
  location: string;
  description: string;
  features: string[];
  images: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  availability: string | null;
  status: 'Active' | 'Inactive' | 'Rented' | 'Sold';
  verified: boolean;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;

  // Residential / Mixed-Use
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;

  // Land / Agricultural
  land_size_hectares: number | null;
  land_size_m2: number | null;
  zoning: string | null;
  road_access: boolean | null;
  fenced: boolean | null;
  water_source: string | null;
  electricity: boolean | null;
  irrigation: boolean | null;

  // Commercial
  floor_space: number | null;
  parking_spaces: number | null;
  power_supply: string | null;
  storefront: boolean | null;
};

// For creating a new property (omits auto-generated fields)
export type CreatePropertyInput = Omit<
  Property,
  'id' | 'created_at' | 'updated_at' | 'views' | 'verified' | 'featured'
>;

// For updating a property
export type UpdatePropertyInput = Partial<
  Omit<Property, 'id' | 'created_at' | 'updated_at' | 'views'>
>;

// Helper: Get formatted price
export const getFormattedPrice = (property: Property): string => {
  const price = property.price_amount;
  const period = property.price_period;

  switch (period) {
    case 'month':
      return `E${price.toLocaleString()}/month`;
    case 'year':
      return `E${price.toLocaleString()}/year`;
    case 'one-time':
      return `E${price.toLocaleString()}`;
    default:
      return `E${price.toLocaleString()}`;
  }
};

// Helper: Get category display info
export const getCategoryDisplayInfo = (property: Property) => {
  switch (property.category) {
    case 'Residential':
    case 'Mixed-Use':
      return {
        primaryLabel: 'Bedrooms',
        primaryValue: property.bedrooms,
        secondaryLabel: 'Bathrooms',
        secondaryValue: property.bathrooms,
        sizeLabel: 'Floor Area',
        sizeValue: property.floor_area,
        sizeUnit: 'm²',
        showBathrooms: true,
        showBedrooms: true,
      };
    case 'Land/Plot':
    case 'Agricultural':
      return {
        primaryLabel: 'Land Size',
        primaryValue: property.land_size_hectares || property.land_size_m2,
        secondaryLabel: 'Zoning',
        secondaryValue: property.zoning || 'Not specified',
        sizeLabel: 'Size',
        sizeValue: property.land_size_hectares || property.land_size_m2,
        sizeUnit: property.land_size_hectares ? 'hectares' : 'm²',
        showBathrooms: false,
        showBedrooms: false,
      };
    case 'Commercial':
      return {
        primaryLabel: 'Floor Space',
        primaryValue: property.floor_space,
        secondaryLabel: 'Parking',
        secondaryValue: property.parking_spaces,
        sizeLabel: 'Floor Space',
        sizeValue: property.floor_space,
        sizeUnit: 'm²',
        showBathrooms: false,
        showBedrooms: false,
      };
    default:
      return {
        primaryLabel: 'Size',
        primaryValue: null,
        secondaryLabel: 'Details',
        secondaryValue: null,
        sizeLabel: 'Size',
        sizeValue: null,
        sizeUnit: '',
        showBathrooms: false,
        showBedrooms: false,
      };
  }
};

// Helper: Get features based on category
export const getDefaultFeatures = (category: Property['category']): string[] => {
  const featureMap: Record<Property['category'], string[]> = {
    Residential: ['WiFi', 'Parking', 'Security', 'Garden', 'Air Conditioning', 'Backup Power'],
    'Land/Plot': ['Road Access', 'Water Source', 'Electricity', 'Fenced'],
    Commercial: ['Parking', 'Security', 'Three Phase Power', 'Storefront'],
    Agricultural: ['Water Source', 'Electricity', 'Fenced', 'Road Access', 'Irrigation'],
    'Mixed-Use': ['WiFi', 'Parking', 'Security', 'Garden', 'Air Conditioning', 'Backup Power'],
  };
  return featureMap[category] || [];
};
