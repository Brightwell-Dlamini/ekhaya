// app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Home,
  Users,
  Calendar,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  LandPlot,
  Store,
  Sprout,
  Building2,
  Star,
  LogIn,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  getUserProperties,
  deleteProperty,
  updateProperty,
  toggleFeaturedProperty,
} from '@/lib/supabase/queries';
import { Property, getCategoryDisplayInfo, getFormattedPrice } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

// ============================================================
// Helper Components
// ============================================================

const CategoryBadge = ({ category }: { category: Property['category'] }) => {
  const colors: Record<Property['category'], string> = {
    Residential: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'Land/Plot': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    Commercial: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    Agricultural: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    'Mixed-Use': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  };

  const icons: Record<Property['category'], any> = {
    Residential: Home,
    'Land/Plot': LandPlot,
    Commercial: Store,
    Agricultural: Sprout,
    'Mixed-Use': Building2,
  };

  const Icon = icons[category];

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${colors[category]}`}
    >
      <Icon className="w-3 h-3" />
      {category}
    </span>
  );
};

// ============================================================
// Main Component
// ============================================================

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTogglingFeatured, setIsTogglingFeatured] = useState<string | null>(null);

  useEffect(() => {
    // If not signed in, don't try to fetch
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await getUserProperties(user.id);
        setListings(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load your listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, isSignedIn]);

  const filteredListings = listings
    .filter((l) => filter === 'All' || l.status === filter)
    .filter(
      (l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleStatus = async (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;

    const newStatus = listing.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateProperty(id, { status: newStatus as any });
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus as any } : l))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setIsTogglingFeatured(id);
    try {
      const updated = await toggleFeaturedProperty(id, !currentFeatured);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, featured: updated.featured } : l))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      alert('Failed to update featured status');
    } finally {
      setIsTogglingFeatured(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteProperty(id);
        setListings((prev) => prev.filter((l) => l.id !== id));
      } catch (err) {
        console.error('Failed to delete:', err);
        alert('Failed to delete property');
      }
    }
  };

  const stats = [
    {
      label: 'Total Listings',
      value: listings.length.toString(),
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Active Listings',
      value: listings.filter((l) => l.status === 'Active').length.toString(),
      icon: Eye,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Total Views',
      value: listings.reduce((acc, l) => acc + (l.views || 0), 0).toString(),
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
      label: 'Featured',
      value: listings.filter((l) => l.featured).length.toString(),
      icon: Star,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  // Auth loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-emerald-400 dark:text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Sign in to view your dashboard
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Manage your property listings, track performance, and more.
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome back
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage your property listings and track performance
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-6 py-6 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            onClick={() => router.push('/list-property')}
          >
            <Plus className="w-4 h-4 mr-2" />
            List New Property
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-0 shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {stat.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Listings Section */}
        <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl">
          <CardContent className="p-6 sm:p-8">
            {/* Table Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Listings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredListings.length} properties found
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Status Filter */}
                <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
                  {['All', 'Active', 'Inactive'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setFilter(option)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        filter === option
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <Input
                    placeholder="Search listings..."
                    className="pl-10 w-40 sm:w-48 h-10 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Listings */}
            {filteredListings.length > 0 ? (
              <div className="space-y-3">
                {filteredListings.map((listing) => {
                  const formattedPrice = getFormattedPrice(listing);
                  const displayInfo = getCategoryDisplayInfo(listing);

                  return (
                    <div
                      key={listing.id}
                      className="flex flex-wrap items-center gap-4 p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img
                          src={listing.images?.[0] || '/placeholder-property.jpg'}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/100x100/e2e8f0/1e293b?text=No+Image';
                          }}
                        />
                        {listing.verified && (
                          <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-0.5 shadow-lg">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {listing.featured && (
                          <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-0.5 shadow-lg">
                            <Star className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {listing.title}
                          </h3>
                          <CategoryBadge category={listing.category} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.location}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formattedPrice}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {listing.listing_type}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              listing.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {listing.status}
                          </span>
                          {displayInfo.primaryValue !== null && (
                            <>
                              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {displayInfo.primaryLabel}: {displayInfo.primaryValue}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {listing.views || 0}
                          </div>
                          <div className="text-xs">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">0</div>
                          <div className="text-xs">Inquiries</div>
                        </div>
                        <div className="hidden sm:block text-center">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs">Posted</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {/* Featured Toggle */}
                        <button
                          onClick={() => handleToggleFeatured(listing.id, listing.featured)}
                          disabled={isTogglingFeatured === listing.id}
                          className={cn(
                            'p-2 rounded-xl transition-colors',
                            listing.featured
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
                          )}
                          title={listing.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          {isTogglingFeatured === listing.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Star
                              className={cn(
                                'w-4 h-4',
                                listing.featured ? 'fill-current' : ''
                              )}
                            />
                          )}
                        </button>

                        <button
                          onClick={() => router.push(`/properties/${listing.id}`)}
                          className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => toggleStatus(listing.id)}
                          className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {listing.status === 'Active' ? (
                            <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => router.push(`/edit-property/${listing.id}`)}
                          className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Home className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                  No listings found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by listing your first property'}
                </p>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-6 shadow-lg shadow-emerald-500/25"
                  onClick={() => router.push('/list-property')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  List Your First Property
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="mt-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/30 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-100/80 dark:bg-blue-900/30">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                💡 Tips for Better Listings
              </h4>
              <ul className="text-sm text-blue-800/80 dark:text-blue-400/80 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  High-quality photos increase views by 40%
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Verified listings get 3x more inquiries
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Featured properties appear on the homepage
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Reply to inquiries within 24 hours for best results
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
