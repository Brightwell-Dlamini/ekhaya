// app/properties/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Check,
  ArrowLeft,
  Calendar,
  Sparkles,
  Shield,
  Award,
  Clock,
  User,
  Mail,
  ChevronRight,
  Loader2,
  LandPlot,
  Store,
  Sprout,
  Building2,
  Home,
  Ruler,
  Car,
  Zap,
  Droplets,
  Fence,
  Trees,
  Sun,
  Flame,
  Snowflake,
  Wifi,
  ParkingCircle,
  ChevronLeft,

  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  getPropertyById, 
  incrementPropertyViews,
  isPropertySaved,
  saveProperty,
  unsaveProperty,
} from '@/lib/supabase/queries';
import { Property, getCategoryDisplayInfo, getFormattedPrice } from '@/lib/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================
// Helper Components
// ============================================================

const CategoryIcon = ({ category, className = '' }: { category: Property['category']; className?: string }) => {
  switch (category) {
    case 'Residential':
      return <Home className={className} />;
    case 'Land/Plot':
      return <LandPlot className={className} />;
    case 'Commercial':
      return <Store className={className} />;
    case 'Agricultural':
      return <Sprout className={className} />;
    case 'Mixed-Use':
      return <Building2 className={className} />;
    default:
      return <Building2 className={className} />;
  }
};

// Feature icon mapping
const getFeatureIcon = (feature: string) => {
  const iconMap: Record<string, any> = {
    WiFi: Wifi,
    Parking: ParkingCircle,
    Security: Shield,
    Garden: Trees,
    Pool: Droplets,
    'Air Conditioning': Sun,
    'Backup Power': Flame,
    Furnished: Snowflake,
    'Pet Friendly': Heart,
    Balcony: Building2,
    Fenced: Fence,
    'Water Source': Droplets,
    Electricity: Zap,
    'Road Access': Car,
    'Trees/Vegetation': Trees,
    Cultivated: Sprout,
    'Three Phase Power': Zap,
    'Office WiFi': Wifi,
    Storefront: Store,
    Irrigation: Droplets,
  };
  return iconMap[feature] || Sparkles;
};

// ============================================================
// Image Gallery Component
// ============================================================

