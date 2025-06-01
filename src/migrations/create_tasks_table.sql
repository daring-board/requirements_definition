/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (text, primary key)
      - `step_data` (jsonb)
      - `completed_steps` (jsonb)
      - `progress` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `tasks` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  step_data JSONB NOT NULL,
  completed_steps JSONB NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (auth.uid() = id);
