import React, { useState } from 'react';

const foodDatabase = {
  breakfast: [
    { 
      name: "Oatmeal with Banana",
      calories: 310,
      nutrition: { protein: 8, carbs: 56, fats: 6 }
    },
    { 
      name: "Eggs and Toast",
      calories: 280,
      nutrition: { protein: 14, carbs: 28, fats: 12 }
    },
    // Add more breakfast items
  ],
  lunch: [
    {
      name: "Grilled Chicken Salad",
      calories: 380,
      nutrition: { protein: 32, carbs: 12, fats: 14 }
    },
    {
      name: "Turkey Sandwich",
      calories: 420,
      nutrition: { protein: 28, carbs: 48, fats: 16 }
    },
    // Add more lunch items
  ],
  dinner: [
    {
      name: "Salmon with Rice",
      calories: 520,
      nutrition: { protein: 36, carbs: 45, fats: 22 }
    },
    {
      name: "Pasta with Marinara",
      calories: 480,
      nutrition: { protein: 16, carbs: 88, fats: 8 }
    },
    // Add more dinner items
  ],
  snacks: [
    {
      name: "Apple with Peanut Butter",
      calories: 200,
      nutrition: { protein: 7, carbs: 28, fats: 8 }
    },
    {
      name: "Greek Yogurt",
      calories: 130,
      nutrition: { protein: 12, carbs: 8, fats: 4 }
    },
    // Add more snack items
  ]
};

export default function FoodSelector({ mealType, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    nutrition: { protein: '', carbs: '', fats: '' }
  });
  const [selectedPortion, setSelectedPortion] = useState('medium');

  const portions = {
    small: 0.7,
    medium: 1,
    large: 1.3
  };

  const filteredOptions = foodDatabase[mealType]?.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFoodSelect = (food) => {
    const portionMultiplier = portions[selectedPortion];
    const adjustedFood = {
      ...food,
      calories: Math.round(food.calories * portionMultiplier),
      nutrition: {
        protein: Math.round(food.nutrition.protein * portionMultiplier),
        carbs: Math.round(food.nutrition.carbs * portionMultiplier),
        fats: Math.round(food.nutrition.fats * portionMultiplier)
      }
    };
    onSelect(adjustedFood);
  };

  const handleCustomSubmit = () => {
    if (!customFood.name || !customFood.calories) return;
    onSelect({
      ...customFood,
      calories: parseInt(customFood.calories),
      nutrition: {
        protein: parseInt(customFood.nutrition.protein) || 0,
        carbs: parseInt(customFood.nutrition.carbs) || 0,
        fats: parseInt(customFood.nutrition.fats) || 0
      }
    });
    setShowCustomInput(false);
    setCustomFood({
      name: '',
      calories: '',
      nutrition: { protein: '', carbs: '', fats: '' }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search foods..."
          className="flex-1 px-4 py-2 rounded-lg border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedPortion}
          onChange={(e) => setSelectedPortion(e.target.value)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="max-h-60 overflow-y-auto border rounded-lg">
        {filteredOptions.map((food, index) => (
          <div
            key={index}
            onClick={() => handleFoodSelect(food)}
            className="p-3 hover:bg-blue-50 cursor-pointer border-b"
          >
            <div className="flex justify-between">
              <span className="font-medium">{food.name}</span>
              <span>{Math.round(food.calories * portions[selectedPortion])} cal</span>
            </div>
            <div className="text-sm text-gray-600">
              P: {food.nutrition.protein}g | C: {food.nutrition.carbs}g | F: {food.nutrition.fats}g
            </div>
          </div>
        ))}
      </div>

      {showCustomInput ? (
        <div className="space-y-2 p-3 border rounded-lg">
          <input
            type="text"
            placeholder="Food name"
            className="w-full px-3 py-2 border rounded"
            value={customFood.name}
            onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Calories"
              className="px-3 py-2 border rounded"
              value={customFood.calories}
              onChange={(e) => setCustomFood({...customFood, calories: e.target.value})}
            />
            <input
              type="number"
              placeholder="Protein (g)"
              className="px-3 py-2 border rounded"
              value={customFood.nutrition.protein}
              onChange={(e) => setCustomFood({
                ...customFood,
                nutrition: {...customFood.nutrition, protein: e.target.value}
              })}
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              className="px-3 py-2 border rounded"
              value={customFood.nutrition.carbs}
              onChange={(e) => setCustomFood({
                ...customFood,
                nutrition: {...customFood.nutrition, carbs: e.target.value}
              })}
            />
            <input
              type="number"
              placeholder="Fats (g)"
              className="px-3 py-2 border rounded"
              value={customFood.nutrition.fats}
              onChange={(e) => setCustomFood({
                ...customFood,
                nutrition: {...customFood.nutrition, fats: e.target.value}
              })}
            />
          </div>
          <button
            onClick={handleCustomSubmit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Custom Food
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCustomInput(true)}
          className="text-blue-600 text-sm"
        >
          + Add Custom Food
        </button>
      )}
    </div>
  );
}