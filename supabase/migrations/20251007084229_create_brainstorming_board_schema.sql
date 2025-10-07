/*
  # Brainstorming Board Schema

  Creates the database structure for a personal brainstorming board application with Kanban-style columns and AI-powered features.

  ## New Tables
  
  ### `columns`
  - `id` (uuid, primary key) - Unique identifier for each column
  - `user_id` (uuid, foreign key to auth.users) - Owner of the column
  - `name` (text) - Column name (e.g., "Ideas", "In Progress", "Completed")
  - `position` (integer) - Order position of the column
  - `created_at` (timestamptz) - When the column was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `idea_cards`
  - `id` (uuid, primary key) - Unique identifier for each card
  - `user_id` (uuid, foreign key to auth.users) - Owner of the card
  - `column_id` (uuid, foreign key to columns) - Which column contains this card
  - `title` (text) - Card title/content
  - `description` (text) - Optional detailed description
  - `position` (integer) - Order position within the column
  - `cluster_id` (uuid, nullable) - Optional cluster grouping identifier
  - `created_at` (timestamptz) - When the card was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `ai_suggestions`
  - `id` (uuid, primary key) - Unique identifier for each suggestion
  - `user_id` (uuid, foreign key to auth.users) - User who received the suggestion
  - `parent_card_id` (uuid, foreign key to idea_cards, nullable) - Card that triggered this suggestion
  - `suggestion_text` (text) - The AI-generated suggestion
  - `suggestion_type` (text) - Type: 'related_idea', 'cluster', 'summary'
  - `is_accepted` (boolean) - Whether user accepted the suggestion
  - `created_at` (timestamptz) - When the suggestion was generated

  ### `board_summaries`
  - `id` (uuid, primary key) - Unique identifier for each summary
  - `user_id` (uuid, foreign key to auth.users) - Board owner
  - `summary_text` (text) - AI-generated summary of the board
  - `key_themes` (jsonb) - Array of key themes identified
  - `top_ideas` (jsonb) - Array of top ideas
  - `created_at` (timestamptz) - When the summary was generated

  ## Security
  
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies restrict all operations to authenticated users viewing/modifying their own records
*/

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own columns"
  ON columns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own columns"
  ON columns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own columns"
  ON columns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own columns"
  ON columns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create idea_cards table
CREATE TABLE IF NOT EXISTS idea_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  column_id uuid REFERENCES columns(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  cluster_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE idea_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own idea cards"
  ON idea_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own idea cards"
  ON idea_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own idea cards"
  ON idea_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own idea cards"
  ON idea_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ai_suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_card_id uuid REFERENCES idea_cards(id) ON DELETE CASCADE,
  suggestion_text text NOT NULL,
  suggestion_type text NOT NULL,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI suggestions"
  ON ai_suggestions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI suggestions"
  ON ai_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI suggestions"
  ON ai_suggestions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI suggestions"
  ON ai_suggestions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create board_summaries table
CREATE TABLE IF NOT EXISTS board_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  summary_text text NOT NULL,
  key_themes jsonb DEFAULT '[]'::jsonb,
  top_ideas jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE board_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own board summaries"
  ON board_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own board summaries"
  ON board_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own board summaries"
  ON board_summaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_columns_user_id ON columns(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(user_id, position);
CREATE INDEX IF NOT EXISTS idx_idea_cards_user_id ON idea_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_cards_column_id ON idea_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_idea_cards_position ON idea_cards(column_id, position);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_board_summaries_user_id ON board_summaries(user_id);
