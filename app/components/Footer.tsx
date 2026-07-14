// components/Footer.tsx
"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/theme-provider";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="bg-white dark:bg-[#0A0A0F] border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Section */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Ekhaya</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              The trusted property platform for Eswatini. Find your perfect home today.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold">
                X
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold">
                f
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold">
                in
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold">
                yt
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">For Users</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Search Properties</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">List With Us</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/list-property" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">List Property</Link></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Agent Dashboard</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Resources</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Get the latest properties in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 rounded-lg border-0 bg-gray-100 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
              />
              <button className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 text-white hover:opacity-90 transition-opacity shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500 dark:text-gray-500 text-center md:text-left">
            © 2026 Ekhaya. Built for Eswatini. 🇸🇿
          </p>
          <div className="flex gap-6 text-gray-500 dark:text-gray-500">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
