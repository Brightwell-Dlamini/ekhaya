// app/list-property/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  Home,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createProperty } from '@/lib/supabase/queries';
import { PropertyFormData, propertyFormSchema } from './types';
import { StepDetails, StepFeatures, StepContact } from './form-steps';
import { cn } from '@/lib/utils';

// ============================================================
// Default Values
// ============================================================

const defaultValues: PropertyFormData = {
  title: '',
  category: 'Residential',
  sub_category: '',
  listing_type: 'Rent',
  price_amount: 0,
  price_period: 'month',
  location: '',
  description: '',
  bedrooms: null,
  bathrooms: null,
  floor_area: null,
  land_size_hectares: null,
  land_size_m2: null,
  zoning: null,
  road_access: false,
  fenced: false,
  water_source: null,
  electricity: false,
  irrigation: false,
  floor_space: null,
  parking_spaces: null,
  power_supply: null,
  storefront: false,
  features: [],
  images: [],
  imagePreviews: [],
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  availability: 'Available Now',
};

// ============================================================
// Step Configuration
// ============================================================

const stepData = [
  { number: 1, label: 'Details', icon: Home },
  { number: 2, label: 'Features', icon: Sparkles },
  { number: 3, label: 'Contact', icon: Home },
];

// ============================================================
// Draft Helpers
// ============================================================

const saveDraft = (data: Partial<PropertyFormData>) => {
  try {
    const { images, imagePreviews, ...draftData } = data;
    localStorage.setItem('propertyDraft', JSON.stringify(draftData));
  } catch (e) {
    // Ignore storage errors
  }
};

const loadDraft = (): Partial<PropertyFormData> | null => {
  try {
    const draft = localStorage.getItem('propertyDraft');
    if (draft) {
      return JSON.parse(draft);
    }
  } catch (e) {
    // Ignore
  }
  return null;
};

// ============================================================
// Main Component
// ============================================================

