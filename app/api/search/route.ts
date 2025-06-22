import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
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

    // Search in title and content
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Add highlighting to results
    const results = entries.map(entry => {
      const regex = new RegExp(`(${query})`, 'gi');
      const highlight = entry.content.length > 200 
        ? entry.content.substring(0, 200) + '...'
        : entry.content;
      
      return {
        ...entry,
        highlight: highlight.replace(regex, '<mark>$1</mark>'),
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET /api/search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}