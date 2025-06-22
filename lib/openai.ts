import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with a JSON object containing: score (number between -1 and 1), label (positive/negative/neutral), and confidence (0-1).',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 100,
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      score: result.score || 0,
      label: result.label || 'neutral',
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return {
      score: 0,
      label: 'neutral',
      confidence: 0.5,
    };
  }
}

export async function generateSummary(entries: string[], period: string): Promise<string> {
  try {
    const entriesText = entries.join('\n\n---\n\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a thoughtful life story writer. Create a beautiful, reflective summary of the user's journal entries for ${period}. Focus on growth, insights, patterns, and meaningful moments. Write in a warm, encouraging tone as if you're helping them see their life story unfold.`,
        },
        {
          role: 'user',
          content: entriesText,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Unable to generate summary at this time.';
  }
}

export async function generateReflectionPrompt(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a thoughtful, inspiring journal prompt that encourages deep reflection. Make it personal and engaging. Return only the prompt text.',
        },
        {
          role: 'user',
          content: 'Generate a reflection prompt for today.',
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.choices[0].message.content || 'What made you feel most alive today?';
  } catch (error) {
    console.error('Prompt generation error:', error);
    return 'What made you feel most alive today?';
  }
}