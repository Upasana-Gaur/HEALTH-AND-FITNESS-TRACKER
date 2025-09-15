"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const WGER_API_URL = 'https://wger.de/api/v2/exercise';

const workoutPlans = {
  'weight-loss': {
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'HIIT + Lower Body',
        exercises: [
          { name: 'HIIT Cardio', duration: '20 mins' },
          { name: 'Squats', sets: '4x12' },
          { name: 'Lunges', sets: '3x15' },
          { name: 'Leg Press', sets: '3x12' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Upper Body + Core',
        exercises: [
          { name: 'Push-ups', sets: '3x12' },
          { name: 'Dumbbell Rows', sets: '3x12' },
          { name: 'Planks', duration: '3x45s' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Cardio + Flexibility',
        exercises: [
          { name: 'Running', duration: '30 mins' },
          { name: 'Stretching', duration: '15 mins' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Full Body Circuit',
        exercises: [
          { name: 'Burpees', sets: '3x10' },
          { name: 'Mountain Climbers', duration: '3x30s' },
          { name: 'Jump Rope', duration: '10 mins' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Strength + HIIT',
        exercises: [
          { name: 'Deadlifts', sets: '4x10' },
          { name: 'Box Jumps', sets: '3x12' },
          { name: 'HIIT Intervals', duration: '15 mins' }
        ]
      }
    ],
    tips: [
      'Keep rest periods short (30-60 seconds)',
      'Focus on compound movements',
      'Add cardio after strength training',
      'Stay hydrated throughout workouts',
      'Maintain a caloric deficit',
      'Get adequate protein intake'
    ]
  },
  'weight-gain': {
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Chest + Triceps',
        exercises: [
          { name: 'Bench Press', sets: '5x5' },
          { name: 'Incline Dumbbell Press', sets: '4x8' },
          { name: 'Tricep Extensions', sets: '3x12' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Back + Biceps',
        exercises: [
          { name: 'Deadlifts', sets: '5x5' },
          { name: 'Barbell Rows', sets: '4x8' },
          { name: 'Chin-ups', sets: '3x8' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Recovery + Light Cardio',
        exercises: [
          { name: 'Walking', duration: '30 mins' },
          { name: 'Stretching', duration: '20 mins' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Legs + Shoulders',
        exercises: [
          { name: 'Squats', sets: '5x5' },
          { name: 'Military Press', sets: '4x8' },
          { name: 'Leg Press', sets: '3x12' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Full Body + Core',
        exercises: [
          { name: 'Clean and Press', sets: '4x6' },
          { name: 'Pull-ups', sets: '3x8' },
          { name: 'Ab Wheel', sets: '3x12' }
        ]
      }
    ],
    tips: [
      'Focus on progressive overload',
      'Rest 2-3 minutes between sets',
      'Prioritize compound exercises',
      'Eat in a caloric surplus',
      'Get 7-9 hours of sleep',
      'Track protein intake'
    ]
  }
};

export default function WorkoutPage() {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [userGoal, setUserGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          router.push('/');
          return;
        }

        const userData = userDoc.data();
        if (!userData.goal) {
          router.push('/');
          return;
        }

        setUserGoal(userData.goal);
        generateWorkoutPlan(userData.goal);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const generateWorkoutPlan = (goal) => {
    if (!goal) return;
    setWorkoutPlan(workoutPlans[goal] || workoutPlans['weight-loss']);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading your workout plan...</div>
      </div>
    );
  }

  if (!userGoal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 mb-4">Please set your fitness goal first</div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Set Goal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Personalized Workout Plan
      </h1>

      {workoutPlan && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
            <div className="space-y-4">
              {workoutPlan.weeklySchedule.map((day, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-medium text-lg text-blue-600">{day.day} - {day.focus}</h3>
                  <ul className="mt-2 space-y-2">
                    {day.exercises.map((exercise, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>{exercise.name}</span>
                        <span className="text-gray-600">{exercise.sets}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tips for Your Goal</h2>
            <ul className="list-disc list-inside space-y-2">
              {workoutPlan.tips.map((tip, index) => (
                <li key={index} className="text-blue-800">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}