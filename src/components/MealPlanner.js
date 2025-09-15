import React, { useState } from 'react';
import { YouTubeEmbed } from './YouTubeEmbed';

const mealTemplates = {
  weightLoss: {
    name: 'Weight Loss Meal Plan',
    description: 'A calorie-deficit meal plan focused on lean proteins and vegetables',
    targetCalories: '1500-1800',
    meals: {
      breakfast: [
        {
          name: 'Oatmeal with berries',
          calories: 300,
          protein: '10g',
          recipe: {
            ingredients: ['1 cup oats', '1 cup mixed berries', '1 tbsp honey', '1 cup almond milk'],
            instructions: ['Cook oats with almond milk', 'Top with berries and honey'],
            videoUrl: 'https://youtube.com/watch?v=healthyOatmeal',
            source: 'Healthy Breakfast Recipes'
          }
        },
        // ...more breakfast options
      ],
      lunch: [
        {
          name: 'Grilled chicken salad',
          calories: 400,
          protein: '35g',
          recipe: {
            ingredients: [
              '6 oz chicken breast',
              'Mixed greens',
              'Cherry tomatoes',
              'Cucumber',
              'Olive oil dressing'
            ],
            instructions: [
              'Grill chicken breast',
              'Mix vegetables',
              'Add dressing'
            ],
            videoUrl: 'https://youtube.com/watch?v=chickenSalad',
            source: 'Healthy Lunch Ideas'
          }
        }
      ]
      // ...similar structure for dinner and snacks
    }
  },
  maintenance: {
    name: 'Maintenance Meal Plan',
    description: 'Balanced nutrition to maintain current weight',
    targetCalories: '2000-2200',
    meals: {
      breakfast: [
        {
          name: 'Greek Yogurt Parfait',
          calories: 350,
          protein: '15g',
          recipe: {
            ingredients: ['1 cup Greek yogurt', '1/2 cup granola', '1 cup mixed berries', '1 tbsp honey'],
            instructions: ['Layer yogurt with granola and berries', 'Drizzle with honey'],
            videoUrl: 'https://youtube.com/watch?v=parfaitRecipe',
            source: 'Healthy Breakfast Ideas'
          }
        }
      ],
      lunch: [
        {
          name: 'Turkey Avocado Wrap',
          calories: 450,
          protein: '28g',
          recipe: {
            ingredients: ['Whole wheat wrap', '4 oz turkey breast', '1/2 avocado', 'Lettuce', 'Tomato'],
            instructions: ['Layer ingredients on wrap', 'Roll tightly'],
            videoUrl: 'https://youtube.com/watch?v=wrapRecipe',
            source: 'Quick Lunch Recipes'
          }
        }
      ],
      dinner: [
        {
          name: 'Baked Salmon with Quinoa',
          calories: 550,
          protein: '35g',
          recipe: {
            ingredients: ['6 oz salmon fillet', '1 cup quinoa', 'Broccoli', 'Lemon', 'Olive oil'],
            instructions: ['Bake salmon', 'Cook quinoa', 'Steam broccoli'],
            videoUrl: 'https://youtube.com/watch?v=salmonRecipe',
            source: 'Healthy Dinner Ideas'
          }
        }
      ]
    }
  },
  muscleGain: {
    name: 'Muscle Gain Meal Plan',
    description: 'High protein meals for muscle growth',
    targetCalories: '2500-3000',
    meals: {
      breakfast: [
        {
          name: 'Protein Pancakes',
          calories: 500,
          protein: '40g',
          recipe: {
            ingredients: ['2 scoops protein powder', '1 banana', '2 eggs', 'Oats'],
            instructions: ['Blend ingredients', 'Cook on griddle'],
            videoUrl: 'https://youtube.com/watch?v=proteinPancakes',
            source: 'Fitness Recipes'
          }
        }
      ],
      lunch: [
        {
          name: 'Chicken Rice Bowl',
          calories: 650,
          protein: '45g',
          recipe: {
            ingredients: ['8 oz chicken breast', '1 cup brown rice', 'Mixed vegetables'],
            instructions: ['Cook chicken', 'Prepare rice', 'Steam vegetables'],
            videoUrl: 'https://youtube.com/watch?v=chickenBowl',
            source: 'Bodybuilding Meals'
          }
        }
      ]
    }
  }
};

export default function MealPlanner() {
  const [selectedPlan, setSelectedPlan] = useState('maintenance'); // Set default plan
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    goal: 'maintenance',
    dietaryRestrictions: [],
    calorieTarget: 2000,
    mealsPerDay: 3
  });

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    // Calculate daily calorie needs based on user's profile and goal
    const calculatedCalories = calculateDailyCalories(userPreferences);
    adjustMealPlanCalories(calculatedCalories);
  };

  const RecipeModal = ({ recipe, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{recipe.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        
        {recipe.videoUrl && (
          <div className="aspect-video">
            <YouTubeEmbed url={recipe.videoUrl} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Ingredients</h4>
            <ul className="list-disc pl-4 space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Instructions</h4>
            <ol className="list-decimal pl-4 space-y-1">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Source: {recipe.source}
        </div>
      </div>
    </div>
  );

  // Add error handling for meal plan display
  const currentPlan = mealTemplates[selectedPlan];
  if (!currentPlan) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: Selected meal plan not found. Please choose a valid plan.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Preferences Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Customize Your Meal Plan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Goal</label>
            <select
              value={userPreferences.goal}
              onChange={(e) => {
                setUserPreferences(prev => ({...prev, goal: e.target.value}));
                setSelectedPlan(e.target.value);
              }}
              className="w-full rounded-lg border-gray-300"
            >
              <option value="maintenance">Maintenance</option>
              <option value="weightLoss">Weight Loss</option>
              <option value="muscleGain">Muscle Gain</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Daily Calories Target</label>
            <input
              type="number"
              value={userPreferences.calorieTarget}
              onChange={(e) => setUserPreferences(prev => ({...prev, calorieTarget: parseInt(e.target.value)}))}
              className="w-full rounded-lg border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Meal Plan Display */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">{currentPlan.name}</h3>
        <p className="text-gray-600 mb-6">{currentPlan.description}</p>
        
        {Object.entries(currentPlan.meals).map(([mealType, meals]) => (
          <div key={mealType} className="mb-6">
            <h3 className="text-lg font-semibold capitalize mb-3">{mealType}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meals.map((meal, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{meal.name}</h4>
                      <p className="text-sm text-gray-600">{meal.calories} calories | {meal.protein} protein</p>
                    </div>
                    <button
                      onClick={() => setSelectedRecipe(meal.recipe)}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}