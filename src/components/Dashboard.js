import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper to get today's date string
const getToday = () => new Date().toISOString().split('T')[0];

export default function Dashboard({ data }) {
  const [showWelcome, setShowWelcome] = useState(true);

  // Defensive: fallback if data is missing or empty
  if (!data || !data.lastTenDays || data.lastTenDays.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">No daily input data found. Please log your first entry in the Daily Log.</div>
      </div>
    );
  }

  // Defensive: fallback if data is missing
  const today = data?.lastTenDays?.find(day => day.date === getToday()) || data?.lastTenDays?.[data?.lastTenDays?.length - 1] || {};

  // Today's summary data (from daily input)
  const todayData = {
    labels: ['Calories', 'Protein', 'Carbs', 'Fat', 'Water', 'Sleep'],
    datasets: [{
      label: "Today's Progress",
      data: [
        today.totalCalories || 0,
        today.totalProtein || 0,
        today.totalCarbs || 0,
        today.totalFat || 0,
        today.waterIntake || 0,
        today.sleepHours || 0
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderWidth: 1
    }]
  };

  // Last 10 days chart (from daily input)
  const tenDayData = {
    labels: data?.lastTenDays?.map(day => day.date) || [],
    datasets: [
      {
        label: 'Calories',
        data: data?.lastTenDays?.map(day => day.totalCalories) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y',
        tension: 0.1
      },
      {
        label: 'Protein',
        data: data?.lastTenDays?.map(day => day.totalProtein) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y',
        tension: 0.1
      },
      {
        label: 'Water (ml)',
        data: data?.lastTenDays?.map(day => day.waterIntake) || [],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        yAxisID: 'y1',
        tension: 0.1
      },
      {
        label: 'Sleep (hrs)',
        data: data?.lastTenDays?.map(day => day.sleepHours) || [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        yAxisID: 'y2',
        tension: 0.1
      }
    ]
  };

  // Mood and wellness data
  const moodData = {
    labels: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'],
    datasets: [{
      data: today.moodDistribution || [0, 0, 0, 1, 0],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };

  // Progress report (simple summary)
  const progressReport = () => {
    if (!data?.lastTenDays?.length) return 'No data available.';
    const last = data.lastTenDays[data.lastTenDays.length - 1];
    const first = data.lastTenDays[0];
    const calorieDiff = (last.totalCalories || 0) - (first.totalCalories || 0);
    const sleepDiff = (last.sleepHours || 0) - (first.sleepHours || 0);
    const waterDiff = (last.waterIntake || 0) - (first.waterIntake || 0);
    return `In the last 10 days: Calories ${calorieDiff >= 0 ? 'increased' : 'decreased'} by ${Math.abs(calorieDiff)}, Sleep ${sleepDiff >= 0 ? 'improved' : 'reduced'} by ${Math.abs(sleepDiff)} hrs, Water intake ${waterDiff >= 0 ? 'increased' : 'decreased'} by ${Math.abs(waterDiff)} ml.`;
  };

  return (
    <div className="space-y-8">
      {/* Onboarding/Welcome Card */}
      {showWelcome && (
        <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">Welcome to Your Health Dashboard!</h2>
            <ul className="list-disc list-inside text-blue-900 text-sm mb-2">
              <li>Track your meals, workouts, water, and sleep daily.</li>
              <li>Check your progress with charts and summaries.</li>
              <li>Use quick links below to log today’s data or get help.</li>
            </ul>
            <div className="flex gap-2 mt-2">
              <a href="/daily-input" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Daily Log</a>
              <a href="/meal-planner" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Meal Planner</a>
              <a href="/workout" className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">Workout</a>
              <a href="/support" className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">Support</a>
            </div>
          </div>
          <button onClick={() => setShowWelcome(false)} className="ml-4 px-3 py-1 text-blue-700 border border-blue-400 rounded hover:bg-blue-200 text-sm">Dismiss</button>
        </div>
      )}

      {/* Reminders Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="text-yellow-900 text-sm">
          <span className="font-semibold">Reminders:</span> Don’t forget to log today’s <a href="/daily-input" className="underline hover:text-yellow-700">meals</a>, <a href="/workout" className="underline hover:text-yellow-700">workout</a>, <a href="/daily-input" className="underline hover:text-yellow-700">water intake</a>, and <a href="/daily-input" className="underline hover:text-yellow-700">sleep</a>!
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Current Weight</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data?.currentWeight || '--'} kg
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Today's Calories</h3>
          <p className="text-3xl font-bold text-green-600">
            {data?.today?.totalCalories || '--'} cal
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Sleep Quality</h3>
          <p className="text-3xl font-bold text-purple-600">
            {data?.today?.sleepQuality || '--'}/5
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Workout Status</h3>
          <p className="text-3xl font-bold text-orange-600">
            {data?.today?.workoutComplete ? '✓' : '–'}
          </p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
          <h3 className="text-base font-semibold mb-2">Today's Progress</h3>
          <div className="w-full max-w-xs h-56">
            <Bar 
              data={todayData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 10 } }
                  },
                  x: {
                    ticks: { font: { size: 10 } }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
          <h3 className="text-base font-semibold mb-2">Today's Mood</h3>
          <div className="w-full max-w-xs h-56 flex items-center justify-center">
            <Doughnut data={moodData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} />
          </div>
        </div>
      </div>

      {/* 10-Day Comparison */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="text-base font-semibold mb-2">10-Day Overview</h3>
        <div className="w-full max-w-2xl h-64 mx-auto">
          <Line 
            data={tenDayData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              plugins: {
                legend: { position: 'bottom', labels: { font: { size: 10 } } }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: { display: true, text: 'Weight (kg)', font: { size: 10 } },
                  ticks: { font: { size: 10 } }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: { display: true, text: 'Calories', font: { size: 10 } },
                  grid: { drawOnChartArea: false },
                  ticks: { font: { size: 10 } }
                },
                y2: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: { display: true, text: 'Sleep (hours)', font: { size: 10 } },
                  grid: { drawOnChartArea: false },
                  ticks: { font: { size: 10 } }
                },
                x: {
                  ticks: { font: { size: 10 } }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}