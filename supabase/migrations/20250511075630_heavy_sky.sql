/*
  # Create orders table for POS integration

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `product_type` (text)
      - `measurements` (jsonb)
      - `unique_code` (text, unique)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for authenticated users to read/write orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  product_type text NOT NULL,
  measurements jsonb NOT NULL,
  unique_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all orders
CREATE POLICY "Users can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert orders
CREATE POLICY "Users can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their orders
CREATE POLICY "Users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);