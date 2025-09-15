'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu({ onLogout, isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg py-2 px-4 space-y-2 transform transition-all duration-200">
          <Link 
            href="/" 
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/profile"
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link 
            href="/daily-input"
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Daily Log
          </Link>
          <Link 
            href="/dashboard"
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/workout-planner"
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Workouts
          </Link>
          <Link 
            href="/meal-planner"
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Meal Plans
          </Link>
          <Link 
            href="/about"
            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          
          {isLoggedIn ? (
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full py-2 mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login"
              className="block w-full py-2 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg text-center transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
}