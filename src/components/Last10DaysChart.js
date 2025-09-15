'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

export default function Last10DaysChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchLastLogs = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'logs'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;

      const logs = snap.docs.map(doc => doc.data()).reverse();

      setChartData({
        labels: logs.map(log => log.date),
        datasets: [
          {
            label: 'Water (L)',
            data: logs.map(log => parseFloat(log.waterIntake || 0)),
            borderColor: '#60A5FA',
            fill: false
          },
          {
            label: 'Exercise (min)',
            data: logs.map(log => parseFloat(log.exerciseTime || 0)),
            borderColor: '#34D399',
            fill: false
          },
          {
            label: 'Sleep (hrs)',
            data: logs.map(log => getSleepHours(log.sleepTime, log.wakeTime)),
            borderColor: '#FBBF24',
            fill: false
          }
        ]
      });
    };

    fetchLastLogs();
  }, []);

  const getSleepHours = (sleep, wake) => {
    if (!sleep || !wake) return 0;
    const [sH, sM] = sleep.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    return ((24 + wH + wM / 60 - sH - sM / 60) % 24).toFixed(1);
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-2">Last 10 Days Trends</h2>
      {chartData ? <Line data={chartData} /> : <p>No logs for the past 10 days.</p>}
    </div>
  );
}
