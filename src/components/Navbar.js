'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This will ensure the component only renders on the client side
    setMounted(true);

    // Set user state based on Firebase auth state
    const unsubscribe = auth.onAuthStateChanged(setUser);
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!mounted) {
    return null; // Prevent rendering on SSR
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-gray-800">
              Health Tracker
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/profile" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Profile
            </Link>
            <Link 
              href="/daily-input" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Daily Log
            </Link>
            <Link 
              href="/dashboard" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link 
              href="/workout" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Workouts
            </Link>
            <Link 
              href="/meal-planner" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Meal Plans
            </Link>
            <Link 
              href="/about" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              About
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="ml-6 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login">
                <button className="ml-6 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors duration-200">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
