'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Heart, 
  BookOpen, 
  Calendar,
  Sparkles,
  Download,
  FileText
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WordCloudComponent } from '@/components/word-cloud';
import { ExportDialog } from '@/components/export-dialog';
import { makeAuthenticatedRequest } from '@/lib/auth';

interface AnalyticsData {
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  monthlyData: Array<{
    month: string;
    entries: number;
    words: number;
    avgSentiment: number;
  }>;
  weeklyData: Array<{
    day: string;
    entries: number;
    sentiment: number;
  }>;
  topWords: Array<{
    word: string;
    count: number;
  }>;
  summary: string;
}

export function AnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('last30days');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`/api/analytics?period=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const sentimentColors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#f59e0b',
  };

  const sentimentData = analytics && analytics.sentimentDistribution ? [
  { name: 'Positive', value: analytics.sentimentDistribution.positive, color: sentimentColors.positive },
  { name: 'Neutral', value: analytics.sentimentDistribution.neutral, color: sentimentColors.neutral },
  { name: 'Negative', value: analytics.sentimentDistribution.negative, color: sentimentColors.negative },
] : [];


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data available</h3>
          <p className="text-muted-foreground">Start journaling to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Insights</h1>
            <p className="text-muted-foreground">Discover patterns in your life story</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last3months">Last 3 months</SelectItem>
                <SelectItem value="last6months">Last 6 months</SelectItem>
                <SelectItem value="lastyear">Last year</SelectItem>
              </SelectContent>
            </Select>
            <ExportDialog>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </ExportDialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto custom-scrollbar">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalEntries > 0 ? 'Keep writing your story!' : 'Start writing!'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
<div className="text-2xl font-bold">
  {analytics.totalWords ? analytics.totalWords.toLocaleString() : 0}
</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.averageWordsPerEntry} avg per entry
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalEntries > 0 
                    ? Math.round((analytics.sentimentDistribution.positive / analytics.totalEntries) * 100)
                    : 0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of your entries are positive
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Days in a row
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Distribution */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Writing Activity */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Writing Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="entries" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Word Cloud and AI Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Word Cloud */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Most Used Words</CardTitle>
              </CardHeader>
              <CardContent>
                <WordCloudComponent words={analytics.topWords} />
              </CardContent>
            </Card>

            {/* AI Summary */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle>AI Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {analytics.summary || 'Your AI-generated summary will appear here once you have more entries. Keep writing to unlock deeper insights into your life story!'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Trend */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Sentiment Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}