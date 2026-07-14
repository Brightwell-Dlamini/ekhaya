// components/Header.tsx

"use client";

import { useState, useEffect } from "react";
import { Menu, X, Search, User, PlusCircle, LayoutDashboard, Moon, Sun, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  SignInButton, 
  SignUpButton, 
  UserButton,
  useClerk,
  useUser
} from "@clerk/nextjs";
import { useTheme } from "@/app/theme-provider";
import { getSavedPropertiesCount } from "@/lib/supabase/queries";

export default function Header() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Function to fetch wishlist count
  const fetchWishlistCount = async (forceRefresh = false) => {
    if (!user || !isSignedIn) {
      setWishlistCount(0);
      return;
    }

    // If it's not a force refresh and we already have a count, don't fetch again immediately
    if (!forceRefresh && wishlistCount !== null) {
      // But still fetch in background to keep it fresh
    }

    try {
      setIsLoadingCount(true);
      const count = await getSavedPropertiesCount(user.id);
      setWishlistCount(count);
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
      setWishlistCount(0);
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isSignedIn && user) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [isSignedIn, user]);

  // Listen for wishlist updates - this is the key fix
  useEffect(() => {
    // Custom event listener for wishlist updates
    const handleWishlistUpdate = (event: CustomEvent) => {
      const { action, propertyId } = event.detail || {};
      // If we have the user and we know an action happened, refresh the count
      if (user) {
        fetchWishlistCount(true);
      }
    };

    // Add event listener
    window.addEventListener('wishlistUpdated', handleWishlistUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate as EventListener);
    };
  }, [user]);

  // Also refresh when the page becomes visible again (user returns from another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchWishlistCount(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    setWishlistCount(0);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/20 transition-transform group-hover:scale-105">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Ekhaya
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/properties" 
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <Search className="h-4 w-4" />
            Explore
          </Link>
          <Link 
            href="/wishlist" 
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all relative"
            onClick={() => {
              // Refresh count when navigating to wishlist
              if (user) {
                fetchWishlistCount(true);
              }
            }}
          >
            <Heart className="h-4 w-4" />
            Saved
            {isSignedIn && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-[10px] font-bold text-white shadow-lg shadow-purple-500/25 animate-in fade-in zoom-in duration-200">
                {wishlistCount}
              </span>
            )}
            {isSignedIn && isLoadingCount && wishlistCount === 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
            )}
          </Link>
          <Link 
            href="/list-property" 
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            List Property
          </Link>
          {isSignedIn && (
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>
        
        {/* Desktop Auth & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/20">
                  Get Started
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>

        {/* Mobile Right Section */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            {isSignedIn && wishlistCount > 0 && !isMenuOpen && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-[8px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0A0A0F] border-b border-gray-100 dark:border-white/5 px-4 py-6 space-y-4 shadow-lg transition-colors duration-300">
          <Link 
            href="/properties" 
            className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <Search className="h-4 w-4" />
            Explore
          </Link>
          <Link 
            href="/wishlist" 
            className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
            onClick={() => {
              setIsMenuOpen(false);
              if (user) {
                fetchWishlistCount(true);
              }
            }}
          >
            <Heart className="h-4 w-4" />
            Saved
            {isSignedIn && wishlistCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link 
            href="/list-property" 
            className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <PlusCircle className="h-4 w-4" />
            List Property
          </Link>
          {isSignedIn && (
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          
          <hr className="border-gray-100 dark:border-white/5" />
          
          {/* Mobile Auth */}
          {!isSignedIn ? (
            <div className="space-y-3">
              <SignInButton mode="modal">
                <button 
                  className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button 
                  className="w-full text-center text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </button>
              </SignUpButton>
            </div>
          ) : (
            <>
              <button 
                onClick={handleSignOut}
                className="w-full text-left text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
