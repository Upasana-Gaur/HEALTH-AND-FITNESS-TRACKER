"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FoodSelector, ExerciseSelector, MoodTracker, SleepQualityInput } from '@/components/InputSelectors';
import {
  DailySummaryCard,
  NutritionSummaryCard,
  ExerciseSummaryCard,
  SleepQualityCard,
  WellnessScoreCard,
} from '@/components/SummaryCards';
import { MealTracker } from '@/components/Trackers/MealTracker';
import { WaterIntakeTracker } from '@/components/Trackers/WaterIntakeTracker';
import { SupplementTracker } from '@/components/Trackers/SupplementTracker';
import { FiChevronLeft, FiChevronRight, FiDownload, FiBell } from 'react-icons/fi';

export default function DailyLog() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    meals: {
      breakfast: { type: 'Breakfast', time: '', items: [], calories: 0 },
      lunch: { type: 'Lunch', time: '', items: [], calories: 0 },
      dinner: { type: 'Dinner', time: '', items: [], calories: 0 },
      snacks: { type: 'Snacks', time: '', items: [], calories: 0 }
    },
    waterIntake: 0,
    supplements: [],
    workouts: [{
      type: '',
      exercises: [],
      duration: 0,
      notes: ''
    }],
    sleep: {      // Add this
      duration: 0,
      quality: 0,
      bedtime: '',
      wakeTime: ''
    },
    wellness: {    // Add this
      mood: 0,
      energy: 0,
      motivation: 0
    },
    mood: {
      morning: 0,
      afternoon: 0,
      evening: 0
    },
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [sleepData, setSleepData] = useState({
    sleepStart: '',
    sleepEnd: '',
    quality: 0,
    factors: [],
    notes: ''
  });
  const [moodData, setMoodData] = useState({
    morning: 0,
    afternoon: 0,
    evening: 0
  });
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notification, setNotification] = useState("");

  // Fetch today's data when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);
      await fetchTodayData(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Multi-day navigation
  const changeDay = (days) => {
    const newDate = format(new Date(new Date(selectedDate).getTime() + days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    setSelectedDate(newDate);
    fetchTodayData(user?.uid, newDate);
  };

  // Fetch data for a specific date
  const fetchTodayData = async (userId, dateOverride) => {
    try {
      const dateStr = dateOverride || format(new Date(), 'yyyy-MM-dd');
      const todayDoc = doc(db, 'dailyLogs', `${userId}_${dateStr}`);
      const docSnap = await getDoc(todayDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm(prevForm => ({
          ...prevForm,
          ...data,
          meals: { ...prevForm.meals, ...data.meals },
        }));
      } else {
        // Reset form for new day
        setForm({
          meals: {
            breakfast: { type: 'Breakfast', time: '', items: [], calories: 0 },
            lunch: { type: 'Lunch', time: '', items: [], calories: 0 },
            dinner: { type: 'Dinner', time: '', items: [], calories: 0 },
            snacks: { type: 'Snacks', time: '', items: [], calories: 0 }
          },
          waterIntake: 0,
          supplements: [],
          workouts: [{ type: '', exercises: [], duration: 0, notes: '' }],
          sleep: { duration: 0, quality: 0, bedtime: '', wakeTime: '' },
          wellness: { mood: 0, energy: 0, motivation: 0 },
          mood: { morning: 0, afternoon: 0, evening: 0 },
          date: dateStr
        });
      }
    } catch (error) {
      console.error("Error fetching day's data:", error);
    }
  };

  // Save data to Firestore
  const saveData = async (newData) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'dailyLogs', `${user.uid}_${newData.date}`);
      await setDoc(docRef, {
        ...newData,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Update form and save to Firestore
  const handleFormUpdate = async (updates) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        ...updates
      };
      // Save to Firestore after state update
      saveData(newForm);
      return newForm;
    });
  };

  const handleWorkoutChange = async (index, updatedWorkout) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        workouts: prev.workouts.map((w, i) => 
          i === index ? updatedWorkout : w
        )
      };
      // Save to Firestore if needed
      return newForm;
    });
  };

  const handleSleepChange = (updatedSleep) => {
    setSleepData(updatedSleep);
    handleFormUpdate({ sleep: updatedSleep });
  };

  const handleMoodChange = (updatedMood) => {
    setForm(prev => ({
      ...prev,
      mood: updatedMood
    }));
    handleFormUpdate({ mood: updatedMood });
  };

  // Export daily log as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(form, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-log-${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Notification example (e.g., hydration reminder)
  useEffect(() => {
    if (form.waterIntake < 1000) {
      setNotification('Don\'t forget to drink more water today!');
    } else {
      setNotification("");
    }
  }, [form.waterIntake, selectedDate]);

  // Sync form.sleep with sleepData when sleepData changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      sleep: sleepData
    }));
  }, [sleepData]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Multi-day navigation and export */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-blue-100"><FiChevronLeft /></button>
              <span className="font-semibold text-lg">{selectedDate}</span>
              <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-blue-100"><FiChevronRight /></button>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              <FiDownload /> Export
            </button>
          </div>
          {/* Notification banner */}
          {notification && (
            <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded p-2 mb-4">
              <FiBell />
              <span>{notification}</span>
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Daily Health Tracker</h1>
            <p className="text-gray-600">Track your complete daily wellness journey</p>
          </header>

          <Tab.Group defaultIndex={0} as="div">
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              {['Overview', 'Nutrition', 'Exercise', 'Sleep', 'Wellness'].map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 focus:outline-none
                     ${selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                    }`
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="mt-6">
              {/* Overview Panel */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DailySummaryCard data={form} />
                  <NutritionSummaryCard meals={form.meals} />
                  <ExerciseSummaryCard workouts={form.workouts} />
                  <SleepQualityCard sleep={form.sleep} />
                  <WellnessScoreCard data={form} />
                </div>
              </Tab.Panel>

              {/* Nutrition Panel */}
              <Tab.Panel>
                <div className="space-y-6">
                  {/* Meal Tracking Section */}
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Meal Tracking</h3>
                    {Object.entries(form.meals).map(([mealKey, mealData]) => (
                      <FoodSelector
                        key={mealKey}
                        meal={mealData}
                        onChange={(updatedMeal) => {
                          const updatedMeals = {
                            ...form.meals,
                            [mealKey]: updatedMeal
                          };
                          handleFormUpdate({
                            meals: updatedMeals
                          });
                        }}
                      />
                    ))}
                  </div>

                  {/* Water Intake Section */}
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Water Intake</h3>
                    <WaterIntakeTracker
                      value={form.waterIntake}
                      onChange={(value) => {
                        handleFormUpdate({
                          waterIntake: value
                        });
                      }}
                      target={2500} // 2.5L target in ml
                    />
                  </div>

                  {/* Supplements Section */}
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Supplements</h3>
                    <SupplementTracker
                      supplements={form.supplements}
                      onChange={(updatedSupplements) => {
                        handleFormUpdate({
                          supplements: updatedSupplements
                        });
                      }}
                    />
                  </div>

                  {/* Daily Nutrition Summary */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">Daily Nutrition Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Total Daily Calories:</span>
                          <span className="font-bold text-blue-900">
                            {Object.values(form.meals).reduce((sum, meal) => sum + meal.calories, 0)} kcal
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Water Intake:</span>
                          <span className="font-bold text-blue-900">
                            {form.waterIntake} / 2500 ml
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Supplements Taken:</span>
                          <span className="font-bold text-blue-900">
                            {form.supplements.length}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={Object.values(form.meals)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="calories" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Exercise Panel */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Workout Tracking</h3>
                    {form.workouts.map((workout, index) => (
                      <ExerciseSelector
                        key={index}
                        workout={workout}
                        onChange={(updatedWorkout) => {
                          handleWorkoutChange(index, updatedWorkout);
                        }}
                      />
                    ))}
                    
                    <button
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          workouts: [...prev.workouts, {
                            type: '',
                            exercises: [],
                            duration: 0,
                            notes: ''
                          }]
                        }));
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Another Workout
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* Sleep Panel */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sleep Tracking</h3>
                    <SleepQualityInput 
                      sleep={sleepData}
                      onChange={handleSleepChange}
                    />
                  </div>
                </div>
              </Tab.Panel>

              {/* Wellness Panel */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Tracker</h3>
                    <MoodTracker 
                      mood={form.mood} 
                      onChange={handleMoodChange}
                    />
                  </div>
                </div>
              </Tab.Panel>

            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}

// Helper function for className concatenation
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
