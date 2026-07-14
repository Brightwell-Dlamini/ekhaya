// lib/supabase/queries.ts

import { createClient } from './client';
import { Property, CreatePropertyInput, UpdatePropertyInput } from './types';

// ============================================================
// PROPERTIES - CRUD Operations
// ============================================================

/**
 * Get all active properties with optional filters
 */
export const getProperties = async (filters?: {
  category?: string;
  listing_type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  location?: string;
  verified?: boolean;
  featured?: boolean;
}) => {
  const supabase = createClient();
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'Active')
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }
  if (filters?.listing_type && filters.listing_type !== 'All') {
    query = query.eq('listing_type', filters.listing_type);
  }
  if (filters?.bedrooms && filters.bedrooms !== 0) {
    query = query.eq('bedrooms', filters.bedrooms);
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.verified) {
    query = query.eq('verified', true);
  }
  if (filters?.featured) {
    query = query.eq('featured', true);
  }
  if (filters?.minPrice) {
    query = query.gte('price_amount', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('price_amount', filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Property[];
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Property;
};

/**
 * Get all properties for a specific user
 */
export const getUserProperties = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Property[];
};

/**
 * Create a new property
 */
export const createProperty = async (property: CreatePropertyInput) => {
  console.log('🚀 Creating property with data:', JSON.stringify(property, null, 2));

  const supabase = createClient();

  // Validate required fields
  const requiredFields = [
    'user_id',
    'title',
    'category',
    'listing_type',
    'price_amount',
    'price_period',
    'location',
    'description',
    'contact_name',
    'contact_phone',
    'contact_email',
  ];

  const missingFields = requiredFields.filter(
    (field) => !property[field as keyof CreatePropertyInput]
  );

  if (missingFields.length > 0) {
    console.error('❌ Missing fields:', missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Build the insert object
  const insertData: any = {
    user_id: property.user_id,
    title: property.title.trim(),
    category: property.category,
    sub_category: property.sub_category || null,
    listing_type: property.listing_type,
    price_amount: property.price_amount,
    price_period: property.price_period,
    location: property.location.trim(),
    description: property.description.trim(),
    features: property.features || [],
    images: property.images || ['https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image'],
    contact_name: property.contact_name.trim(),
    contact_phone: property.contact_phone.trim(),
    contact_email: property.contact_email.trim(),
    availability: property.availability || 'Available Now',
    status: 'Active',
    verified: false,
    featured: false,
  };

  // Add category-specific fields
  switch (property.category) {
    case 'Residential':
    case 'Mixed-Use':
      insertData.bedrooms = property.bedrooms ?? null;
      insertData.bathrooms = property.bathrooms ?? null;
      insertData.floor_area = property.floor_area ?? null;
      break;

    case 'Land/Plot':
    case 'Agricultural':
      insertData.land_size_hectares = property.land_size_hectares ?? null;
      insertData.land_size_m2 = property.land_size_m2 ?? null;
      insertData.zoning = property.zoning || null;
      insertData.road_access = property.road_access ?? false;
      insertData.fenced = property.fenced ?? false;
      insertData.water_source = property.water_source || null;
      insertData.electricity = property.electricity ?? false;
      insertData.irrigation = property.irrigation ?? false;
      break;

    case 'Commercial':
      insertData.floor_space = property.floor_space ?? null;
      insertData.parking_spaces = property.parking_spaces ?? null;
      insertData.power_supply = property.power_supply || null;
      insertData.storefront = property.storefront ?? false;
      break;

    default:
      break;
  }

  console.log('📦 Final insert data:', JSON.stringify(insertData, null, 2));

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error details:', error);
      
      if (error.code === 'PGRST205') {
        throw new Error('Database schema mismatch. Please run the SQL migration.');
      } else if (error.code === '23502') {
        throw new Error(`Missing required field: ${error.message}`);
      } else if (error.code === '23505') {
        throw new Error('Duplicate entry. This property may already exist.');
      } else if (error.message?.includes('permission')) {
        throw new Error('You do not have permission to insert data. Check RLS policies.');
      } else {
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }
    }

    if (!data) {
      console.error('❌ No data returned from Supabase');
      throw new Error('No data returned after creating property');
    }

    console.log('✅ Property created successfully:', data);
    return data as Property;
  } catch (err) {
    console.error('❌ createProperty caught error:', err);
    
    if (err instanceof Error) {
      throw new Error(`Failed to create property: ${err.message}`);
    }
    throw new Error('An unexpected error occurred while creating the property');
  }
};

/**
 * Update an existing property
 */
export const updateProperty = async (id: string, updates: UpdatePropertyInput) => {
  const supabase = createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  const fields = [
    'title',
    'category',
    'sub_category',
    'listing_type',
    'price_amount',
    'price_period',
    'location',
    'description',
    'features',
    'images',
    'contact_name',
    'contact_phone',
    'contact_email',
    'availability',
    'status',
    'verified',
    'featured',
    'bedrooms',
    'bathrooms',
    'floor_area',
    'land_size_hectares',
    'land_size_m2',
    'zoning',
    'road_access',
    'fenced',
    'water_source',
    'electricity',
    'irrigation',
    'floor_space',
    'parking_spaces',
    'power_supply',
    'storefront',
  ];

  for (const field of fields) {
    if (field in updates && updates[field as keyof UpdatePropertyInput] !== undefined) {
      updateData[field] = updates[field as keyof UpdatePropertyInput];
    }
  }

  console.log('📦 Updating property with:', updateData);

  const { data, error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Update error:', error);
    throw new Error(`Failed to update property: ${error.message}`);
  }

  return data as Property;
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('properties').delete().eq('id', id);

  if (error) {
    console.error('❌ Delete error:', error);
    throw new Error(`Failed to delete property: ${error.message}`);
  }
};

/**
 * Toggle featured status (admin only)
 */
export const toggleFeaturedProperty = async (propertyId: string, featured: boolean) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', propertyId)
    .select()
    .single();

  if (error) {
    console.error('❌ Toggle featured error:', error);
    throw new Error(`Failed to toggle featured: ${error.message}`);
  }
  return data as Property;
};

