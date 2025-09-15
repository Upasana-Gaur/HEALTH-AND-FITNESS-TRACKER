import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export const MoodTracker = ({ mood = {}, onChange }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved mood data on component mount
  useEffect(() => {
    const loadMoodData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Please log in to track your mood');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const moodDoc = await getDoc(doc(db, 'users', user.uid, 'moods', today));

        if (moodDoc.exists()) {
          const data = moodDoc.data();
          onChange({
            morning: data.morning || 0,
            afternoon: data.afternoon || 0,
            evening: data.evening || 0
          });
        }
      } catch (err) {
        console.error('Error loading mood data:', err);
        setError('Failed to load mood data');
      } finally {
        setLoading(false);
      }
    };

    loadMoodData();
  }, []);

  const saveMoodData = async (updatedMood) => {
    setSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      // Save to daily moods
      await setDoc(doc(db, 'users', user.uid, 'moods', today), {
        ...updatedMood,
        timestamp: new Date().toISOString()
      }, { merge: true });

      // Save to mood history for tracking
      await setDoc(doc(db, 'moodHistory', `${user.uid}_${today}`), {
        userId: user.uid,
        date: today,
        moods: updatedMood,
        timestamp: new Date().toISOString()
      });

      onChange(updatedMood);
    } catch (err) {
      console.error('Error saving mood:', err);
      setError('Failed to save mood');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleMoodChange = async (timeOfDay, moodIndex) => {
    try {
      const updatedMood = {
        ...mood,
        [timeOfDay]: moodIndex + 1
      };
      await saveMoodData(updatedMood);
    } catch (err) {
      // Error is already handled in saveMoodData
      console.error('Error in handleMoodChange:', err);
    }
  };

  const moods = [
    { emoji: '😢', label: 'Very Sad', description: 'Feeling down and unmotivated' },
    { emoji: '😕', label: 'Sad', description: 'Not feeling great' },
    { emoji: '😐', label: 'Neutral', description: 'Neither good nor bad' },
    { emoji: '🙂', label: 'Happy', description: 'Feeling good' },
    { emoji: '😊', label: 'Very Happy', description: 'Feeling great and energetic' }
  ];

  const timeSlots = {
    morning: 'How did you feel when you woke up?',
    afternoon: 'How was your day going?',
    evening: 'How do you feel as the day ends?'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading mood data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(timeSlots).map(([timeOfDay, prompt]) => (
        <div key={timeOfDay} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {timeOfDay}
            </label>
            <p className="text-sm text-gray-500">{prompt}</p>
            <div className="flex justify-between items-center">
              {moods.map((moodOption, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodChange(timeOfDay, index)}
                  className={`p-3 rounded-full transition-all ${
                    mood[timeOfDay] === index + 1
                      ? 'bg-blue-100 scale-110'
                      : 'hover:bg-gray-100'
                  }`}
                  title={moodOption.label}
                >
                  <span className="text-2xl">{moodOption.emoji}</span>
                  <span className="sr-only">{moodOption.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {saving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 p-3 rounded-md text-sm text-center">
          Saving your mood...
        </div>
      )}
    </div>
  );
};