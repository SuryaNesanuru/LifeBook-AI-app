import { NextResponse } from 'next/server';
import { generateReflectionPrompt } from '@/lib/openai';

export async function GET() {
  try {
    const prompt = await generateReflectionPrompt();
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('GET /api/reflection-prompt error:', error);
    return NextResponse.json({ 
      prompt: 'What made you feel most alive today?' 
    });
  }
}