'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpen, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back to LifeBook!');
      } else {
        await signUp(email, password);
        toast.success('Welcome to LifeBook! Please check your email to verify your account.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <BookOpen className="h-16 w-16 text-primary" />
              <Heart className="h-6 w-6 text-accent absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LifeBook
          </h1>
          <p className="text-muted-foreground mt-2">
            Transform your daily reflections into a beautiful life story
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">AI-powered insights</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Beautiful timeline view</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Emotional intelligence</span>
          </div>
        </div>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to continue your journey' 
                : 'Start your journaling journey today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}