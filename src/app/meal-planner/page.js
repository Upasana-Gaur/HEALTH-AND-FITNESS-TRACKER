'use client';

import MealPlanner from '@/components/MealPlanner';

export default function MealPlannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Meal Planner
        </h1>
        <MealPlanner />
      </div>
    </div>
  );
}