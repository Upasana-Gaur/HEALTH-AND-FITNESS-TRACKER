import React, { useState } from 'react';
import { getNutritionInfo } from '@/utils/nutritionAPI';

export const FoodSelector = ({ meal, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState('single'); // 'single' or 'multiple'
  const [newFood, setNewFood] = useState({
    name: '',
    portion: {
      amount: '',
      unit: 'g'
    },
    nutrition: null
  });
  const [multipleInput, setMultipleInput] = useState('');

  const handleGetNutrition = async () => {
    if (!newFood.name || !newFood.portion.amount) {
      setError('Please enter food name and portion');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const nutritionInfo = await getNutritionInfo(
        newFood.name,
        newFood.portion.amount,
        newFood.portion.unit,
        true
      );

      if (!nutritionInfo) {
        throw new Error('Could not fetch nutrition information');
      }

      return nutritionInfo;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (!newFood.name || !newFood.portion.amount) {
      setError('Please enter food name and portion');
      return;
    }

    const nutritionInfo = await handleGetNutrition();
    if (!nutritionInfo) return;

    const foodItem = {
      name: newFood.name,
      portion: `${newFood.portion.amount} ${newFood.portion.unit}`,
      calories: nutritionInfo.calories || 0,
      protein: nutritionInfo.protein || 0,
      carbs: nutritionInfo.carbs || 0,
      fat: nutritionInfo.fat || 0,
      source: nutritionInfo.source || 'manual'
    };

    onChange({
      ...meal,
      items: [...meal.items, foodItem],
      calories: meal.calories + (foodItem.calories || 0)
    });

    // Reset form
    setNewFood({
      name: '',
      portion: {
        amount: '',
        unit: 'g'
      },
      nutrition: null
    });
    setError(null);
  };

  const handleMultipleInput = async () => {
    if (!multipleInput.trim()) {
      setError('Please enter food items');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Split and parse items with better regex
      const items = multipleInput
        .split(',')
        .map(item => {
          const parts = item.trim().match(/^([\w\s]+?)(?:\s+(\d*\.?\d+)\s*(\w+))?$/);
          if (!parts) {
            throw new Error(`Invalid format for item: ${item.trim()}`);
          }
          
          return {
            name: parts[1].trim(),
            portion: {
              amount: parts[2] || '1',
              unit: parts[3] || 'serving'
            }
          };
        });

      // Process each item individually for better reliability
      const processedItems = await Promise.all(
        items.map(async (item) => {
          const nutritionInfo = await getNutritionInfo(
            item.name,
            item.portion.amount,
            item.portion.unit,
            true
          );

          if (!nutritionInfo) {
            throw new Error(`Could not fetch nutrition info for: ${item.name}`);
          }

          return {
            name: item.name,
            portion: `${item.portion.amount} ${item.portion.unit}`,
            calories: nutritionInfo.calories || 0,
            protein: nutritionInfo.protein || 0,
            carbs: nutritionInfo.carbs || 0,
            fat: nutritionInfo.fat || 0,
            source: nutritionInfo.source || 'manual'
          };
        })
      );

      onChange({
        ...meal,
        items: [...meal.items, ...processedItems],
        calories: meal.calories + processedItems.reduce(
          (sum, item) => sum + (item.calories || 0), 
          0
        )
      });

      setMultipleInput('');
      setError(null);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">{meal.type || 'Meal'}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setInputMode('single')}
            className={`px-3 py-1 rounded-md ${
              inputMode === 'single' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Single Item
          </button>
          <button
            onClick={() => setInputMode('multiple')}
            className={`px-3 py-1 rounded-md ${
              inputMode === 'multiple' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Multiple Items
          </button>
        </div>
      </div>

      {inputMode === 'single' ? (
        // Existing single input form
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Food name"
            value={newFood.name}
            className={`col-span-3 rounded-md border ${error ? 'border-red-300' : 'border-gray-300'}`}
            onChange={(e) => {
              setError(null);
              setNewFood(prev => ({ ...prev, name: e.target.value }));
            }}
          />
          
          <input
            type="number"
            placeholder="Amount"
            value={newFood.portion.amount}
            className={`rounded-md border ${error ? 'border-red-300' : 'border-gray-300'}`}
            onChange={(e) => {
              setError(null);
              setNewFood(prev => ({
                ...prev,
                portion: { ...prev.portion, amount: e.target.value }
              }));
            }}
          />
          
          <select
            value={newFood.portion.unit}
            onChange={(e) => {
              setError(null);
              setNewFood(prev => ({
                ...prev,
                portion: { ...prev.portion, unit: e.target.value }
              }));
            }}
            className="rounded-md border-gray-300"
          >
            <option value="g">grams</option>
            <option value="ml">milliliters</option>
            <option value="cup">cups</option>
            <option value="piece">pieces</option>
            <option value="serving">servings</option>
          </select>

          <button
            onClick={handleAddFood}
            disabled={loading}
            className="col-span-3 bg-blue-500 text-white py-2 px-4 rounded-md 
                     hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Add Food'}
          </button>

          {error && (
            <div className="col-span-3 text-red-500 text-sm mt-1">
              {error}
            </div>
          )}
        </div>
      ) : (
        // Multiple input form
        <div className="space-y-4">
          <textarea
            value={multipleInput}
            onChange={(e) => {
              setError(null);
              setMultipleInput(e.target.value);
            }}
            placeholder="Enter multiple food items separated by commas.&#10;Example: rice 1 cup, dal 2 serving, cucumber salad 100 g"
            className={`w-full h-32 rounded-md border ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <button
            onClick={handleMultipleInput}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md 
                     hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Analyzing...' : 'Add Items'}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {meal.items?.map((food, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
            <div>
              <span className="font-medium">{food.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({food.portion} - {food.calories.toFixed(0)} kcal)
              </span>
            </div>
            <button
              onClick={() => {
                const newItems = meal.items.filter((_, i) => i !== index);
                onChange({
                  ...meal,
                  items: newItems,
                  calories: newItems.reduce((sum, item) => sum + (item.calories || 0), 0)
                });
              }}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {meal.items?.length > 0 && (
        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Calories</span>
            <span className="font-medium text-gray-800">
              {meal.calories.toFixed(0)} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  );
};