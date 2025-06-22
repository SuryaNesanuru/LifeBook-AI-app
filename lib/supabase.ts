import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          sentiment_score: number;
          sentiment_label: string;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          sentiment_score?: number;
          sentiment_label?: string;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          sentiment_score?: number;
          sentiment_label?: string;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          period: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          period: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          period?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};