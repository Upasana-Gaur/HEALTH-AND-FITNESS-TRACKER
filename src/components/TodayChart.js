'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function TodayChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTodayLog = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const q = query(collection(db, 'logs'), where('userId', '==', user.uid), where('date', '==', today));
      const snap = await getDocs(q);
      if (snap.empty) return;

      const log = snap.docs[0].data();
      setData({
        labels: ['Water (L)', 'Exercise (min)', 'Sleep (hrs)'],
        datasets: [{
          label: 'Today\'s Stats',
          data: [
            parseFloat(log.waterIntake) || 0,
            parseFloat(log.exerciseTime) || 0,
            getSleepHours(log.sleepTime, log.wakeTime),
          ],
          backgroundColor: ['#60A5FA', '#34D399', '#FBBF24']
        }]
      });
    };

    fetchTodayLog();
  }, []);

  const getSleepHours = (sleep, wake) => {
    if (!sleep || !wake) return 0;
    const [sH, sM] = sleep.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    return ((24 + wH + wM / 60 - sH - sM / 60) % 24).toFixed(1);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Today’s Summary</h2>
      {data ? <Bar data={data} /> : <p>No data available for today.</p>}
    </div>
  );
}
