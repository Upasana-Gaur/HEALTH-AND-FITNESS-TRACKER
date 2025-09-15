// Nutritionix API credentials (direct use)
const NUTRITIONIX_APP_ID = "64516e5c";
const NUTRITIONIX_API_KEY = "715520ebe510dae4ab9ed5d545d7df76";

const analyzeMeal = async (mealType, items) => {
  try {
    const prompt = `Analyze the following ${mealType} items and provide detailed nutrition information:
      ${items.map(item => `${item.portion} ${item.unit} of ${item.name}`).join(', ')}
      
      Return a JSON object with:
      1. Total nutrition for the whole meal
      2. Individual item breakdown
      3. Specific details about each item (e.g., type of dal, cooking method)
      4. Any relevant dietary notes`;

    const aiResponse = await fetch('/api/nutrition/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        mealType,
        items
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to analyze meal');
    }

    const analysis = await aiResponse.json();
    return analysis;
  } catch (error) {
    console.error('Meal Analysis Error:', error);
    return null;
  }
};

export const getNutritionInfo = async (query, portion, unit, forceNutritionix = false) => {
  try {
    // Always try Nutritionix first
    const nutritionixResponse = await fetch(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          query: `${portion} ${unit} ${query}`,
        }),
      }
    );

    if (nutritionixResponse.ok) {
      const data = await nutritionixResponse.json();
      return {
        calories: data.foods[0].nf_calories,
        protein: data.foods[0].nf_protein,
        carbs: data.foods[0].nf_total_carbohydrate,
        fat: data.foods[0].nf_total_fat,
        source: 'nutritionix'
      };
    }

    if (forceNutritionix) {
      throw new Error('Food not found in database');
    }

    throw new Error('Unable to analyze food nutrition');

  } catch (error) {
    console.error('Nutrition API Error:', error);
    throw error;
  }
};
