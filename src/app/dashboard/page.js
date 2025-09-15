'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        setData(null);
        return;
      }
      try {
        // Fetch last 10 days of dailyLogs for this user
        const logsRef = collection(db, 'dailyLogs');
        const q = query(
          logsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const logs = querySnapshot.docs.map(doc => doc.data()).reverse();
        // Normalize and aggregate data for dashboard
        const lastTenDays = logs.map(log => ({
          date: log.date,
          totalCalories: log.meals ? Object.values(log.meals).reduce((sum, meal) => sum + (meal.calories || 0), 0) : 0,
          totalProtein: log.meals ? Object.values(log.meals).reduce((sum, meal) => sum + (meal.protein || 0), 0) : 0,
          totalCarbs: log.meals ? Object.values(log.meals).reduce((sum, meal) => sum + (meal.carbs || 0), 0) : 0,
          totalFat: log.meals ? Object.values(log.meals).reduce((sum, meal) => sum + (meal.fat || 0), 0) : 0,
          waterIntake: log.waterIntake || 0,
          sleepHours: log.sleep ? (log.sleep.duration || 0) : 0,
          sleepQuality: log.sleep ? (log.sleep.quality || 0) : 0,
          workoutComplete: log.workouts ? log.workouts.some(w => w.duration > 0 || (w.exercises && w.exercises.length > 0)) : false,
          moodDistribution: log.moodDistribution || [0,0,0,1,0],
        }));
        setData({
          lastTenDays,
          currentWeight: logs[logs.length-1]?.weight || 0,
          today: lastTenDays[lastTenDays.length-1] || {},
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Please log in to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Your Health Dashboard
        </h1>
        <Dashboard data={data} />
      </div>
    </div>
  );
}