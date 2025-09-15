import React, { useState, useEffect } from 'react';
import Link from 'next/link';  // Add this import at the top
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { format } from 'date-fns';

// Exercise database with common exercises
const exerciseDatabase = {
  cardio: [
    { name: 'Running', metrics: ['distance', 'pace'] },
    { name: 'Cycling', metrics: ['distance', 'speed'] },
    { name: 'Swimming', metrics: ['laps', 'distance'] },
    { name: 'Jump Rope', metrics: ['duration'] },
    { name: 'HIIT', metrics: ['rounds', 'duration'] }
  ],
  strength: [
    { name: 'Bench Press', metrics: ['sets', 'reps', 'weight'] },
    { name: 'Squats', metrics: ['sets', 'reps', 'weight'] },
    { name: 'Deadlifts', metrics: ['sets', 'reps', 'weight'] },
    { name: 'Pull-ups', metrics: ['sets', 'reps'] },
    { name: 'Push-ups', metrics: ['sets', 'reps'] }
  ],
  flexibility: [
    { name: 'Yoga', metrics: ['duration'] },
    { name: 'Stretching', metrics: ['duration'] },
    { name: 'Pilates', metrics: ['duration'] }
  ]
};

const WGER_API_URL = 'https://wger.de/api/v2/exercise';

const calculateExerciseSummary = (exercises) => {
  return exercises.reduce((summary, exercise) => {
    // Calculate total duration
    if (exercise.duration) {
      summary.totalDuration += parseInt(exercise.duration);
    }

    // Calculate total sets and weight lifted
    if (exercise.sets && exercise.sets.length > 0) {
      summary.totalSets += exercise.sets.length;
      summary.totalWeight += exercise.sets.reduce((total, set) => {
        return total + (parseInt(set.reps) * parseInt(set.weight) || 0);
      }, 0);
    }

    // Track exercise types
    if (!summary.exerciseTypes.includes(exercise.name)) {
      summary.exerciseTypes.push(exercise.name);
    }

    // Calculate total distance for cardio
    if (exercise.distance) {
      summary.totalDistance += parseInt(exercise.distance);
    }

    return summary;
  }, {
    totalDuration: 0,
    totalSets: 0,
    totalWeight: 0,
    totalDistance: 0,
    exerciseTypes: [],
    date: new Date().toISOString().split('T')[0]
  });
};

