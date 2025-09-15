import React, { useState } from 'react';

const workoutTemplates = {
  beginner: {
    name: 'Beginner Workout',
    schedule: {
      monday: ['20 min Walk', '10 Basic Squats', '10 Knee Pushups', '30s Plank'],
      wednesday: ['20 min Walk', '10 Lunges', '10 Wall Pushups', '35s Plank'],
      friday: ['25 min Walk', '12 Basic Squats', '12 Knee Pushups', '40s Plank']
    }
  },
  intermediate: {
    name: 'Intermediate Workout',
    schedule: {
      monday: ['30 min Jog', '20 Squats', '15 Pushups', '60s Plank'],
      wednesday: ['30 min HIIT', '20 Lunges', '15 Pushups', '70s Plank'],
      friday: ['35 min Jog', '25 Squats', '20 Pushups', '80s Plank']
    }
  },
  advanced: {
    name: 'Advanced Workout',
    schedule: {
      monday: ['45 min Run', '30 Jump Squats', '25 Pushups', '90s Plank'],
      tuesday: ['40 min HIIT', '30 Lunges', '20 Burpees', '100s Plank'],
      thursday: ['45 min Run', '35 Jump Squats', '30 Pushups', '120s Plank'],
      saturday: ['50 min HIIT', '40 Lunges', '25 Burpees', '120s Plank']
    }
  }
};

export default function WorkoutPlanner() {
  const [level, setLevel] = useState('beginner');
  const [customWorkout, setCustomWorkout] = useState([]);

  const addCustomExercise = (exercise) => {
    setCustomWorkout([...customWorkout, { exercise, sets: 3, reps: 10 }]);
  };

  return (
    <div className="space-y-8">
      <div className="flex space-x-4">
        {Object.keys(workoutTemplates).map((template) => (
          <button
            key={template}
            onClick={() => setLevel(template)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              level === template
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {template.charAt(0).toUpperCase() + template.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">{workoutTemplates[level].name}</h2>
        {Object.entries(workoutTemplates[level].schedule).map(([day, exercises]) => (
          <div key={day} className="mb-6">
            <h3 className="text-lg font-semibold capitalize mb-3">{day}</h3>
            <ul className="space-y-2">
              {exercises.map((exercise, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm">
                    {index + 1}
                  </span>
                  <span>{exercise}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Custom Workout</h2>
        <div className="space-y-4">
          {customWorkout.map((exercise, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="text"
                value={exercise.exercise}
                onChange={(e) => {
                  const newWorkout = [...customWorkout];
                  newWorkout[index].exercise = e.target.value;
                  setCustomWorkout(newWorkout);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={exercise.sets}
                onChange={(e) => {
                  const newWorkout = [...customWorkout];
                  newWorkout[index].sets = parseInt(e.target.value);
                  setCustomWorkout(newWorkout);
                }}
                className="w-20 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sets"
              />
              <input
                type="number"
                value={exercise.reps}
                onChange={(e) => {
                  const newWorkout = [...customWorkout];
                  newWorkout[index].reps = parseInt(e.target.value);
                  setCustomWorkout(newWorkout);
                }}
                className="w-20 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Reps"
              />
              <button
                onClick={() => {
                  setCustomWorkout(customWorkout.filter((_, i) => i !== index));
                }}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addCustomExercise('')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  );
}