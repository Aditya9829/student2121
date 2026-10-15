/*
# College Administration System — Database Schema

This migration creates the full schema for a college administration system.
It is a single-tenant app with no authentication — all policies allow anon + authenticated access.

## New Tables
1. `courses` — stores academic programs (B.Tech, M.Tech, BBA, etc.)
   - id (uuid, PK)
   - course_code (text, unique) — e.g. "BTECH-CS"
   - course_name (text, not null) — e.g. "B.Tech Computer Science"
   - department (text, not null) — e.g. "Computer Science"
   - duration_years (int, not null, default 4)
   - num_semesters (int, not null, default 8)
   - created_at (timestamptz)

2. `subjects` — stores individual subjects belonging to a course/semester
   - id (uuid, PK)
   - subject_code (text, unique) — e.g. "CS101"
   - subject_name (text, not null)
   - course_id (uuid, FK → courses.id)
   - semester (int, not null)
   - credits (int, not null, default 3)
   - faculty (text, not null)
   - created_at (timestamptz)

3. `students` — stores student personal + enrollment info
   - id (uuid, PK)
   - student_id (text, unique) — e.g. "STU001"
   - enrollment_number (text, unique) — e.g. "ENR2024001"
   - full_name (text, not null)
   - email (text, not null)
   - phone (text)
   - date_of_birth (date)
   - gender (text)
   - address (text)
   - photo_url (text) — URL to student photo
   - course_id (uuid, FK → courses.id)
   - semester (int, not null, default 1)
   - section (text) — e.g. "A"
   - created_at (timestamptz)

4. `attendance` — per-subject attendance records for each student
   - id (uuid, PK)
   - student_id (uuid, FK → students.id)
   - subject_id (uuid, FK → subjects.id)
   - date (date, not null)
   - status (text, not null) — 'present' or 'absent'
   - created_at (timestamptz)

5. `marks` — academic marks per student per subject
   - id (uuid, PK)
   - student_id (uuid, FK → students.id)
   - subject_id (uuid, FK → subjects.id)
   - internal_marks (int, default 0) — out of 20
   - assignment_marks (int, default 0) — out of 20
   - exam_marks (int, default 0) — out of 60
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant no-auth application with intentionally shared data.
*/

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text UNIQUE NOT NULL,
  course_name text NOT NULL,
  department text NOT NULL,
  duration_years int NOT NULL DEFAULT 4,
  num_semesters int NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon, authenticated USING (true);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text UNIQUE NOT NULL,
  subject_name text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  semester int NOT NULL,
  credits int NOT NULL DEFAULT 3,
  faculty text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  enrollment_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  photo_url text,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  semester int NOT NULL DEFAULT 1,
  section text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
CREATE POLICY "anon_select_attendance" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE TO anon, authenticated USING (true);

-- Marks
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  internal_marks int NOT NULL DEFAULT 0,
  assignment_marks int NOT NULL DEFAULT 0,
  exam_marks int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_marks" ON marks;
CREATE POLICY "anon_select_marks" ON marks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_marks" ON marks;
CREATE POLICY "anon_insert_marks" ON marks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_marks" ON marks;
CREATE POLICY "anon_update_marks" ON marks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_marks" ON marks;
CREATE POLICY "anon_delete_marks" ON marks FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON marks(subject_id);
