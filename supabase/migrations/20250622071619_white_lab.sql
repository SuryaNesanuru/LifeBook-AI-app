/*
  # Create summaries table for AI-generated content

  1. New Tables
    - `summaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text, entry/monthly/yearly)
      - `period` (text, date range or identifier)
      - `content` (text, AI-generated summary)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `summaries` table
    - Add policies for authenticated users to access their own summaries
*/

CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('entry', 'monthly', 'yearly')),
  period text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries"
  ON summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own summaries"
  ON summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
  ON summaries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS summaries_user_id_idx ON summaries(user_id);
CREATE INDEX IF NOT EXISTS summaries_type_idx ON summaries(type);
CREATE INDEX IF NOT EXISTS summaries_period_idx ON summaries(period);