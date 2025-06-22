import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSummary } from '@/lib/openai';
import { startOfMonth, endOfMonth, format, subDays, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last30days';

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

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'last7days':
        startDate = subDays(endDate, 7);
        break;
      case 'last3months':
        startDate = subMonths(endDate, 3);
        break;
      case 'last6months':
        startDate = subMonths(endDate, 6);
        break;
      case 'lastyear':
        startDate = subMonths(endDate, 12);
        break;
      default: // last30days
        startDate = subDays(endDate, 30);
    }

    // Fetch entries in date range
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        monthlyData: [],
        weeklyData: [],
        topWords: [],
        summary: '',
      });
    }

    // Calculate analytics
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
    const averageWordsPerEntry = Math.round(totalWords / totalEntries);

    // Sentiment distribution
    const sentimentDistribution = entries.reduce(
      (acc, entry) => {
        acc[entry.sentiment_label as keyof typeof acc]++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    // Monthly data
    const monthlyData = entries.reduce((acc: any[], entry) => {
      const month = format(new Date(entry.created_at), 'MMM yyyy');
      const existing = acc.find(item => item.month === month);
      
      if (existing) {
        existing.entries++;
        existing.words += entry.word_count || 0;
        existing.avgSentiment = (existing.avgSentiment + entry.sentiment_score) / 2;
      } else {
        acc.push({
          month,
          entries: 1,
          words: entry.word_count || 0,
          avgSentiment: entry.sentiment_score,
        });
      }
      
      return acc;
    }, []);

    // Weekly data for sentiment trend
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dayName = format(date, 'EEE');
      const dayEntries = entries.filter(entry => 
        format(new Date(entry.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const avgSentiment = dayEntries.length > 0 
        ? dayEntries.reduce((sum, entry) => sum + entry.sentiment_score, 0) / dayEntries.length
        : 0;

      weeklyData.push({
        day: dayName,
        entries: dayEntries.length,
        sentiment: avgSentiment,
      });
    }

    // Top words (simplified - in production, you'd want better text processing)
    const allText = entries.map(entry => entry.content).join(' ');
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['that', 'this', 'with', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word));
    
    const wordCount = words.reduce((acc: Record<string, number>, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Generate AI summary
    const summary = entries.length > 0 
      ? await generateSummary(entries.map(e => e.content), period)
      : '';

    return NextResponse.json({
      totalEntries,
      totalWords,
      averageWordsPerEntry,
      sentimentDistribution,
      monthlyData,
      weeklyData,
      topWords,
      summary,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}