// ============================================================
// FEATURED PROPERTIES
// ============================================================

export const getFeaturedProperties = async (limit: number = 4) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'Active')
      .eq('featured', true)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured properties:', error);
      return getNewestProperties(limit);
    }

    if (data && data.length > 0) {
      return data as Property[];
    }

    return getNewestProperties(limit);
  } catch (error) {
    console.error('Error in getFeaturedProperties:', error);
    return getNewestProperties(limit);
  }
};

export const getNewestProperties = async (limit: number = 4) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching newest properties:', error);
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }
  return data as Property[];
};

export const getAllFeaturedProperties = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching all featured:', error);
    throw new Error(`Failed to fetch featured properties: ${error.message}`);
  }
  return data as Property[];
};

// ============================================================
// PROPERTY VIEWS
// ============================================================

export const incrementPropertyViews = async (propertyId: string, userId?: string) => {
  const supabase = createClient();

  try {
    const { data: current } = await supabase
      .from('properties')
      .select('views')
      .eq('id', propertyId)
      .single();

    if (current) {
      await supabase
        .from('properties')
        .update({ views: (current.views || 0) + 1 })
        .eq('id', propertyId);
    }

    try {
      await supabase.from('property_views').insert({
        property_id: propertyId,
        user_id: userId || null,
      });
    } catch (viewError) {
      console.debug('View logging skipped (table may not exist)');
    }
  } catch (error) {
    console.error('❌ Error incrementing views:', error);
  }
};

// ============================================================
// SAVED PROPERTIES (Wishlist)
// ============================================================

/**
 * Get all saved properties for a user
 */
export const getSavedProperties = async (userId: string) => {
  const supabase = createClient();
  
  try {
    const { data: savedData, error: savedError } = await supabase
      .from('saved_properties')
      .select('property_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('❌ Error fetching saved properties:', savedError);
      throw new Error(`Failed to fetch saved properties: ${savedError.message}`);
    }

    if (!savedData || savedData.length === 0) {
      return [];
    }

    const propertyIds = savedData.map((item) => item.property_id);

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('❌ Error fetching property details:', propertiesError);
      throw new Error(`Failed to fetch property details: ${propertiesError.message}`);
    }

    return properties || [];
  } catch (error) {
    console.error('❌ Error in getSavedProperties:', error);
    throw error;
  }
};

/**
 * Check if a property is saved by a user
 */
export const isPropertySaved = async (userId: string, propertyId: string) => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking saved status:', error);
      throw new Error(`Failed to check saved status: ${error.message}`);
    }
    
    return !!data;
  } catch (error) {
    console.error('❌ Error in isPropertySaved:', error);
    return false;
  }
};

/**
 * Save a property to user's wishlist
 */
export const saveProperty = async (userId: string, propertyId: string) => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('saved_properties')
      .insert({ 
        user_id: userId, 
        property_id: propertyId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error saving property:', error);
      throw new Error(`Failed to save property: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Error in saveProperty:', error);
    throw error;
  }
};

/**
 * Remove a property from user's wishlist
 */
export const unsaveProperty = async (userId: string, propertyId: string) => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      console.error('❌ Error unsaving property:', error);
      throw new Error(`Failed to unsave property: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Error in unsaveProperty:', error);
    throw error;
  }
};


// ============================================================
// Saved Searches
// ============================================================

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: any;
  created_at: string;
  updated_at: string;
}

export const getSavedSearches = async (userId: string): Promise<SavedSearch[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved searches:', error);
    return [];
  }

  return data || [];
};

export const saveSearch = async (
  userId: string,
  name: string,
  filters: any
): Promise<SavedSearch | null> => {
  const supabase = createClient();

  // Check if a search with this name already exists
  const { data: existing } = await supabase
    .from('saved_searches')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .single();

  let result;
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('saved_searches')
      .update({
        filters,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved search:', error);
      return null;
    }
    result = data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        name,
        filters,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving search:', error);
      return null;
    }
    result = data;
  }

  return result;
};

export const deleteSavedSearch = async (searchId: string): Promise<boolean> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId);

  if (error) {
    console.error('Error deleting saved search:', error);
    return false;
  }

  return true;
};
/**
 * Get count of saved properties for a user
 */
export const getSavedPropertiesCount = async (userId: string) => {
  const supabase = createClient();
  
  try {
    const { count, error } = await supabase
      .from('saved_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error counting saved properties:', error);
      throw new Error(`Failed to count saved properties: ${error.message}`);
    }
    
    return count || 0;
  } catch (error) {
    console.error('❌ Error in getSavedPropertiesCount:', error);
    return 0;
  }
};