export const ExerciseSelector = ({ workout, onChange }) => {
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: [],
    duration: 0,
    distance: 0,
    notes: ''
  });
  const [weight, setWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [user, setUser] = useState(null);
  const [editingWeight, setEditingWeight] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadExerciseData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadExerciseData = async (userId) => {
    try {
      const exerciseRef = doc(db, 'exercises', userId);
      const exerciseDoc = await getDoc(exerciseRef);
      if (exerciseDoc.exists()) {
        const data = exerciseDoc.data();
        // Patch document if missing userId
        if (!data.userId) {
          await setDoc(exerciseRef, { userId }, { merge: true });
        }
        onChange({
          ...workout,
          exercises: data.exercises || [],
          weightHistory: data.weightHistory || []
        });
        setWeightHistory(data.weightHistory || []);
      } else {
        // Create empty document with userId if not exists
        await setDoc(exerciseRef, { userId, exercises: [], weightHistory: [], summary: {}, updatedAt: new Date().toISOString() });
        onChange({
          ...workout,
          exercises: [],
          weightHistory: []
        });
        setWeightHistory([]);
      }
    } catch (error) {
      console.error('Error loading exercise data:', error);
    }
  };

  const saveExerciseData = async (updatedWorkout) => {
    if (!user) return;

    try {
      const summary = calculateExerciseSummary(updatedWorkout.exercises || []);
      
      await setDoc(doc(db, 'exercises', user.uid), {
        exercises: updatedWorkout.exercises || [],
        weightHistory: updatedWorkout.weightHistory || [],
        summary: summary,
        userId: user.uid, // Ensure userId is always present
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Also save daily summary
      const dailySummaryRef = doc(db, 'exerciseSummaries', `${user.uid}_${summary.date}`);
      await setDoc(dailySummaryRef, {
        ...summary,
        userId: user.uid, // Also include userId in summary for consistency
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving exercise data:', error);
    }
  };

  const handleAddSet = () => {
    const newSet = {
      reps: 0,
      weight: 0,
      duration: 0,
      distance: 0
    };
    setCurrentExercise(prev => ({
      ...prev,
      sets: [...prev.sets, newSet]
    }));
  };

  const handleSetChange = (index, field, value) => {
    setCurrentExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => 
        i === index ? { ...set, [field]: value } : set
      )
    }));
  };

  const handleAddExercise = async () => {
    const updatedWorkout = {
      ...workout,
      exercises: [...(workout.exercises || []), currentExercise]
    };
    
    onChange(updatedWorkout);
    await saveExerciseData(updatedWorkout);
    
    // Update summary in parent component if provided
    if (workout.onSummaryUpdate) {
      const summary = calculateExerciseSummary(updatedWorkout.exercises);
      workout.onSummaryUpdate(summary);
    }
    
    setCurrentExercise({
      name: '',
      sets: [],
      duration: 0,
      distance: 0,
      notes: ''
    });
  };

  const handleWeightSubmit = async () => {
    try {
      const newWeightEntry = {
        weight: parseFloat(weight),
        date: new Date().toISOString(),
      };
      
      const updatedWorkout = {
        ...workout,
        weightHistory: [...(workout.weightHistory || []), newWeightEntry]
      };
      
      await onChange(updatedWorkout);
      await saveExerciseData(updatedWorkout);
      
      setWeight('');
      setWeightHistory(updatedWorkout.weightHistory);
      generateRecommendations();
    } catch (error) {
      console.error('Error saving weight:', error);
    }
  };

  const handleDeleteWeight = async (index) => {
    const updatedHistory = weightHistory.filter((_, i) => i !== index);
    const updatedWorkout = {
      ...workout,
      weightHistory: updatedHistory
    };
    
    await onChange(updatedWorkout);
    await saveExerciseData(updatedWorkout);
    setWeightHistory(updatedHistory);
  };

  const handleEditWeight = async (index, newWeight) => {
    const updatedHistory = weightHistory.map((entry, i) => 
      i === index ? { ...entry, weight: parseFloat(newWeight) } : entry
    );
    
    const updatedWorkout = {
      ...workout,
      weightHistory: updatedHistory
    };
    
    await onChange(updatedWorkout);
    await saveExerciseData(updatedWorkout);
    setWeightHistory(updatedHistory);
    setEditingWeight(null);
  };

  const handleEditExercise = async (index, updatedExercise) => {
    const updatedExercises = workout.exercises.map((ex, i) => 
      i === index ? updatedExercise : ex
    );
    
    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };
    
    onChange(updatedWorkout);
    await saveExerciseData(updatedWorkout);
    setEditingExercise(null);
  };

  const generateRecommendations = () => {
    const { goal } = workout;
    const lastWeight = weightHistory[weightHistory.length - 1]?.weight;
    const previousWeight = weightHistory[weightHistory.length - 2]?.weight;

    let recommendation = {
      message: '',
      changes: [],
      nextSteps: []
    };

    if (goal === 'weight-loss' && lastWeight > previousWeight) {
      recommendation = {
        message: 'Increase cardio intensity and reduce rest periods',
        changes: [
          'Add 10 minutes to cardio sessions',
          'Increase HIIT intervals',
          'Add an extra cardio session this week'
        ],
        nextSteps: [
          'Focus on compound exercises',
          'Consider adding morning cardio sessions'
        ]
      };
    } else if (goal === 'weight-gain' && lastWeight < previousWeight) {
      recommendation = {
        message: 'Increase strength training volume and protein intake',
        changes: [
          'Add an extra set to compound exercises',
          'Increase weights by 5%',
          'Reduce cardio frequency'
        ],
        nextSteps: [
          'Focus on progressive overload',
          'Prioritize rest between sets'
        ]
      };
    }

    setRecommendations(recommendation);
  };

  // Add completion, effort, and notes to each exercise for daily tracking
  const today = format(new Date(), 'yyyy-MM-dd');

  // Helper to update a single exercise's daily status
  const handleExerciseStatusChange = async (index, field, value) => {
    const updatedExercises = workout.exercises.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    );
    const updatedWorkout = { ...workout, exercises: updatedExercises };
    onChange(updatedWorkout);
    await saveDailyExerciseLog(updatedWorkout);
  };

  // Save daily exercise log to dailyLogs/{userId}_${date}
  const saveDailyExerciseLog = async (updatedWorkout) => {
    if (!user) return;
    try {
      const logRef = doc(db, 'dailyLogs', `${user.uid}_${today}`);
      await setDoc(logRef, {
        workouts: [updatedWorkout],
        userId: user.uid,
        date: today,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving daily exercise log:', error);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <select
          value={workout.type}
          onChange={(e) => onChange({ ...workout, type: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select Type</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Strength</option>
          <option value="flexibility">Flexibility</option>
        </select>

        {workout.type && (
          <select
            value={currentExercise.name}
            onChange={(e) => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select Exercise</option>
            {exerciseDatabase[workout.type]?.map(exercise => (
              <option key={exercise.name} value={exercise.name}>
                {exercise.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {currentExercise.name && (
        <div className="space-y-4 mt-4">
          {workout.type === 'strength' && (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Sets</h4>
                  <p className="text-sm text-gray-500">Add your sets with reps and weight</p>
                </div>
                <button
                  onClick={handleAddSet}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Set
                </button>
              </div>
              
              {currentExercise.sets.map((set, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Set {index + 1}</span>
                    <button
                      onClick={() => {
                        setCurrentExercise(prev => ({
                          ...prev,
                          sets: prev.sets.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove Set
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Reps
                      </label>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                        placeholder="e.g., 12"
                        className="w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                        placeholder="e.g., 50"
                        className="w-full rounded-md border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {(workout.type === 'cardio' || workout.type === 'flexibility') && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={currentExercise.duration}
                onChange={(e) => setCurrentExercise(prev => ({ 
                  ...prev, 
                  duration: e.target.value 
                }))}
                placeholder="Duration (mins)"
                className="rounded-md border-gray-300"
              />
              {workout.type === 'cardio' && (
                <input
                  type="number"
                  value={currentExercise.distance}
                  onChange={(e) => setCurrentExercise(prev => ({ 
                    ...prev, 
                    distance: e.target.value 
                  }))}
                  placeholder="Distance (km)"
                  className="rounded-md border-gray-300"
                />
              )}
            </div>
          )}

          <textarea
            value={currentExercise.notes}
            onChange={(e) => setCurrentExercise(prev => ({ 
              ...prev, 
              notes: e.target.value 
            }))}
            placeholder="Notes (optional)"
            className="w-full rounded-md border-gray-300"
            rows={2}
          />

          <button
            onClick={handleAddExercise}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Add Exercise
          </button>
        </div>
      )}

      {/* Weight Tracking Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-4">Weight Tracking</h4>
        <div className="flex gap-4">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight (kg)"
            className="rounded-md border-gray-300"
          />
          <button
            onClick={handleWeightSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Log Weight
          </button>
        </div>
        
        {weightHistory.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-600">Weight History</h5>
            <div className="mt-2 space-y-2">
              {weightHistory.slice(-5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  {editingWeight === index ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 rounded-md border-gray-300"
                        value={entry.weight}
                        onChange={(e) => handleEditWeight(index, e.target.value)}
                        onBlur={() => setEditingWeight(null)}
                        autoFocus
                      />
                      <span className="text-gray-500">kg</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.weight} kg</span>
                      <button
                        onClick={() => setEditingWeight(index)}
                        className="p-1 text-blue-500 hover:text-blue-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteWeight(index)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Display added exercises */}
      {workout.exercises?.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="font-medium">Today's Exercises</h4>
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <span className="font-medium">{exercise.name}</span>
                  {exercise.sets?.length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      {exercise.sets.map((set, i) => (
                        <div key={i}>
                          Set {i + 1}: {set.reps} reps @ {set.weight}kg
                        </div>
                      ))}
                    </div>
                  )}
                  {exercise.duration > 0 && (
                    <div className="text-sm text-gray-600">
                      Duration: {exercise.duration} mins
                      {exercise.distance > 0 && ` | Distance: ${exercise.distance}km`}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-[180px]">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!exercise.completed}
                      onChange={e => handleExerciseStatusChange(index, 'completed', e.target.checked)}
                    />
                    Completed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    Effort:
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={exercise.effort || ''}
                      onChange={e => handleExerciseStatusChange(index, 'effort', e.target.value)}
                      className="w-12 rounded border border-gray-300 px-1"
                      placeholder="1-10"
                    />
                  </label>
                  <textarea
                    value={exercise.notes || ''}
                    onChange={e => handleExerciseStatusChange(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full rounded-md border-gray-300 text-xs"
                    rows={1}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-4">Workout Recommendations</h4>
          <p className="text-blue-800 mb-2">{recommendations.message}</p>
          
          <h5 className="font-medium text-blue-900 mt-4 mb-2">Suggested Changes:</h5>
          <ul className="list-disc list-inside text-blue-800">
            {recommendations.changes.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>

          <h5 className="font-medium text-blue-900 mt-4 mb-2">Next Steps:</h5>
          <ul className="list-disc list-inside text-blue-800">
            {recommendations.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>

          <Link
            href="/workout"
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            See Your Daily Exercise Chart
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};