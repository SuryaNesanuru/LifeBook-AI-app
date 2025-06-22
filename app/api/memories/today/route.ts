import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { format, subYears } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
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

    const today = new Date();
    const monthDay = format(today, 'MM-dd');
    
    // Look for entries from previous years on this same day
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .lt('created_at', subYears(today, 1).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }

    // Filter entries that match today's month and day
    const todayMemories = entries?.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return format(entryDate, 'MM-dd') === monthDay;
    });

    if (todayMemories && todayMemories.length > 0) {
      // Return the most recent memory from a previous year
      return NextResponse.json(todayMemories[0]);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error('GET /api/memories/today error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}