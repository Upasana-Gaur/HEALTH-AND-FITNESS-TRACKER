import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const { query, portion, unit } = await request.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert. Provide nutrition information in JSON format."
        },
        {
          role: "user",
          content: `What are the nutrition facts for ${portion} ${unit} of ${query}? Return only JSON with calories, protein, carbs, and fat in grams.`
        }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(completion.choices[0].message.content);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}