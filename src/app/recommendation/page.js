'use client';
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';

export default function Recommendation() {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setError("Please log in to see recommendations");
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const generateAdvice = async () => {
      if (!user) return;

      try {
        // Get user profile
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          setError("Please complete your profile first");
          setLoading(false);
          return;
        }

        const profile = profileSnap.data();
        const tips = [];

        // Workout Recommendations
        tips.push("🏋️‍♀️ Workout Recommendations:");
        if (profile.preferredWorkoutType?.includes('HIIT')) {
          tips.push("• Try alternating between HIIT days and recovery days to prevent burnout");
          tips.push("• Incorporate 20-30 minute HIIT sessions 3 times a week");
        }
        if (profile.preferredWorkoutType?.includes('Yoga - Vinyasa Flow')) {
          tips.push("• Practice Vinyasa Flow in the morning to energize your day");
          tips.push("• Consider adding restorative yoga on your rest days");
        }

        // Diet & Nutrition
        if (profile.dietaryRestrictions?.length > 0) {
          tips.push("\n🥗 Nutrition Guidelines:");
          
          // Existing vegetarian checks...
          if (profile.dietaryRestrictions?.includes('Vegetarian - Lacto-Ovo')) {
            tips.push("• Ensure adequate protein through eggs, dairy, legumes");
            tips.push("• Monitor B12 intake - consider supplementation");
          }
          if (profile.waterIntake < 2.5) {
            tips.push("• Increase water intake to reach 2.5L daily target");
          }

          // Add macro breakdown based on goals
          if (profile.primaryGoal === 'Weight Loss') {
            tips.push("• Recommended macro split: 40% protein, 30% carbs, 30% fats");
            tips.push("• Focus on high-protein, low-calorie foods");
            tips.push("• Aim for a 500-calorie daily deficit");
          } else if (profile.primaryGoal === 'Muscle Gain') {
            tips.push("• Recommended macro split: 30% protein, 50% carbs, 20% fats");
            tips.push("• Increase caloric intake by 300-500 calories");
            tips.push("• Time carbs around workouts");
          }

          // Add meal timing recommendations
          if (profile.mealPreference) {
            tips.push(`• Optimal meal timing for ${profile.mealPreference}:`);
            if (profile.mealPreference === '5 meals') {
              tips.push("  - Breakfast: 7-8am");
              tips.push("  - Snack: 10-11am");
              tips.push("  - Lunch: 1-2pm");
              tips.push("  - Pre-workout: 4-5pm");
              tips.push("  - Dinner: 7-8pm");
            }
          }
        }

        // Medical Considerations
        if (profile.medicalConditions?.includes('Mild Asthma')) {
          tips.push("\n🏥 Health Management:");
          tips.push("• Keep inhaler accessible during workouts");
          tips.push("• Warm up properly to prevent exercise-induced asthma");
          tips.push("• Monitor air quality for outdoor activities");
        }

        // Weight Management
        if (profile.primaryGoal === 'Weight Loss') {
          const currentWeight = parseFloat(profile.weight);
          const targetWeight = parseFloat(profile.targetWeight);
          const weeklyGoal = 0.5; // kg per week
          
          tips.push("\n⚖️ Weight Management Plan:");
          tips.push(`• Target weekly weight loss: ${weeklyGoal}kg`);
          tips.push(`• Estimated timeline: ${Math.ceil((currentWeight - targetWeight) / weeklyGoal)} weeks`);
          tips.push("• Focus on creating a sustainable caloric deficit");
        }

        // Recovery & Wellness
        tips.push("\n🧘‍♀️ Recovery Recommendations:");
        if (profile.recoveryMethods?.includes('Dynamic Stretching')) {
          tips.push("• Perform dynamic stretches before workouts");
          tips.push("• Include mobility work in your warm-up routine");
        }
        if (profile.sleepDuration < 7) {
          tips.push("• Prioritize sleep - aim to increase duration to 7-8 hours");
        }

        // Supplement Guidance
        if (profile.supplementsUsed?.length > 0) {
          tips.push("\n💊 Supplement Schedule:");
          if (profile.supplementsUsed.includes('Whey Protein')) {
            tips.push("• Take whey protein within 30 minutes post-workout");
          }
          if (profile.supplementsUsed.includes('Vitamin D')) {
            tips.push("• Take Vitamin D with a meal containing healthy fats");
          }
        }

        // Tracking Tips
        tips.push("\n📊 Tracking Recommendations:");
        tips.push(`• Log your activities ${profile.trackingFrequency.toLowerCase()}`);
        tips.push("• Monitor your progress using your preferred metrics");
        tips.push("• Update your goals every 4-6 weeks");

        setAdvice(tips);
        setLoading(false);
      } catch (err) {
        console.error("Error generating advice:", err);
        setError("Failed to generate recommendations. Please try again.");
        setLoading(false);
      }
    };

    if (user) {
      generateAdvice();
    }
  }, [user]);

  const compareMetric = (label, todayVal, yestVal, unit) => {
    const t = parseFloat(todayVal || 0);
    const y = parseFloat(yestVal || 0);
    if (t > y) return `${label}: ↑ Improved (+${(t - y).toFixed(1)} ${unit})`;
    if (t < y) return `${label}: ↓ Decreased (-${(y - t).toFixed(1)} ${unit})`;
    return `${label}: → No change`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8 border-b pb-4">
        Your Health & Fitness Insights
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="bg-white p-6 rounded-lg border-l-4 border-red-400 shadow-sm text-gray-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-3"> 
          {advice.map((tip, index) => {
            const isHeader = tip.includes('Recommendations:') || 
                            tip.includes('Guidelines:') || 
                            tip.includes('Management:') ||
                            tip.includes('Management Plan:') ||
                            tip.includes('Schedule:');

            return (
              <div 
                key={index} 
                className={`
                  bg-white 
                  rounded-lg 
                  shadow-sm
                  transition-all 
                  duration-200
                  hover:shadow-md
                  ${isHeader 
                    ? 'border-l-4 border-indigo-500 p-4 mt-4 first:mt-0' 
                    : 'pl-6 pr-4 py-2 ml-3 border-l border-gray-100' 
                  }
                `}
              >
                <div className={`
                  ${isHeader 
                    ? 'text-lg font-medium text-gray-800' 
                    : 'text-gray-600 leading-relaxed'
                  }
                `}>
                  {tip}
                </div>
              </div>
            );
          })}
          
          <div className="mt-8 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-sm border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-3">
              Next Steps
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Review these recommendations and incorporate them into your daily routine. 
              Track your progress and adjust as needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
