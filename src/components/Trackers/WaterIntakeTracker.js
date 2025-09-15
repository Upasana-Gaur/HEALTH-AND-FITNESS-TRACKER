import React, { useState } from 'react';

export const WaterIntakeTracker = ({ value, onChange, target }) => {
  const percentage = Math.min((value / target) * 100, 100);
  const glassSize = 250; // Size of one glass in ml

  const handleAddWater = (amount) => {
    const newIntake = Math.min(value + amount, target);
    onChange(newIntake);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Intake</h3>
      
      {/* Visual Progress */}
      <div className="relative h-40 w-24 mx-auto mb-6">
        <div className="absolute inset-0 border-2 border-blue-200 rounded-lg overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-blue-400/30 transition-all duration-500"
            style={{ height: `${percentage}%` }}
          />
          <div className="absolute inset-0 grid grid-rows-5 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-blue-200" />
            ))}
          </div>
        </div>
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 space-y-1">
          <div>{target}ml</div>
          <div>{target - 500}ml</div>
          <div>{target - 1000}ml</div>
          <div>{target - 1500}ml</div>
          <div>{target - 2000}ml</div>
        </div>
      </div>

      {/* Current Intake Display */}
      <div className="text-center mb-6">
        <span className="text-3xl font-bold text-blue-600">{value}</span>
        <span className="text-gray-600 ml-1">/ {target}ml</span>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleAddWater(glassSize)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            +
          </button>
          <button
            onClick={() => handleAddWater(-glassSize)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            -
          </button>
        </div>
        <p className="text-center text-sm text-gray-500">
          One glass = {glassSize}ml
        </p>
      </div>

      {/* Reminders */}
      {value < target && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            You still need {(target - value)}ml to reach your daily goal
          </p>
        </div>
      )}
    </div>
  );
};