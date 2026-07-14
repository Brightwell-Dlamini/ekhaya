// app/properties/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  X,
  Filter,
  ChevronDown,
  Home,
  Building,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  Eye,
  Loader2,
  LandPlot,
  Store,
  Sprout,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  getProperties,
  saveProperty,
  unsaveProperty,
  isPropertySaved,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
} from '@/lib/supabase/queries';
import { Property, getCategoryDisplayInfo, getFormattedPrice } from '@/lib/supabase/types';
import { AdvancedFiltersModal, AdvancedFilters } from './components/AdvancedFiltersModal';
import { cn } from '@/lib/utils';

// ============================================================
// Helper Components
// ============================================================

const CategoryIcon = ({ category }: { category: Property['category'] }) => {
  switch (category) {
    case 'Residential':
      return <Home className="h-3.5 w-3.5" />;
    case 'Land/Plot':
      return <LandPlot className="h-3.5 w-3.5" />;
    case 'Commercial':
      return <Store className="h-3.5 w-3.5" />;
    case 'Agricultural':
      return <Sprout className="h-3.5 w-3.5" />;
    case 'Mixed-Use':
      return <Building className="h-3.5 w-3.5" />;
    default:
      return <Building className="h-3.5 w-3.5" />;
  }
};

const CategoryBadge = ({ category }: { category: Property['category'] }) => {
  const colors: Record<Property['category'], string> = {
    Residential: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'Land/Plot': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    Commercial: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    Agricultural: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    'Mixed-Use': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${colors[category]}`}
    >
      <CategoryIcon category={category} />
      {category}
    </span>
  );
};

// ============================================================
// Saved Searches Dropdown
// ============================================================

interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: any;
  created_at: string;
  updated_at: string;
}

function SavedSearchesDropdown({
  onApplySearch,
  onSaveSearch,
  onDeleteSearch,
  savedSearches,
  isSignedIn,
}: {
  onApplySearch: (filters: any) => void;
  onSaveSearch: (name: string) => void;
  onDeleteSearch: (id: string) => void;
  savedSearches: SavedSearch[];
  isSignedIn: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (saveName.trim()) {
      onSaveSearch(saveName.trim());
      setSaveName('');
      setShowSaveInput(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-lg transition-all duration-300"
      >
        <Bookmark className="w-4 h-4 text-emerald-500" />
        Saved Searches
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Saved Searches</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quickly access your saved property searches
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {savedSearches.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                No saved searches yet
              </div>
            ) : (
              savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <button
                    onClick={() => {
                      onApplySearch(search.filters);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {search.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {new Date(search.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteSearch(search.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {isSignedIn && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              {showSaveInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Search name..."
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-1 h-9 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl h-9 px-4"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSaveInput(false)}
                    className="rounded-xl h-9 px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  Save Current Search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded, isSignedIn } = useUser();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    listing_type: searchParams.get('listing_type') || 'All',
    bedrooms: searchParams.get('bedrooms') || 'All',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    verified: searchParams.get('verified') === 'true',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<Partial<AdvancedFilters>>({});
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);

  // Category options for filter
  const categoryOptions = [
    'All',
    'Residential',
    'Land/Plot',
    'Commercial',
    'Agricultural',
    'Mixed-Use',
  ];

  // Load saved searches
  useEffect(() => {
    if (isSignedIn && user) {
      const fetchSavedSearches = async () => {
        try {
          setIsLoadingSearches(true);
          const searches = await getSavedSearches(user.id);
          setSavedSearches(searches);
        } catch (err) {
          console.error('Error loading saved searches:', err);
        } finally {
          setIsLoadingSearches(false);
        }
      };
      fetchSavedSearches();
    }
  }, [isSignedIn, user]);

  // Load wishlist status
  useEffect(() => {
    if (!user) return;

    const loadWishlist = async () => {
      const saved = await Promise.all(
        properties.map(async (p) => {
          const saved = await isPropertySaved(user.id, p.id);
          return saved ? p.id : null;
        })
      );
      setWishlist(new Set(saved.filter(Boolean) as string[]));
    };

    if (properties.length > 0) loadWishlist();
  }, [user, properties]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query params from URL
        const type = searchParams.get('listing_type') || undefined;
        const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;
        const location = searchParams.get('q') || undefined;
        const verified = searchParams.get('verified') === 'true';
        const category = searchParams.get('category') || undefined;
        const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;

        const data = await getProperties({
          listing_type: type,
          bedrooms,
          location,
          verified,
          category: category !== 'All' ? category : undefined,
          minPrice,
          maxPrice,
        });

        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  // Filter locally
  useEffect(() => {
    if (loading) return;

    let results = properties;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Apply basic filters
    if (filters.category !== 'All') {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.listing_type !== 'All') {
      results = results.filter((p) => p.listing_type === filters.listing_type);
    }

    if (filters.bedrooms !== 'All') {
      const beds = parseInt(filters.bedrooms);
      results = results.filter((p) => p.bedrooms === beds);
    }

    if (filters.minPrice) {
      const min = parseInt(filters.minPrice.replace(/,/g, ''));
      results = results.filter((p) => p.price_amount >= min);
    }
    if (filters.maxPrice) {
      const max = parseInt(filters.maxPrice.replace(/,/g, ''));
      results = results.filter((p) => p.price_amount <= max);
    }

    if (filters.verified) {
      results = results.filter((p) => p.verified === true);
    }

    // Apply advanced filters
    if (advancedFilters.bathrooms) {
      results = results.filter((p) => (p.bathrooms || 0) >= (advancedFilters.bathrooms || 0));
    }

    if (advancedFilters.minFloorArea) {
      results = results.filter((p) => (p.floor_area || 0) >= (advancedFilters.minFloorArea || 0));
    }
    if (advancedFilters.maxFloorArea) {
      results = results.filter((p) => (p.floor_area || 0) <= (advancedFilters.maxFloorArea || 0));
    }

    if (advancedFilters.minLandSize) {
      results = results.filter(
        (p) => (p.land_size_hectares || 0) >= (advancedFilters.minLandSize || 0)
      );
    }
    if (advancedFilters.maxLandSize) {
      results = results.filter(
        (p) => (p.land_size_hectares || 0) <= (advancedFilters.maxLandSize || 0)
      );
    }

    if (advancedFilters.features && advancedFilters.features.length > 0) {
      results = results.filter((p) =>
        advancedFilters.features!.some((feature) => (p.features || []).includes(feature))
      );
    }

    if (advancedFilters.amenities && advancedFilters.amenities.length > 0) {
      results = results.filter((p) =>
        advancedFilters.amenities!.some((amenity) => (p.features || []).includes(amenity))
      );
    }

    if (advancedFilters.featured) {
      results = results.filter((p) => p.featured === true);
    }

    if (advancedFilters.status && advancedFilters.status.length > 0) {
      results = results.filter((p) =>
        advancedFilters.status!.includes(p.status?.toLowerCase() || '')
      );
    }

    // Apply sorting
    if (advancedFilters.sortBy) {
      switch (advancedFilters.sortBy) {
        case 'price_low':
          results.sort((a, b) => a.price_amount - b.price_amount);
          break;
        case 'price_high':
          results.sort((a, b) => b.price_amount - a.price_amount);
          break;
        case 'popular':
          results.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case 'views':
          results.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case 'newest':
        default:
          results.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
      }
    }

    setFilteredProperties(results);
  }, [properties, searchQuery, filters, loading, advancedFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.listing_type !== 'All') params.set('listing_type', filters.listing_type);
    if (filters.bedrooms !== 'All') params.set('bedrooms', filters.bedrooms);
    if (filters.verified) params.set('verified', 'true');
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      category: 'All',
      listing_type: 'All',
      bedrooms: 'All',
      minPrice: '',
      maxPrice: '',
      verified: false,
    });
    setActiveQuickFilter(null);
    setAdvancedFilters({});
    router.push('/properties');
  };

  const toggleWishlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      const signInEvent = new CustomEvent('clerk:openSignIn');
      window.dispatchEvent(signInEvent);
      return;
    }

    const isSaved = wishlist.has(id);
    try {
      if (isSaved) {
        await unsaveProperty(user.id, id);
        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        const event = new CustomEvent('wishlistUpdated', {
          detail: { action: 'remove', propertyId: id },
        });
        window.dispatchEvent(event);
      } else {
        await saveProperty(user.id, id);
        setWishlist((prev) => new Set(prev).add(id));
        const event = new CustomEvent('wishlistUpdated', {
          detail: { action: 'add', propertyId: id },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const handleApplyAdvancedFilters = (newFilters: AdvancedFilters) => {
    setAdvancedFilters(newFilters);

    // Update basic filters from advanced
    if (newFilters.category && newFilters.category !== 'All') {
      setFilters((prev) => ({ ...prev, category: newFilters.category }));
    }
    if (newFilters.listing_type && newFilters.listing_type !== 'All') {
      setFilters((prev) => ({ ...prev, listing_type: newFilters.listing_type }));
    }
    if (newFilters.bedrooms) {
      setFilters((prev) => ({ ...prev, bedrooms: String(newFilters.bedrooms) }));
    }
    if (newFilters.minPrice) {
      setFilters((prev) => ({ ...prev, minPrice: String(newFilters.minPrice) }));
    }
    if (newFilters.maxPrice) {
      setFilters((prev) => ({ ...prev, maxPrice: String(newFilters.maxPrice) }));
    }
    if (newFilters.verified) {
      setFilters((prev) => ({ ...prev, verified: true }));
    }

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (newFilters.category && newFilters.category !== 'All')
      params.set('category', newFilters.category);
    if (newFilters.listing_type && newFilters.listing_type !== 'All')
      params.set('listing_type', newFilters.listing_type);
    if (newFilters.bedrooms) params.set('bedrooms', String(newFilters.bedrooms));
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.verified) params.set('verified', 'true');
    router.push(`/properties?${params.toString()}`);
  };

  const handleSaveSearch = async (name: string) => {
    if (!user) return;

    try {
      const searchData = {
        name,
        filters: {
          query: searchQuery,
          category: filters.category,
          listing_type: filters.listing_type,
          bedrooms: filters.bedrooms,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          verified: filters.verified,
          advanced: advancedFilters,
        },
      };

      const saved = await saveSearch(user.id, name, searchData.filters);
      if (saved) {
        setSavedSearches((prev) => [
          ...prev,
          {
            id: saved.id,
            user_id: user.id,
            name: saved.name,
            filters: saved.filters,
            created_at: saved.created_at,
            updated_at: saved.updated_at,
          },
        ]);
      }
    } catch (err) {
      console.error('Error saving search:', err);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting saved search:', err);
    }
  };

  const handleApplySavedSearch = (savedFilters: any) => {
    const params = new URLSearchParams();
    if (savedFilters.query) params.set('q', savedFilters.query);
    if (savedFilters.category && savedFilters.category !== 'All')
      params.set('category', savedFilters.category);
    if (savedFilters.listing_type && savedFilters.listing_type !== 'All')
      params.set('listing_type', savedFilters.listing_type);
    if (savedFilters.bedrooms && savedFilters.bedrooms !== 'All')
      params.set('bedrooms', String(savedFilters.bedrooms));
    if (savedFilters.minPrice) params.set('minPrice', String(savedFilters.minPrice));
    if (savedFilters.maxPrice) params.set('maxPrice', String(savedFilters.maxPrice));
    if (savedFilters.verified) params.set('verified', 'true');

    setSearchQuery(savedFilters.query || '');
    setFilters({
      category: savedFilters.category || 'All',
      listing_type: savedFilters.listing_type || 'All',
      bedrooms: savedFilters.bedrooms || 'All',
      minPrice: savedFilters.minPrice || '',
      maxPrice: savedFilters.maxPrice || '',
      verified: savedFilters.verified || false,
    });
    setAdvancedFilters(savedFilters.advanced || {});
    router.push(`/properties?${params.toString()}`);
  };

  const quickFilters = [
    { label: 'Ezulwini', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: 'Mbabane', icon: <Building className="w-3.5 h-3.5" /> },
    { label: 'Manzini', icon: <Home className="w-3.5 h-3.5" /> },
    { label: 'Malkerns', icon: <Star className="w-3.5 h-3.5" /> },
  ];

  const handleQuickFilter = (area: string) => {
    setActiveQuickFilter(area === activeQuickFilter ? null : area);
    setSearchQuery(area === activeQuickFilter ? '' : area);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-3xl p-8">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premium listings in Eswatini</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                Find your{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  perfect
                </span>{' '}
                property
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {filteredProperties.length} properties available
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                <span>Verified listings</span>
              </p>
            </div>

            {/* Saved Searches Button */}
            {isSignedIn && (
              <div className="flex items-center gap-2">
                <SavedSearchesDropdown
                  onApplySearch={handleApplySavedSearch}
                  onSaveSearch={handleSaveSearch}
                  onDeleteSearch={handleDeleteSearch}
                  savedSearches={savedSearches}
                  isSignedIn={isSignedIn}
                />
              </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="relative mb-6">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/5 dark:shadow-black/30">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by location, property name, or type..."
                    className="pl-12 h-13 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 transition-all text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-13 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Search properties</span>
                  <span className="sm:hidden">Search</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Quick filter chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {quickFilters.map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleQuickFilter(label)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeQuickFilter === label
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="relative mb-8">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/5 dark:shadow-black/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <Filter className="w-4 h-4" />
                  </div>
                  <span>{showFilters ? 'Hide filters' : 'Filter properties'}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showFilters ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={() => setShowAdvancedFilters(true)}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                >
                  <Sliders className="w-4 h-4" />
                  Advanced
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Active filter tags */}
                {(filters.category !== 'All' ||
                  filters.listing_type !== 'All' ||
                  filters.bedrooms !== 'All' ||
                  filters.minPrice ||
                  filters.maxPrice ||
                  filters.verified ||
                  Object.keys(advancedFilters).length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors px-2 py-1"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-800/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 outline-none transition-all"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, category: e.target.value }))
                    }
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Listing Type
                  </label>
                  <select
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 outline-none transition-all"
                    value={filters.listing_type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, listing_type: e.target.value }))
                    }
                  >
                    <option value="All">All Types</option>
                    <option value="Rent">Rent</option>
                    <option value="Sale">Sale</option>
                    <option value="Short Stay">Short Stay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Bedrooms
                  </label>
                  <select
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 outline-none transition-all"
                    value={filters.bedrooms}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, bedrooms: e.target.value }))
                    }
                  >
                    <option value="All">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Min"
                      className="bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Max"
                      className="bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="col-span-2 md:col-span-4">
                  <label className="flex items-center gap-3 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          verified: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-emerald-500 dark:text-emerald-400 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50"
                    />
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium">
                      Verified properties only
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      No scams, no fake landlords
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredProperties.map((property) => {
              const displayInfo = getCategoryDisplayInfo(property);
              const formattedPrice = getFormattedPrice(property);

              return (
                <Card
                  key={property.id}
                  className="group relative bg-white dark:bg-gray-900 border-0 rounded-3xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/40 hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 transition-all duration-500 cursor-pointer"
                  onClick={() => router.push(`/properties/${property.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <img
                      src={
                        property.images?.[0] ||
                        'https://placehold.co/600x450/e2e8f0/1e293b?text=No+Image'
                      }
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <button
                      className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 transition-all duration-300 z-10"
                      onClick={(e) => toggleWishlist(property.id, e)}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-300 ${
                          wishlist.has(property.id)
                            ? 'fill-rose-500 text-rose-500 scale-110'
                            : 'text-gray-600 dark:text-gray-400 hover:text-rose-500'
                        }`}
                      />
                    </button>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <CategoryBadge category={property.category} />
                    </div>

                    {/* Listing Type Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-3.5 py-1.5 rounded-full backdrop-blur-md ${
                          property.listing_type === 'Rent'
                            ? 'bg-green-600/80 text-white'
                            : property.listing_type === 'Sale'
                            ? 'bg-blue-600/80 text-white'
                            : 'bg-purple-600/80 text-white'
                        }`}
                      >
                        {property.listing_type}
                      </span>
                      {property.verified && (
                        <span className="bg-emerald-500/80 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {property.featured && (
                      <div className="absolute top-4 right-20 z-10">
                        <span className="bg-purple-500/80 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                      <span className="truncate">{property.location}</span>
                    </div>

                    <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {formattedPrice}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {displayInfo.showBedrooms && displayInfo.primaryValue !== null && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {displayInfo.primaryValue}
                          </span>
                        </div>
                      )}

                      {displayInfo.showBathrooms && displayInfo.secondaryValue !== null && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {displayInfo.secondaryValue}
                          </span>
                        </div>
                      )}

                      {displayInfo.sizeValue !== null && (
                        <div className="flex items-center gap-1.5">
                          <Square className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {displayInfo.sizeValue}
                            {displayInfo.sizeUnit && ` ${displayInfo.sizeUnit}`}
                          </span>
                        </div>
                      )}

                      {property.category === 'Land/Plot' && property.zoning && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {property.zoning}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="relative text-center py-20">
            <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-12 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-5">
                <Home className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No properties found
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                Clear all filters
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApply={handleApplyAdvancedFilters}
        onClear={() => {
          setAdvancedFilters({});
          setShowAdvancedFilters(false);
        }}
        currentFilters={advancedFilters}
      />
    </div>
  );
}
