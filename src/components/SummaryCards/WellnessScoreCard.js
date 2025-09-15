import React from 'react';
import { format } from 'date-fns';

export const WellnessScoreCard = ({ data }) => {

  const getMoodEmoji = (moodValue) => {
    const moods = {
      1: '😢',
      2: '😕',
      3: '😐',
      4: '🙂',
      5: '😊'
    };
    return moods[moodValue] || '❓';
  };

  const getMoodLabel = (moodValue) => {
    const labels = {
      1: 'Very Sad',
      2: 'Sad',
      3: 'Neutral',
      4: 'Happy',
      5: 'Very Happy'
    };
    return labels[moodValue] || 'Not recorded';
  };

  const calculateAverageMood = (moods) => {
    if (!moods) return null;
    const values = Object.values(moods).filter(v => v > 0);
    if (values.length === 0) return null;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const averageMood = calculateAverageMood(data?.mood);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Wellness Score</h3>
      
      <div className="space-y-6">
        {/* Mood Section */}
        {data?.mood && Object.keys(data.mood).length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Daily Mood</h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(data.mood).map(([timeOfDay, value]) => value > 0 && (
                <div key={timeOfDay} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 capitalize">{timeOfDay}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getMoodEmoji(value)}</span>
                    <span className="text-sm text-gray-600">{getMoodLabel(value)}</span>
                  </div>
                </div>
              ))}
            </div>
            {averageMood && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600">Daily Average</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getMoodEmoji(Math.round(averageMood))}</span>
                  <span className="text-sm font-medium text-blue-700">{averageMood}</span>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Last Updated */}
        <div className="text-xs text-gray-500 space-y-1">
          {data?.mood?.timestamp && (
            <div>
              Mood updated: {format(new Date(data.mood.timestamp), 'MMM d, yyyy HH:mm')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};