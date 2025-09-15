import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(request) {
  try {
    if (!request.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { prompt, mealType, items } = await request.json();

    if (!prompt || !mealType || !items) {
      return NextResponse.json({ 
        error: 'Missing required fields: prompt, mealType, items' 
      }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert specializing in ${mealType} analysis. 
                   Analyze Indian and international dishes, providing accurate nutritional data.
                   Focus on calories, proteins, carbs, fats, and portion sizes.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    
    return NextResponse.json({
      success: true,
      data: analysis,
      mealType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      success: false
    }, { 
      status: error.status || 500 
    });
  }
}