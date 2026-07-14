// app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  MapPin,
  Building2,
  CheckCircle,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  Loader2,
  Star,
  Home,
  LandPlot,
  Store,
  Sprout,
} from 'lucide-react';
import { getFeaturedProperties } from '@/lib/supabase/queries';
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

// ============================================================
// Main Component
// ============================================================

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFeaturedMode, setIsFeaturedMode] = useState(false);

  // Fetch featured properties on mount
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const properties = await getFeaturedProperties(4);
        setFeaturedProperties(properties);

        // Check if we got featured or fallback properties
        setIsFeaturedMode(properties.some((p) => p.featured === true));
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setError('Failed to load featured properties');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/properties');
    }
  };

  const handleCityClick = (city: string) => {
    router.push(`/properties?location=${encodeURIComponent(city)}`);
  };

  const handlePropertyClick = (id: string) => {
    router.push(`/properties/${id}`);
  };

  const cities = [
    { name: 'Mbabane', properties: 342, image: '🏙️' },
    { name: 'Manzini', properties: 287, image: '🏘️' },
    { name: 'Ezulwini', properties: 156, image: '🏞️' },
    { name: 'Malkerns', properties: 98, image: '🌾' },
    { name: 'Lobamba', properties: 67, image: '🏛️' },
    { name: 'Big Bend', properties: 45, image: '🌅' },
  ];

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Search',
      description: 'Pick your city and filter by what matters to you - price, bedrooms, amenities.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'group-hover:border-purple-500/30',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      number: '02',
      icon: CheckCircle,
      title: 'Find',
      description: 'Browse verified listings with real photos and detailed information.',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'group-hover:border-blue-500/30',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      number: '03',
      icon: Heart,
      title: 'Connect',
      description: 'Contact the landlord directly via WhatsApp or phone with one click.',
      color: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-500/10',
      border: 'group-hover:border-teal-500/30',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0F] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-32 bg-white dark:bg-[#0A0A0F] transition-colors duration-300">
        <div className="absolute top-[-30%] right-[-20%] h-[600px] w-[600px] rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl dark:from-purple-600/20 dark:to-blue-600/20" />
        <div className="absolute bottom-[-30%] left-[-20%] h-[500px] w-[500px] rounded-full bg-gradient-to-r from-teal-600/20 to-emerald-600/20 blur-3xl dark:from-teal-600/20 dark:to-emerald-600/20" />
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 backdrop-blur-sm mb-6 sm:mb-8 transition-colors duration-300">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Trusted by 5,000+ property seekers
            </div>

            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Find Your
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {' '}
                Perfect Home
              </span>
              <br />
              in Eswatini
            </h1>

            <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 transition-colors duration-300">
              The trusted, searchable platform for all property in Eswatini. Rent, buy, or list —
              all in one place.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 sm:mt-10 flex w-full max-w-2xl flex-col sm:flex-row gap-2 rounded-2xl bg-gray-50/80 dark:bg-white/5 p-2 backdrop-blur-xl ring-1 ring-gray-200 dark:ring-white/10 transition-colors duration-300"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search properties, areas..."
                  className="h-12 w-full border-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 px-8 font-medium text-white hover:opacity-90 transition-opacity"
              >
                Search
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm text-gray-500">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Popular:</span>
              {['Ezulwini', 'Mbabane', 'Manzini', 'Malkerns'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleCityClick(item)}
                  className="rounded-full bg-gray-100 dark:bg-white/5 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors sm:px-3"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0F] transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4">
            {[
              { number: '5,000+', label: 'Listings' },
              { number: '98%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Support' },
              { number: '100%', label: 'Verified Properties' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.number}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="px-4 py-12 sm:py-20 bg-white dark:bg-[#0A0A0F] transition-colors duration-300">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 mb-3">
                {isFeaturedMode ? (
                  <>
                    <Star className="h-3 w-3 fill-purple-600 dark:fill-purple-400" />
                    Featured Listings
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Newest Listings
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {isFeaturedMode ? (
                  <>
                    Featured{' '}
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Properties
                    </span>
                  </>
                ) : (
                  <>
                    Newest{' '}
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Properties
                    </span>
                  </>
                )}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {isFeaturedMode
                  ? 'Hand-picked properties just for you'
                  : 'Fresh listings added recently'}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-purple-600 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0"
              onClick={() => router.push('/properties')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No properties available</p>
              <Button
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                onClick={() => router.push('/list-property')}
              >
                List Your Property
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProperties.map((property) => {
                const displayInfo = getCategoryDisplayInfo(property);
                const formattedPrice = getFormattedPrice(property);

                return (
                  <Card
                    key={property.id}
                    className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#0A0A0F] hover:-translate-y-1 cursor-pointer"
                    onClick={() => handlePropertyClick(property.id)}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden">
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                          <CategoryIcon category={property.category} />
                          {property.category}
                        </span>
                      </div>

                      {/* Listing Type Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            property.listing_type === 'Rent'
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              : property.listing_type === 'Sale'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                          }`}
                        >
                          {property.listing_type}
                        </span>
                      </div>

                      {/* Featured Badge */}
                      {property.featured && (
                        <div className="absolute top-3 right-20 z-10">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-purple-600 dark:fill-purple-400" />
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Verified Badge */}
                      {property.verified && (
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        </div>
                      )}

                      {/* Image */}
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}

                      {/* Fallback if no image */}
                      {(!property.images || property.images.length === 0) && (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-purple-300 dark:text-purple-600" />
                        </div>
                      )}

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to wishlist functionality
                          }}
                        >
                          <Heart className="h-5 w-5 text-white" />
                        </button>
                        <button
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property.id);
                          }}
                        >
                          <Eye className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {property.title}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}</span>
                      </div>

                      {/* Category-specific info */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {/* Bedrooms & Bathrooms (Residential/Mixed-Use) */}
                        {displayInfo.showBedrooms && displayInfo.primaryValue !== null && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" />
                            <span>{displayInfo.primaryValue}</span>
                          </div>
                        )}
                        {displayInfo.showBathrooms && displayInfo.secondaryValue !== null && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" />
                            <span>{displayInfo.secondaryValue}</span>
                          </div>
                        )}

                        {/* Size (all categories) */}
                        {displayInfo.sizeValue !== null && (
                          <div className="flex items-center gap-1">
                            <Square className="h-3.5 w-3.5" />
                            <span>
                              {displayInfo.sizeValue}
                              {displayInfo.sizeUnit && ` ${displayInfo.sizeUnit}`}
                            </span>
                          </div>
                        )}

                        {/* Land/Plot specific */}
                        {property.category === 'Land/Plot' && property.zoning && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {property.zoning}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formattedPrice}
                        </span>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity text-xs h-8 px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-12 sm:py-20 bg-gray-50/50 dark:bg-white/5 transition-colors duration-300">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 mb-4">
              <Sparkles className="h-3 w-3" />
              Simple Process
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              How It{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Find your dream home in three simple steps
            </p>
          </div>

          <div className="relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-teal-600/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative group flex">
                  <Card
                    className={`flex-1 flex flex-col relative overflow-hidden border-2 border-transparent ${step.border} transition-all duration-300 hover:shadow-xl bg-white dark:bg-[#0A0A0F]`}
                  >
                    <CardContent className="flex-1 flex flex-col items-center p-6 sm:p-8 text-center">
                      <div className="hidden md:block absolute -top-3 -right-2 text-5xl font-bold text-gray-100 dark:text-white/5 select-none">
                        {step.number}
                      </div>

                      <div className="relative">
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${step.iconBg} shadow-lg flex items-center justify-center mb-4 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <step.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div
                          className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${step.bg}`}
                        />
                      </div>

                      <div className="md:hidden text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">
                        Step {step.number}
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>

                      <p className="flex-1 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>

                      <div
                        className={`w-12 h-1 rounded-full bg-gradient-to-r ${step.color} mt-4 opacity-60 group-hover:opacity-100 transition-opacity`}
                      />
                    </CardContent>
                  </Card>

                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0A0A0F] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-md">
                        <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex md:hidden justify-center items-center gap-3 mt-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      index === 0
                        ? 'bg-purple-600'
                        : index === 1
                        ? 'bg-blue-600'
                        : 'bg-teal-600'
                    }`}
                  />
                  {index < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-gray-200 dark:bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by City Section */}
      <section className="px-4 py-12 sm:py-20 bg-white dark:bg-[#0A0A0F] transition-colors duration-300">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Browse by{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                City
              </span>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Find properties in Eswatini's most popular locations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city.name)}
                className="group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 p-4 sm:p-6 text-center transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all" />
                <div className="relative">
                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{city.image}</div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {city.properties} properties
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Button
              variant="outline"
              className="border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-purple-600 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => router.push('/properties')}
            >
              View All Cities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 sm:py-20 bg-gray-50/50 dark:bg-white/5 transition-colors duration-300">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Ekhaya
              </span>
            </h2>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Everything you need to find your dream home
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Listings',
                description: 'Every property is verified. No scams, no fake landlords.',
                bg: 'bg-purple-50 dark:bg-purple-500/10',
              },
              {
                icon: Zap,
                title: 'Smart Search',
                description: 'Filter by price, bedrooms, security, AC, and more.',
                bg: 'bg-blue-50 dark:bg-blue-500/10',
              },
              {
                icon: Heart,
                title: '1-Click WhatsApp',
                description: 'Chat with landlords instantly. Auto-share to Facebook Groups.',
                bg: 'bg-teal-50 dark:bg-teal-500/10',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-[#0A0A0F]"
              >
                <CardContent className="p-6 sm:p-8">
                  <div
                    className={`inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${feature.bg}`}
                  >
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-12 sm:py-20 bg-white dark:bg-[#0A0A0F] transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 dark:from-purple-600/10 dark:to-blue-600/10" />
        <div className="absolute top-0 left-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 dark:opacity-10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 mb-4">
            <Sparkles className="h-3 w-3" />
            List Your Property
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Ready to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              List Your Property
            </span>
            ?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Join hundreds of landlords already earning from their properties. List your home,
            apartment, or commercial space today.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              className="h-11 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 font-medium text-white hover:opacity-90 transition-opacity w-full sm:w-auto"
              onClick={() => router.push('/list-property')}
            >
              List Your Property
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 sm:h-12 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-purple-600 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-full sm:w-auto"
              onClick={() => router.push('/properties')}
            >
              Browse Properties
            </Button>
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            ✨ No hidden fees. Pay only when your property is listed.
          </p>
        </div>
      </section>
    </div>
  );
}
