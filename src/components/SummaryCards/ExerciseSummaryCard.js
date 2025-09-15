export const ExerciseSummaryCard = ({ workouts }) => {
  // Calculate calories burned based on exercise type and duration
  const calculateCalories = (exercise, duration) => {
    const MET = {
      // Cardio exercises
      'Running': 11.0,
      'Cycling': 8.0,
      'Swimming': 7.0,
      'Jump Rope': 12.3,
      'HIIT': 8.0,
      // Strength exercises
      'Bench Press': 3.8,
      'Squats': 5.0,
      'Deadlifts': 6.0,
      'Pull-ups': 4.0,
      'Push-ups': 3.8,
      // Flexibility exercises
      'Yoga': 2.5,
      'Stretching': 2.3,
      'Pilates': 3.0
    };

    // Assume average weight of 70kg if not provided
    const weight = 70;
    const met = MET[exercise] || 3.0; // default MET if exercise not found
    return Math.round((duration / 60) * met * 3.5 * weight / 200);
  };

  // Calculate totals from all workouts with improved metrics
  const summary = workouts.reduce((acc, workout) => {
    // Calculate total duration including all exercises
    const exerciseDuration = workout.exercises?.reduce((total, ex) => {
      // For time-based exercises (cardio, flexibility)
      if (ex.duration) {
        return total + parseInt(ex.duration);
      }

      // For strength exercises with sets
      if (ex.sets?.length) {
        // Calculate time per set (2 mins average for strength exercises)
        const setTime = ex.sets.reduce((setTotal, set) => {
          // 1 min for the set + 1 min rest
          return setTotal + 2;
        }, 0);
        return total + setTime;
      }

      return total;
    }, 0) || 0;

    // Calculate explicit workout duration or use calculated exercise duration
    const workoutDuration = workout.duration || exerciseDuration;

    // Calculate calories for each exercise
    const exerciseCalories = workout.exercises?.reduce((total, ex) => {
      const exerciseDuration = ex.duration || (ex.sets?.length * 2) || 0;
      return total + calculateCalories(ex.name, exerciseDuration);
    }, 0) || 0;

    return {
      totalDuration: acc.totalDuration + workoutDuration,
      totalCalories: acc.totalCalories + (workout.caloriesBurned || exerciseCalories),
      totalSets: acc.totalSets + (workout.exercises?.reduce((sets, ex) => 
        sets + (ex.sets?.length || 0), 0) || 0),
      totalWeight: acc.totalWeight + (workout.exercises?.reduce((weight, ex) => {
        return weight + (ex.sets?.reduce((setWeight, set) => 
          setWeight + ((set.reps || 0) * (set.weight || 0)), 0) || 0)
      }, 0) || 0),
      totalDistance: acc.totalDistance + (workout.exercises?.reduce((dist, ex) => 
        dist + (ex.distance || 0), 0) || 0),
      exerciseTypes: [...acc.exerciseTypes, ...(workout.exercises?.map(ex => ex.name) || [])],
    };
  }, {
    totalDuration: 0,
    totalCalories: 0,
    totalSets: 0,
    totalWeight: 0,
    totalDistance: 0,
    exerciseTypes: [],
  });

  // Format duration into hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  // Remove duplicate exercise types
  summary.exerciseTypes = [...new Set(summary.exerciseTypes)];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Exercise Summary</h3>
      
      <div className="space-y-6">
        {/* Main metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Total Duration</p>
            <p className="font-medium text-gray-800">{formatDuration(summary.totalDuration)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Calories Burned</p>
            <p className="font-medium text-gray-800">{summary.totalCalories} kcal</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Sets</p>
            <p className="font-medium text-gray-800">{summary.totalSets}</p>
          </div>
          {summary.totalWeight > 0 && (
            <div>
              <p className="text-gray-500 text-sm">Weight Lifted</p>
              <p className="font-medium text-gray-800">{summary.totalWeight} kg</p>
            </div>
          )}
          {summary.totalDistance > 0 && (
            <div>
              <p className="text-gray-500 text-sm">Distance Covered</p>
              <p className="font-medium text-gray-800">{summary.totalDistance} km</p>
            </div>
          )}
        </div>

        {/* Exercise types section */}
        {summary.exerciseTypes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises Performed:</h4>
            <div className="flex flex-wrap gap-2">
              {summary.exerciseTypes.map((type, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Individual workout details */}
        <div className="space-y-2">
          {workouts.map((workout, index) => (
            <div key={index} className="text-sm border-t pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-600 font-medium capitalize">{workout.type}</span>
                  {workout.duration > 0 && (
                    <span className="text-gray-500 ml-2">({workout.duration} mins)</span>
                  )}
                </div>
                {workout.caloriesBurned > 0 && (
                  <span className="text-gray-700">{workout.caloriesBurned} kcal</span>
                )}
              </div>
              {workout.exercises && workout.exercises.length > 0 && (
                <div className="ml-4 mt-1 text-gray-500">
                  {workout.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="text-xs">
                      {exercise.name} - {
                        exercise.type === 'cardio' ? 
                          `${exercise.distance || 0}km` :
                        exercise.type === 'flexibility' ?
                          `${exercise.duration || 0} mins` :
                        exercise.sets?.length ?
                          `${exercise.sets.length} sets × ${exercise.sets[0]?.reps || 0} reps` :
                          'No data'
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};