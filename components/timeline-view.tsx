'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Heart, Frown, Smile, Meh } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subYears } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Entry {
  id: string;
  title: string;
  content: string;
  sentiment_score: number;
  sentiment_label: string;
  word_count: number;
  created_at: string;
}

export function TimelineView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    fetchEntries();
  }, [selectedMonth, selectedYear]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = '/api/entries';
      const params = new URLSearchParams();
      
      if (selectedMonth !== 'all') {
        params.append('month', selectedMonth);
      }
      if (selectedYear !== 'all') {
        params.append('year', selectedYear);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const groupedEntries = Array.isArray(entries)
  ? entries.reduce((acc, entry) => {
      const date = format(new Date(entry.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, Entry[]>)
  : {};

const months = eachMonthOfInterval({
  start: subYears(new Date(), 2),
  end: new Date(),
});


  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Your Life Timeline</h1>
            <p className="text-muted-foreground">Journey through your memories</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.toISOString()} value={format(month, 'MM')}>
                    {format(month, 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 p-6">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : Object.keys(groupedEntries).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entries found</h3>
              <p className="text-muted-foreground">
                Start writing to see your timeline come to life!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEntries)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, dayEntries]) => (
                  <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="flex items-center mb-4">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {format(new Date(date), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex-1 h-px bg-border ml-4" />
                    </div>

                    {/* Entries for the day */}
                    <div className="space-y-4 ml-4">
                      {dayEntries.map((entry) => (
                        <Card key={entry.id} className="timeline-item hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{entry.title}</CardTitle>
                              <div className="flex items-center space-x-2">
                                {getSentimentIcon(entry.sentiment_label)}
                                <Badge 
                                  variant="outline" 
                                  className={getSentimentColor(entry.sentiment_label)}
                                >
                                  {entry.sentiment_label}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-3 line-clamp-3">
                              {entry.content}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(new Date(entry.created_at), 'h:mm a')}
                              <span className="mx-2">•</span>
                              {entry.word_count} words
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}