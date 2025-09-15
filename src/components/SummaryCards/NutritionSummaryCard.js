export const NutritionSummaryCard = ({ meals }) => {
  const totalCalories = Object.values(meals).reduce((acc, meal) => acc + meal.calories, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Nutrition Summary</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Calories</span>
          <span className="font-medium text-gray-800">{totalCalories} kcal</span>
        </div>

        <div className="space-y-2">
          {Object.entries(meals).map(([mealType, meal]) => (
            <div key={mealType} className="flex justify-between text-sm">
              <span className="text-gray-500 capitalize">
                {mealType.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-gray-700">{meal.calories} kcal</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};