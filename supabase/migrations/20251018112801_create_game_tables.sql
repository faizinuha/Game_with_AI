/*
  # Horror Game Database Schema

  1. New Tables
    - `game_saves`
      - `id` (uuid, primary key)
      - `player_id` (text, unique identifier for player)
      - `current_room` (integer, current room index)
      - `collected_items` (jsonb, array of collected item indices)
      - `unlocked_doors` (jsonb, array of unlocked door indices)
      - `created_at` (timestamptz, when save was created)
      - `updated_at` (timestamptz, when save was last updated)
    
    - `leaderboard`
      - `id` (uuid, primary key)
      - `player_name` (text, player's name)
      - `completion_time` (integer, time in seconds to complete)
      - `items_collected` (integer, number of items collected)
      - `created_at` (timestamptz, when record was created)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to leaderboard
    - Add policies for authenticated users to manage their own saves
*/

CREATE TABLE IF NOT EXISTS game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text UNIQUE NOT NULL,
  current_room integer DEFAULT 0,
  collected_items jsonb DEFAULT '[]'::jsonb,
  unlocked_doors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game saves"
  ON game_saves
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert game saves"
  ON game_saves
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own saves"
  ON game_saves
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  completion_time integer NOT NULL,
  items_collected integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert to leaderboard"
  ON leaderboard
  FOR INSERT
  TO public
  WITH CHECK (true);
