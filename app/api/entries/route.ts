import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeSentiment } from '@/lib/openai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (month) {
      const startDate = new Date(parseInt(year || new Date().getFullYear().toString()), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year || new Date().getFullYear().toString()), parseInt(month), 0);
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    }

    const { data: entries, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate word count
    const wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;

    // Analyze sentiment
    const sentiment = await analyzeSentiment(content);

    // Create entry
    const { data: entry, error } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        title,
        content,
        word_count: wordCount,
        sentiment_score: sentiment.score,
        sentiment_label: sentiment.label,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}