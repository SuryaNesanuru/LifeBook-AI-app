'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Calendar, Clock, Heart, Sparkles, History } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  sentiment_label: string;
  created_at: string;
  highlight?: string;
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [memoryEntry, setMemoryEntry] = useState<SearchResult | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(true);

  useEffect(() => {
    fetchTodayMemory();
  }, []);

  const fetchTodayMemory = async () => {
    setMemoryLoading(true);
    try {
      const response = await fetch('/api/memories/today', {
        headers: {
          'Authorization': `Bearer ${(await fetch('/api/auth/session')).headers.get('Authorization')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMemoryEntry(data);
      }
    } catch (error) {
      console.error('Failed to fetch today memory:', error);
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${(await fetch('/api/auth/session')).headers.get('Authorization')}`,
        },
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Search & Memories</h1>
            <p className="text-muted-foreground">Rediscover your thoughts and moments</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your journal entries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? <LoadingSpinner /> : 'Search'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto custom-scrollbar">
        <div className="space-y-6">
          {/* This Day in History */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle>This Day in Your History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {memoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : memoryEntry ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{memoryEntry.title}</h3>
                    <Badge variant="outline" className={getSentimentColor(memoryEntry.sentiment_label)}>
                      {memoryEntry.sentiment_label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {memoryEntry.content.length > 200 
                      ? memoryEntry.content.substring(0, 200) + '...'
                      : memoryEntry.content
                    }
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(memoryEntry.created_at), 'MMMM d, yyyy')}
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(memoryEntry.created_at), 'h:mm a')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No memories for today</h3>
                  <p className="text-muted-foreground">
                    Keep journaling! Memories from previous years will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          {query && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Search Results {results.length > 0 && `(${results.length})`}
                </h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : results.length === 0 && query ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try different keywords or check your spelling.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <Card key={result.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg">{result.title}</h3>
                            <Badge variant="outline" className={getSentimentColor(result.sentiment_label)}>
                              {result.sentiment_label}
                            </Badge>
                          </div>
                          <div 
                            className="text-muted-foreground mb-3"
                            dangerouslySetInnerHTML={{ __html: result.highlight || result.content }}
                          />
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(result.created_at), 'MMMM d, yyyy')}
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(result.created_at), 'h:mm a')}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Quick Search Suggestions */}
          {!query && !loading && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Search</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'happy moments',
                  'family',
                  'work',
                  'goals',
                  'challenges',
                  'grateful',
                  'achievement',
                  'friends',
                  'travel'
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch();
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}