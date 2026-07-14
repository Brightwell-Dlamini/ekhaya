// app/wishlist/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Trash2,
  ShoppingBag,
  Home,
  LandPlot,
  Store,
  Sprout,
  Building2,
  Loader2,
  Sparkles,
  ArrowRight,
  Eye,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSavedProperties, unsaveProperty } from '@/lib/supabase/queries';
import { Property, getCategoryDisplayInfo, getFormattedPrice } from '@/lib/supabase/types';

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
      return <Building2 className="h-3.5 w-3.5" />;
    default:
      return <Building2 className="h-3.5 w-3.5" />;
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
// Main Component
// ============================================================

export default function WishlistPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Function to dispatch wishlist update event
  const dispatchWishlistUpdate = (action: 'add' | 'remove', propertyId: string) => {
    const event = new CustomEvent('wishlistUpdated', {
      detail: { action, propertyId }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    if (!isLoaded) return;

    // If not signed in, show a message but don't auto-redirect
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getSavedProperties(user.id);
        setSavedProperties(properties);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load your saved properties');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, isLoaded, isSignedIn]);

  const handleRemove = async (propertyId: string) => {
    if (!user) return;

    setRemovingId(propertyId);
    try {
      await unsaveProperty(user.id, propertyId);
      setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
      
      dispatchWishlistUpdate('remove', propertyId);
      
      setTimeout(() => {
        dispatchWishlistUpdate('refresh', propertyId);
      }, 100);
      
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove property from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewProperty = (id: string) => {
    router.push(`/properties/${id}`);
  };

  // Auth loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in - Show sign in prompt
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-purple-400 dark:text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Sign in to view your wishlist
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Save your favorite properties and access them anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignInButton mode="modal">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg shadow-purple-500/25">
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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Loading your saved properties...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-3xl p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100/80 dark:bg-purple-900/30 backdrop-blur-sm border border-purple-200 dark:border-purple-800/50 rounded-full text-purple-700 dark:text-purple-300 text-xs font-medium mb-3">
              <Heart className="w-3.5 h-3.5 fill-current" />
              Your Collection
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Saved Properties
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl px-6 py-6 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
            onClick={() => router.push('/properties')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Browse More
          </Button>
        </div>

        {/* Wishlist Grid */}
        {savedProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {savedProperties.map((property) => {
              const displayInfo = getCategoryDisplayInfo(property);
              const formattedPrice = getFormattedPrice(property);

              return (
                <Card
                  key={property.id}
                  className="group relative bg-white dark:bg-gray-900 border-0 rounded-3xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/40 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 transition-all duration-500 cursor-pointer"
                  onClick={() => handleViewProperty(property.id)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <img
                      src={
                        property.images?.[0] ||
                        'https://placehold.co/600x450/e2e8f0/1e293b?text=No+Image'
                      }
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Remove from wishlist button */}
                    <button
                      className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 transition-all duration-300 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(property.id);
                      }}
                      disabled={removingId === property.id}
                    >
                      {removingId === property.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
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
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {property.featured && (
                      <div className="absolute top-4 right-20 z-10">
                        <span className="bg-purple-500/80 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Wishlist badge */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <span className="bg-rose-500/80 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        Saved
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-purple-500 dark:text-purple-400" />
                      <span className="truncate">{property.location}</span>
                    </div>

                    <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
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
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-2 border-purple-200 dark:border-purple-800/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl transition-all group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProperty(property.id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="relative text-center py-20">
            <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-12 shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-purple-400 dark:text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                Start saving your favorite properties by clicking the heart icon on any listing.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => router.push('/properties')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg shadow-purple-500/25"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Properties
                </Button>
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
        )}

        {/* Quick Tips */}
        {savedProperties.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/30 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-purple-100/80 dark:bg-purple-900/30">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">
                  💡 Tips for Your Wishlist
                </h4>
                <ul className="text-sm text-purple-800/80 dark:text-purple-400/80 space-y-1">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3" />
                    Compare similar properties side by side
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3" />
                    Contact multiple landlords at once
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3" />
                    Revisit your favorites anytime
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
