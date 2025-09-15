import { useState } from 'react';

export const MealTracker = ({ meals, onChange }) => {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', calories: '', portion: '' });

  const handleAddItem = (mealType) => {
    if (!newItem.name || !newItem.calories) return;

    const updatedMeals = {
      ...meals,
      [mealType]: {
        ...meals[mealType],
        items: [
          ...meals[mealType].items,
          { ...newItem }
        ],
        calories: meals[mealType].calories + parseInt(newItem.calories)
      }
    };

    onChange(updatedMeals);
    setNewItem({ name: '', calories: '', portion: '' });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Meal Tracking</h3>
      
      {Object.entries(meals).map(([mealType, meal]) => (
        <div key={mealType} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700 capitalize">
              {mealType.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <input
              type="time"
              value={meal.time}
              onChange={(e) => {
                onChange({
                  ...meals,
                  [mealType]: { ...meal, time: e.target.value }
                });
              }}
              className="text-sm border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Meal Items List */}
          <div className="space-y-2 mb-4">
            {meal.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.name} ({item.portion})</span>
                <span className="text-gray-700">{item.calories} kcal</span>
              </div>
            ))}
          </div>

          {/* Add New Item Form */}
          {selectedMeal === mealType && (
            <div className="space-y-2 border-t pt-4">
              <input
                type="text"
                placeholder="Food item"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Portion"
                  value={newItem.portion}
                  onChange={(e) => setNewItem({ ...newItem, portion: e.target.value })}
                  className="text-sm border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={newItem.calories}
                  onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                  className="text-sm border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <button
                onClick={() => {
                  handleAddItem(mealType);
                  setSelectedMeal(null);
                }}
                className="w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Add Item
              </button>
            </div>
          )}

          {selectedMeal !== mealType && (
            <button
              onClick={() => setSelectedMeal(mealType)}
              className="w-full mt-2 bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              + Add Food Item
            </button>
          )}
        </div>
      ))}
    </div>
  );
};