function ImageGallery({ images, alt = 'Property image' }: { images: string[]; alt?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const validImages = images.length > 0 ? images : ['https://placehold.co/800x500/e2e8f0/1e293b?text=No+Image'];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    setIsLoading(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, isFullscreen]);

  // Auto-play
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && validImages.length > 1) {
      interval = setInterval(goToNext, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, validImages.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setIsZoomed(false);
    }
  };

  const toggleZoom = () => setIsZoomed(!isZoomed);
  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) setIsZoomed(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // If only one image, show it without controls
  if (validImages.length === 1) {
    return (
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={validImages[0]}
          alt={alt}
          className="w-full h-full object-cover max-h-[600px]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/e2e8f0/1e293b?text=No+Image';
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main Image */}
      <div
        className={cn(
          'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
          isFullscreen && 'rounded-none h-screen'
        )}
        style={{ aspectRatio: isFullscreen ? 'auto' : '16/10' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={validImages[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className={cn(
              'w-full h-full object-contain transition-all duration-300',
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            onClick={toggleZoom}
          />
        </AnimatePresence>

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {validImages.length}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleAutoPlay}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg text-xs"
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={toggleZoom}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = validImages[currentIndex];
              link.download = `image-${currentIndex + 1}.jpg`;
              link.click();
            }}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-play progress bar */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: 5,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {validImages.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsLoading(true);
            }}
            className={cn(
              'relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all duration-200',
              currentIndex === index
                ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/25'
                : 'opacity-60 hover:opacity-100'
            )}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x80/e2e8f0/1e293b?text=No+Image';
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlist, setIsWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const id = params.id as string;

  // Check if property is saved
  useEffect(() => {
    if (user && property) {
      const checkSaved = async () => {
        try {
          const saved = await isPropertySaved(user.id, property.id);
          setIsWishlist(saved);
        } catch (err) {
          console.error('Error checking wishlist status:', err);
        }
      };
      checkSaved();
    }
  }, [user, property]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(id);
        setProperty(data);

        // Increment view count
        await incrementPropertyViews(id);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const toggleWishlist = async () => {
    if (!user) {
      const signInEvent = new CustomEvent('clerk:openSignIn');
      window.dispatchEvent(signInEvent);
      return;
    }
    if (!property) return;

    setIsTogglingWishlist(true);
    try {
      if (isWishlist) {
        await unsaveProperty(user.id, property.id);
        setIsWishlist(false);
        const event = new CustomEvent('wishlistUpdated', {
          detail: { action: 'remove', propertyId: property.id }
        });
        window.dispatchEvent(event);
      } else {
        await saveProperty(user.id, property.id);
        setIsWishlist(true);
        const event = new CustomEvent('wishlistUpdated', {
          detail: { action: 'add', propertyId: property.id }
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 blur-3xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-12 shadow-2xl">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Loading Property...
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Please wait while we fetch the details
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 blur-3xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-12 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Property Not Found
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {error || "The property you're looking for doesn't exist."}
              </p>
              <Button
                onClick={() => router.push('/properties')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 shadow-lg shadow-emerald-500/25"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare images array
  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://placehold.co/800x500/e2e8f0/1e293b?text=No+Image'];

  // Get display info
  const displayInfo = getCategoryDisplayInfo(property);
  const formattedPrice = getFormattedPrice(property);

  // Get features with icons
  const featuresWithIcons = (property.features || []).map((feature) => ({
    label: feature,
    icon: getFeatureIcon(feature),
  }));

  // Get contact initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render category-specific details
  const renderCategoryDetails = () => {
    switch (property.category) {
      case 'Residential':
      case 'Mixed-Use':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                <Bed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.bedrooms || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bedrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40">
                <Bath className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.bathrooms || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bathrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40">
                <Square className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.floor_area || 0}m²
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Floor Area</div>
              </div>
            </div>
          </div>
        );

      case 'Land/Plot':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                <Ruler className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.land_size_hectares
                    ? `${property.land_size_hectares} ha`
                    : property.land_size_m2
                    ? `${property.land_size_m2} m²`
                    : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Land Size</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.zoning || 'Not specified'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Zoning</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 col-span-2 sm:col-span-1">
              {property.road_access && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-xl">
                  <Car className="w-3.5 h-3.5" />
                  Road Access
                </span>
              )}
              {property.fenced && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl">
                  <Fence className="w-3.5 h-3.5" />
                  Fenced
                </span>
              )}
              {property.electricity && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-xl">
                  <Zap className="w-3.5 h-3.5" />
                  Electricity
                </span>
              )}
              {property.water_source && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1.5 rounded-xl">
                  <Droplets className="w-3.5 h-3.5" />
                  {property.water_source}
                </span>
              )}
            </div>
          </div>
        );

      case 'Commercial':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40">
                <Square className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.floor_space || 0}m²
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Floor Space</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40">
                <Car className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.parking_spaces || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Parking Spaces</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 col-span-2 sm:col-span-1">
              {property.power_supply && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-xl">
                  <Zap className="w-3.5 h-3.5" />
                  {property.power_supply}
                </span>
              )}
              {property.storefront && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-xl">
                  <Store className="w-3.5 h-3.5" />
                  Storefront
                </span>
              )}
            </div>
          </div>
        );

      case 'Agricultural':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-green-50 dark:bg-green-950/40">
                <Ruler className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {property.land_size_hectares
                    ? `${property.land_size_hectares} ha`
                    : property.land_size_m2
                    ? `${property.land_size_m2} m²`
                    : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Land Size</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 col-span-2 sm:col-span-2">
              {property.road_access && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-xl">
                  <Car className="w-3.5 h-3.5" />
                  Road Access
                </span>
              )}
              {property.fenced && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl">
                  <Fence className="w-3.5 h-3.5" />
                  Fenced
                </span>
              )}
              {property.electricity && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-xl">
                  <Zap className="w-3.5 h-3.5" />
                  Electricity
                </span>
              )}
              {property.irrigation && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-xl">
                  <Droplets className="w-3.5 h-3.5" />
                  Irrigation
                </span>
              )}
              {property.water_source && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1.5 rounded-xl">
                  <Droplets className="w-3.5 h-3.5" />
                  {property.water_source}
                </span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              disabled={isTogglingWishlist}
              className="p-2.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isTogglingWishlist ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              ) : (
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    isWishlist
                      ? 'fill-rose-500 text-rose-500 scale-110'
                      : 'text-gray-600 dark:text-gray-400 hover:text-rose-500'
                  }`}
                />
              )}
            </button>
            <button className="p-2.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/30 p-4">
              <ImageGallery images={images} alt={property.title} />
            </div>

            {/* Property Info Card */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span>{property.location}</span>
                    </div>
                    {property.sub_category && (
                      <div className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                        {property.sub_category}
                      </div>
                    )}
                  </div>
                  <div className="text-right sm:text-left">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {formattedPrice}
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {property.listing_type}
                    </div>
                  </div>
                </div>

                {/* Specs Grid - Category Specific */}
                <div className="py-5 border-y border-gray-200/50 dark:border-gray-800/50 mb-6">
                  {renderCategoryDetails()}
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Description
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Features & Amenities */}
                {featuresWithIcons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Features & Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {featuresWithIcons.map(({ label, icon: Icon }) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <Icon className="w-3.5 h-3.5 text-emerald-500" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {property.availability && (
                  <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Available:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {property.availability}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                    {getInitials(property.contact_name || 'User')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {property.contact_name || 'Contact'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      {property.verified ? 'Verified Landlord' : 'Property Owner'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {property.contact_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                        <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Phone</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {property.contact_phone}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.contact_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                        <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Email</div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {property.contact_email}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {property.contact_phone && (
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl py-6 shadow-lg shadow-emerald-500/25 gap-2.5"
                      onClick={() => (window.location.href = `tel:${property.contact_phone}`)}
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </Button>
                  )}
                  {property.contact_phone && (
                    <Button
                      className="w-full bg-[#25D366] hover:bg-[#1da851] text-white rounded-2xl py-6 shadow-lg shadow-[#25D366]/25 gap-2.5"
                      onClick={() =>
                        window.open(
                          `https://wa.me/${property.contact_phone.replace(/[^0-9]/g, '')}`,
                          '_blank'
                        )
                      }
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  )}
                  {property.contact_email && (
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl py-6 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 gap-2.5"
                      onClick={() => (window.location.href = `mailto:${property.contact_email}`)}
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-1.5">
                  {[
                    { icon: '📅', label: 'Schedule Viewing' },
                    { icon: '❤️', label: 'Save Property' },
                    { icon: '📋', label: 'Request More Info' },
                    { icon: '🏠', label: 'Similar Properties' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="group w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{action.icon}</span>
                        {action.label}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust Badge */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/30 dark:to-cyan-950/30 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/30 rounded-3xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Protected by Ekhaya
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All verified listings are guaranteed against scams and fraud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