export default function ListPropertyPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, watch, setValue, formState } = form;
  const { errors, isValid, isDirty } = formState;

  // Load draft on mount
  useEffect(() => {
    if (!isDraftLoaded && isSignedIn && user) {
      const draft = loadDraft();
      if (draft) {
        const merged = { ...defaultValues, ...draft };
        Object.entries(merged).forEach(([key, value]) => {
          setValue(key as keyof PropertyFormData, value as any);
        });
        setValue('images', []);
        setValue('imagePreviews', []);
        setIsDraftLoaded(true);
      }
    }
  }, [isDraftLoaded, setValue, user, isSignedIn]);

  // Auto-save draft
  useEffect(() => {
    if (isDraftLoaded && isDirty && isSignedIn) {
      const subscription = watch((data) => {
        saveDraft(data);
      });
      return () => subscription.unsubscribe();
    }
  }, [isDraftLoaded, isDirty, watch, isSignedIn]);

  // ============================================================
  // Submit Handler
  // ============================================================

  const onSubmit = async (data: PropertyFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Build property data for database
      const propertyData = {
        user_id: user.id,
        title: data.title.trim(),
        category: data.category,
        sub_category: data.sub_category || null,
        listing_type: data.listing_type,
        price_amount: data.price_amount,
        price_period: data.price_period,
        location: data.location.trim(),
        description: data.description.trim(),
        features: data.features || [],
        images:
          data.imagePreviews.length > 0
            ? data.imagePreviews
            : ['https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image'],
        contact_name: data.contact_name.trim(),
        contact_phone: data.contact_phone.trim(),
        contact_email: data.contact_email.trim(),
        availability: data.availability || 'Available Now',
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        floor_area: data.floor_area ?? null,
        land_size_hectares: data.land_size_hectares ?? null,
        land_size_m2: data.land_size_m2 ?? null,
        zoning: data.zoning || null,
        road_access: data.road_access ?? false,
        fenced: data.fenced ?? false,
        water_source: data.water_source || null,
        electricity: data.electricity ?? false,
        irrigation: data.irrigation ?? false,
        floor_space: data.floor_space ?? null,
        parking_spaces: data.parking_spaces ?? null,
        power_supply: data.power_supply || null,
        storefront: data.storefront ?? false,
      };

      const result = await createProperty(propertyData);

      if (!result) {
        throw new Error('Failed to create property - no response from server');
      }

      localStorage.removeItem('propertyDraft');
      router.push('/dashboard?success=true');
    } catch (err) {
      console.error('Error creating property:', err);
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create property. Please try again.'
      );
      document.querySelector('.error-message')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // Navigation Helpers
  // ============================================================

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canProceed = useCallback(() => {
    const errorsKeys = Object.keys(errors);

    if (step === 1) {
      const requiredFields = [
        'title',
        'category',
        'sub_category',
        'listing_type',
        'price_amount',
        'location',
        'description',
      ];
      const hasErrors = requiredFields.some((field) => errorsKeys.includes(field));

      if (hasErrors) return false;

      const category = watch('category');
      if (category === 'Residential' || category === 'Mixed-Use') {
        const bedrooms = watch('bedrooms');
        const bathrooms = watch('bathrooms');
        return (
          bedrooms !== null && bedrooms !== undefined && bedrooms >= 0 &&
          bathrooms !== null && bathrooms !== undefined && bathrooms >= 0
        );
      }
      if (category === 'Land/Plot' || category === 'Agricultural') {
        const landSize = watch('land_size_hectares');
        const landSizeM2 = watch('land_size_m2');
        return !!(landSize && landSize > 0) || !!(landSizeM2 && landSizeM2 > 0);
      }
      if (category === 'Commercial') {
        const floorSpace = watch('floor_space');
        return !!(floorSpace && floorSpace > 0);
      }
      return true;
    }

    if (step === 2) {
      const hasImages = (watch('images') || []).length > 0;
      const hasFeatures = (watch('features') || []).length > 0;
      return hasImages && hasFeatures;
    }

    if (step === 3) {
      const contactFields = ['contact_name', 'contact_phone', 'contact_email'];
      const hasErrors = contactFields.some((field) => errorsKeys.includes(field));
      return (
        !hasErrors &&
        !!watch('contact_name')?.trim() &&
        !!watch('contact_phone')?.trim() &&
        !!watch('contact_email')?.trim()
      );
    }

    return true;
  }, [step, errors, watch]);

  // ============================================================
  // Auth Loading
  // ============================================================

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-emerald-400 dark:text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Sign in to list your property
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Join hundreds of landlords already earning from their properties in Eswatini.
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

  // ============================================================
  // Render
  // ============================================================

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/80 dark:bg-emerald-900/30 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              List Your Property
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              Share Your Space with{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Eswatini
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Reach thousands of potential tenants and buyers in just a few clicks
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="error-message mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl animate-in slide-in-from-top duration-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-600 dark:text-red-400 text-sm">
                  <strong>Error:</strong> {submitError}
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="hidden md:flex justify-center mb-10">
            <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl p-3 shadow-xl shadow-black/5 dark:shadow-black/30">
              {stepData.map((s, idx) => (
                <div key={s.number} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(s.number)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300',
                      step >= s.number
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
                        step > s.number
                          ? 'bg-white/20'
                          : step === s.number
                          ? 'bg-white/20'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    >
                      {step > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
                    </div>
                    <span className="font-medium">{s.label}</span>
                  </button>
                  {idx < stepData.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl px-4 py-2 shadow-xl">
              {stepData.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => goToStep(s.number)}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                    step >= s.number
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  )}
                >
                  {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                </button>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl">
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="p-6 sm:p-8 lg:p-10"
                >
                  {step === 1 && <StepDetails form={form} isSubmitting={isSubmitting} />}
                  {step === 2 && <StepFeatures form={form} isSubmitting={isSubmitting} />}
                  {step === 3 && <StepContact form={form} isSubmitting={isSubmitting} />}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row px-6 sm:px-8 lg:px-10 py-5 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700/50 justify-between items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep(step - 1)}
                  className={cn(
                    'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 rounded-2xl transition-all w-full sm:w-auto',
                    step === 1 && 'invisible'
                  )}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 rounded-2xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                    disabled={!canProceed() || isSubmitting}
                    onClick={() => goToStep(step + 1)}
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 rounded-2xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                    disabled={!canProceed() || isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Listing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        List Property
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 pb-4 md:pb-0">
            By listing, you agree to Ekhaya's Terms of Service
          </p>
        </div>
      </div>
    </FormProvider>
  );
}
