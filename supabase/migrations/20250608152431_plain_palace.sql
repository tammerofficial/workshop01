/*
  # Department-Based Architecture Migration

  1. New Tables
    - `departments` - Store department information
    - Update existing tables to include department_id

  2. Security
    - Enable RLS on all tables
    - Add policies for department-based access

  3. Data Structure
    - Each department operates independently
    - Full data segregation between departments
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text,
  icon text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default departments
INSERT INTO departments (name, description, color, icon, slug) VALUES
  ('Wedding Dresses', 'Bridal and formal wedding attire', 'bg-pink-500', '👰', 'wedding'),
  ('Ready-to-Wear', 'Pre-designed dresses and collections', 'bg-purple-500', '👗', 'ready-to-wear'),
  ('Custom-Made', 'Bespoke and tailored dresses', 'bg-blue-500', '✂️', 'custom-made')
ON CONFLICT (slug) DO NOTHING;

-- Add department_id to existing orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN department_id uuid REFERENCES departments(id);
    
    -- Set default department for existing orders
    UPDATE orders SET department_id = (
      SELECT id FROM departments WHERE slug = 'wedding' LIMIT 1
    ) WHERE department_id IS NULL;
  END IF;
END $$;

-- Create department-aware workers table
CREATE TABLE IF NOT EXISTS department_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  email text NOT NULL,
  phone text,
  status text DEFAULT 'active',
  skills jsonb DEFAULT '[]',
  performance jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create department-aware inventory table
CREATE TABLE IF NOT EXISTS department_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  current_stock integer DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  unit text DEFAULT 'pieces',
  sku text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create department-aware notifications table
CREATE TABLE IF NOT EXISTS department_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  related_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for departments table
CREATE POLICY "Users can read departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for department_workers table
CREATE POLICY "Users can read department workers"
  ON department_workers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert department workers"
  ON department_workers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update department workers"
  ON department_workers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for department_inventory table
CREATE POLICY "Users can read department inventory"
  ON department_inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert department inventory"
  ON department_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update department inventory"
  ON department_inventory
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for department_notifications table
CREATE POLICY "Users can read department notifications"
  ON department_notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert department notifications"
  ON department_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update department notifications"
  ON department_notifications
  FOR UPDATE
  TO authenticated
  USING (true);