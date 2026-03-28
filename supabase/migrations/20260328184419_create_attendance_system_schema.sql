/*
  # Tuition Attendance System Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `role` (text, not null) - 'admin' or 'student'
      - `full_name` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `students`
      - `id` (uuid, primary key, references profiles)
      - `username` (text, unique, not null)
      - `phone` (text)
      - `parent_phone` (text)
      - `address` (text)
      - `created_at` (timestamptz)
    
    - `batches`
      - `id` (uuid, primary key)
      - `name` (text, not null) - e.g., "Evening 5 PM - 6 PM"
      - `start_time` (time, not null)
      - `end_time` (time, not null)
      - `days` (text[], not null) - array of days e.g., ['Monday', 'Tuesday']
      - `created_at` (timestamptz)
    
    - `student_batches`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `batch_id` (uuid, references batches)
      - `assigned_at` (timestamptz)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `batch_id` (uuid, references batches)
      - `date` (date, not null)
      - `status` (text, not null) - 'present' or 'absent'
      - `marked_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admin can access all data
    - Students can only access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'student')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY REFERENCES profiles ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  phone text,
  parent_phone text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "Admins can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  days text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view batches"
  ON batches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert batches"
  ON batches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update batches"
  ON batches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete batches"
  ON batches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create student_batches table
CREATE TABLE IF NOT EXISTS student_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES batches ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(student_id, batch_id)
);

ALTER TABLE student_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own batch assignments"
  ON student_batches FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert batch assignments"
  ON student_batches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete batch assignments"
  ON student_batches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES batches ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present', 'absent')),
  marked_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Students can mark their own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_student_batches_student ON student_batches(student_id);
CREATE INDEX IF NOT EXISTS idx_student_batches_batch ON student_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_batch ON attendance(batch_id);