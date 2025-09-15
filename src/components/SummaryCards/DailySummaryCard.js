export const DailySummaryCard = ({ data }) => {
  // Add null checks and default values
  const {
    meals = {},
    waterIntake = 0,
    workouts = [],
    sleep = {},
    wellness = {}
  } = data || {};

  // Calculate totals with null checks
  const totalCalories = Object.values(meals).reduce(
    (sum, meal) => sum + (meal?.calories || 0), 
    0
  );

  const totalWorkouts = workouts.length;
  const sleepDuration = sleep.duration || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Daily Summary
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Calories</span>
          <span className="font-medium">{totalCalories} kcal</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Water</span>
          <span className="font-medium">{waterIntake} ml</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Workouts</span>
          <span className="font-medium">{totalWorkouts}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sleep</span>
          <span className="font-medium">{sleepDuration} hrs</span>
        </div>
      </div>
    </div>
  );
};