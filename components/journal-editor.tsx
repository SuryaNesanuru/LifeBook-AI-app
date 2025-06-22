'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Quote,
  Type,
  Lightbulb,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { makeAuthenticatedRequest } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function JournalEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [reflectionPrompt, setReflectionPrompt] = useState('');
  const [currentDate] = useState(new Date());
  const { user } = useAuth();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setWordCount(content.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [content]);

  useEffect(() => {
    generateReflectionPrompt();
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await makeAuthenticatedRequest('/api/entries', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content]);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (title.trim() && content.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, autoSave]);

  const generateReflectionPrompt = async () => {
    try {
      const response = await fetch('/api/reflection-prompt');
      const data = await response.json();
      setReflectionPrompt(data.prompt);
    } catch (error) {
      console.error('Failed to generate reflection prompt:', error);
      setReflectionPrompt('What made you feel most alive today?');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    setIsLoading(true);
    
    try {
      await makeAuthenticatedRequest('/api/entries', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      toast.success('Entry saved successfully!');
      setTitle('');
      setContent('');
      setLastSaved(new Date());
    } catch (error) {
      toast.error('Failed to save entry');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + 
                   prefix + selectedText + suffix + 
                   content.substring(end);
    
    setContent(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Write Your Story</h1>
              <p className="text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{wordCount} words</span>
                {isSaving && <span className="text-amber-600">Saving...</span>}
                {lastSaved && !isSaving && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Saved {format(lastSaved, 'h:mm a')}</span>
                  </div>
                )}
              </div>
              <Button onClick={handleSave} disabled={isLoading || isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
          
          <Input
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>

        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('\n# ', '')}
              title="Heading"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('\n- ', '')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('\n1. ', '')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertFormatting('\n> ', '')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <Textarea
            ref={contentRef}
            placeholder="Start writing your thoughts... Let your mind flow freely and capture this moment in your life story."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full resize-none border-0 focus-visible:ring-0 text-base leading-relaxed"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-muted/30">
        <div className="p-6 space-y-6">
          {/* Reflection Prompt */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Reflection Prompt</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {reflectionPrompt || 'What made you feel most alive today?'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateReflectionPrompt}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </Card>

          {/* Writing Tips */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Writing Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">•</span>
                <span>Write freely without self-censorship</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">•</span>
                <span>Focus on how events made you feel</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">•</span>
                <span>Include specific details and moments</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">•</span>
                <span>End with what you learned or realized</span>
              </li>
            </ul>
          </Card>

          {/* Auto-save Status */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Auto-save</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500' : lastSaved ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>
                  {isSaving 
                    ? 'Saving changes...' 
                    : lastSaved 
                      ? `Last saved at ${format(lastSaved, 'h:mm a')}`
                      : 'Start writing to auto-save'
                  }
                </span>
              </div>
              <p className="text-xs">
                Your entries are automatically saved as you write.
              </p>
            </div>
          </Card>

          {/* Today's Memories */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">This Day in History</h3>
            <p className="text-sm text-muted-foreground">
              We'll show memories from previous years once you've been journaling for a while!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}