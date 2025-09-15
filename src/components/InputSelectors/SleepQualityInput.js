import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export const SleepQualityInput = ({ sleep, onChange }) => {
  const [duration, setDuration] = useState('');

  const qualityOptions = [
    { value: 1, label: 'Poor', description: 'Frequent disruptions, didn\'t feel rested' },
    { value: 2, label: 'Fair', description: 'Some disruptions, slightly rested' },
    { value: 3, label: 'Good', description: 'Few disruptions, mostly rested' },
    { value: 4, label: 'Very Good', description: 'Minimal disruptions, well rested' },
    { value: 5, label: 'Excellent', description: 'Uninterrupted sleep, fully refreshed' }
  ];

  const factors = [
    'Stress',
    'Caffeine',
    'Screen Time',
    'Exercise',
    'Late Meal',
    'Noise',
    'Temperature',
    'Other'
  ];

  useEffect(() => {
    if (sleep.sleepStart && sleep.sleepEnd) {
      const start = new Date(`2000/01/01 ${sleep.sleepStart}`);
      const end = new Date(`2000/01/01 ${sleep.sleepEnd}`);
      
      // Handle sleep past midnight
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      const diff = (end - start) / (1000 * 60); // Duration in minutes
      const hours = Math.floor(diff / 60);
      const minutes = Math.round(diff % 60);
      setDuration(`${hours}h ${minutes}m`);
    }
  }, [sleep.sleepStart, sleep.sleepEnd]);

  const saveSleepData = async (sleepData) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const sleepRef = doc(db, 'users', user.uid, 'sleep', today);

      await setDoc(sleepRef, {
        ...sleepData,
        timestamp: new Date().toISOString(),
      }, { merge: true });

      // Also save to sleep history collection for tracking
      const historyRef = doc(db, 'sleepHistory', `${user.uid}_${today}`);
      await setDoc(historyRef, {
        userId: user.uid,
        date: today,
        sleepStart: sleepData.sleepStart,
        sleepEnd: sleepData.sleepEnd,
        duration: duration,
        quality: sleepData.quality,
        factors: sleepData.factors || [],
        notes: sleepData.notes || '',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving sleep data:', error);
    }
  };

  // Add useEffect to load saved sleep data
  useEffect(() => {
    const loadSleepData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const sleepRef = doc(db, 'users', user.uid, 'sleep', today);
        const sleepDoc = await getDoc(sleepRef);

        if (sleepDoc.exists()) {
          const data = sleepDoc.data();
          onChange({
            sleepStart: data.sleepStart || '',
            sleepEnd: data.sleepEnd || '',
            quality: data.quality || 0,
            factors: data.factors || [],
            notes: data.notes || '',
          });
        }
      } catch (error) {
        console.error('Error loading sleep data:', error);
      }
    };

    loadSleepData();
  }, []);

  // Modify the handleSleepChange function
  const handleSleepChange = async (updatedSleep) => {
    try {
      onChange(updatedSleep);
      await saveSleepData(updatedSleep);
      console.log('Sleep data saved successfully:', updatedSleep); // Debug log
    } catch (error) {
      console.error('Error in handleSleepChange:', error);
    }
  };

  // Add this helper function at the top of your component
  const getSleepRecommendations = (sleepData) => {
    const recommendations = [];
    
    // Duration-based recommendations
    if (duration) {
      const [hours] = duration.split('h');
      if (parseInt(hours) < 7) {
        recommendations.push('Try to get at least 7-9 hours of sleep for optimal health');
      }
    }

    // Factor-based recommendations
    if (sleep.factors?.includes('Caffeine')) {
      recommendations.push('Avoid caffeine at least 6 hours before bedtime');
    }
    if (sleep.factors?.includes('Screen Time')) {
      recommendations.push('Consider using blue light filters and avoiding screens 1 hour before bed');
    }
    if (sleep.factors?.includes('Stress')) {
      recommendations.push('Try meditation or deep breathing exercises before bed');
    }
    if (sleep.factors?.includes('Exercise')) {
      recommendations.push('Complete intense workouts at least 2-3 hours before bedtime');
    }
    if (sleep.factors?.includes('Late Meal')) {
      recommendations.push('Try to eat dinner at least 3 hours before sleeping');
    }
    if (sleep.factors?.includes('Noise')) {
      recommendations.push('Consider using earplugs or white noise machine');
    }
    if (sleep.factors?.includes('Temperature')) {
      recommendations.push('Keep bedroom temperature between 60-67°F (15-19°C)');
    }

    return recommendations;
  };

  return (
    <div className="space-y-6">
      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sleep Start
          </label>
          <input
            type="time"
            value={sleep.sleepStart}
            onChange={(e) => handleSleepChange({ ...sleep, sleepStart: e.target.value })}
            className="mt-1 rounded-md border-gray-300 shadow-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sleep End
          </label>
          <input
            type="time"
            value={sleep.sleepEnd}
            onChange={(e) => handleSleepChange({ ...sleep, sleepEnd: e.target.value })}
            className="mt-1 rounded-md border-gray-300 shadow-sm w-full"
          />
        </div>
      </div>

      {/* Duration display */}
      {duration && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 text-sm font-medium">
            Total Sleep Duration: {duration}
          </p>
        </div>
      )}

      {/* Quality rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sleep Quality
        </label>
        <div className="grid grid-cols-5 gap-2">
          {qualityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSleepChange({ ...sleep, quality: option.value })}
              className={`p-2 rounded-md text-center ${
                sleep.quality === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Affecting factors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Factors Affecting Sleep
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {factors.map((factor) => (
            <button
              key={factor}
              onClick={() => {
                const currentFactors = sleep.factors || [];
                const updatedFactors = currentFactors.includes(factor)
                  ? currentFactors.filter(f => f !== factor)
                  : [...currentFactors, factor];
                handleSleepChange({ ...sleep, factors: updatedFactors });
              }}
              className={`p-2 rounded-md text-sm ${
                sleep.factors?.includes(factor)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {factor}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sleep Notes
        </label>
        <textarea
          value={sleep.notes || ''}
          onChange={(e) => handleSleepChange({ ...sleep, notes: e.target.value })}
          onBlur={(e) => handleSleepChange({ ...sleep, notes: e.target.value })}
          placeholder="Any additional notes about your sleep..."
          className="w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>

      {/* Sleep Summary and Recommendations */}
      {(sleep.sleepStart || sleep.sleepEnd || sleep.quality || sleep.factors?.length > 0) && (
        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sleep Summary</h3>
            <div className="space-y-2">
              {duration && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {duration}
                </p>
              )}
              {sleep.quality > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Quality:</span> {qualityOptions.find(opt => opt.value === sleep.quality)?.label}
                </p>
              )}
              {sleep.factors?.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Affecting Factors:</span> {sleep.factors.join(', ')}
                </p>
              )}
              {sleep.notes && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {sleep.notes}
                </p>
              )}
            </div>
          </div>

          {sleep.factors?.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {getSleepRecommendations(sleep).map((rec, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};