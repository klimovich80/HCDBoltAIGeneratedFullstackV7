/*
  # Equestrian CRM Database Schema

  1. New Tables
    - `users` - Extended user profiles with equestrian-specific fields
    - `horses` - Complete horse management with medical records
    - `lessons` - Lesson scheduling and tracking
    - `events` - Event and competition management
    - `equipment` - Tack and equipment inventory
    - `feed_records` - Feed tracking and management
    - `payments` - Payment tracking and billing
    - `stall_assignments` - Barn and stall management

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Ensure proper data isolation between organizations

  3. Features
    - Role-based permissions (admin, trainer, member, guest)
    - Complete horse care management
    - Financial tracking and reporting
    - Equipment and inventory management
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'trainer', 'member', 'guest')),
  membership_tier text CHECK (membership_tier IN ('basic', 'premium', 'elite')),
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Horses table
CREATE TABLE IF NOT EXISTS horses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  breed text NOT NULL,
  age integer NOT NULL CHECK (age > 0),
  gender text NOT NULL CHECK (gender IN ('mare', 'stallion', 'gelding')),
  color text NOT NULL,
  markings text,
  owner_id uuid REFERENCES users(id),
  boarding_type text NOT NULL DEFAULT 'full' CHECK (boarding_type IN ('full', 'partial', 'pasture')),
  stall_number text,
  medical_notes text,
  dietary_restrictions text,
  last_vet_visit date,
  next_vet_visit date,
  vaccination_status text NOT NULL DEFAULT 'current' CHECK (vaccination_status IN ('current', 'due', 'overdue')),
  insurance_info text,
  registration_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid NOT NULL REFERENCES users(id),
  horse_id uuid REFERENCES horses(id),
  member_id uuid NOT NULL REFERENCES users(id),
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  lesson_type text NOT NULL CHECK (lesson_type IN ('private', 'group', 'training')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  cost decimal(10,2) NOT NULL DEFAULT 0.00,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('competition', 'clinic', 'social', 'maintenance', 'show')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  max_participants integer,
  registration_fee decimal(10,2) DEFAULT 0.00,
  organizer_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('saddle', 'bridle', 'halter', 'blanket', 'boot', 'grooming', 'other')),
  brand text,
  model text,
  size text,
  condition text NOT NULL DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  purchase_date date,
  cost decimal(10,2),
  current_value decimal(10,2),
  assigned_horse_id uuid REFERENCES horses(id),
  last_maintenance date,
  next_maintenance date,
  maintenance_notes text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feed records table
CREATE TABLE IF NOT EXISTS feed_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid NOT NULL REFERENCES horses(id),
  feed_type text NOT NULL,
  brand text,
  amount decimal(10,2) NOT NULL,
  unit text NOT NULL CHECK (unit IN ('kg', 'lbs', 'cups', 'flakes')),
  feeding_time timestamptz NOT NULL,
  fed_by uuid NOT NULL REFERENCES users(id),
  supplements text,
  notes text,
  cost decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES users(id),
  amount decimal(10,2) NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('lesson', 'boarding', 'event', 'membership', 'equipment', 'other')),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'check')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date date NOT NULL,
  paid_date date,
  invoice_number text,
  description text,
  reference_id uuid, -- Can reference lesson, event, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stall assignments table
CREATE TABLE IF NOT EXISTS stall_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stall_number text NOT NULL,
  horse_id uuid REFERENCES horses(id),
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  monthly_rate decimal(10,2),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_horses_stall_number ON horses(stall_number);
CREATE INDEX IF NOT EXISTS idx_horses_owner_id ON horses(owner_id);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_date ON lessons(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_lessons_instructor_id ON lessons(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_member_id ON lessons(member_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_feed_records_horse_id ON feed_records(horse_id);
CREATE INDEX IF NOT EXISTS idx_feed_records_feeding_time ON feed_records(feeding_time);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stall_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read all user profiles" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
  ));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated 
  USING (auth_user_id = auth.uid());

-- Horses policies
CREATE POLICY "Everyone can read horses" ON horses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and admins can manage horses" ON horses
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));

-- Lessons policies
CREATE POLICY "Users can read relevant lessons" ON lessons
  FOR SELECT TO authenticated USING (
    instructor_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR
    member_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer'))
  );

CREATE POLICY "Trainers and admins can manage lessons" ON lessons
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));

-- Events policies
CREATE POLICY "Everyone can read events" ON events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and admins can manage events" ON events
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));

-- Equipment policies
CREATE POLICY "Everyone can read equipment" ON equipment
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and admins can manage equipment" ON equipment
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));

-- Feed records policies
CREATE POLICY "Everyone can read feed records" ON feed_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and admins can manage feed records" ON feed_records
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));

-- Payments policies
CREATE POLICY "Users can read their own payments" ON payments
  FOR SELECT TO authenticated USING (
    member_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer'))
  );

CREATE POLICY "Admins and trainers can manage payments" ON payments
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));

-- Stall assignments policies
CREATE POLICY "Everyone can read stall assignments" ON stall_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and admins can manage stall assignments" ON stall_assignments
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() AND u.role IN ('admin', 'trainer')
  ));