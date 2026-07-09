-- ============================================================
-- QUICK FIX — Run this in Supabase SQL Editor
-- Fixes login without requiring a full schema reset.
-- ============================================================

-- 1. Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Disable RLS on all core tables (auth.uid() is always NULL with custom auth)
ALTER TABLE users                     DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculties                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_programs            DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years            DISABLE ROW LEVEL SECURITY;
ALTER TABLE semesters                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE curriculums               DISABLE ROW LEVEL SECURITY;
ALTER TABLE students                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms                     DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules           DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_advisors          DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations      DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_registration_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records          DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs             DISABLE ROW LEVEL SECURITY;

-- 3. Fix authenticate_user: include extensions in search_path so crypt() resolves
CREATE OR REPLACE FUNCTION public.authenticate_user(
  login_email TEXT,
  login_password TEXT
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  role user_role,
  avatar_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    users.id,
    users.full_name,
    users.email,
    users.role,
    users.avatar_url,
    users.is_active,
    users.created_at,
    users.updated_at
  FROM users
  WHERE lower(users.email) = lower(trim(login_email))
    AND users.password_hash = crypt(login_password, users.password_hash)
  LIMIT 1;
$$;

-- Grant execute to anon so the publishable-key client can call this RPC
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated;

-- 4. Upsert demo users with valid UUIDs and fresh bcrypt hashes
INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Super Admin', 'admin@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'super_admin', true, now(), now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab'::uuid,
    'Admin Akademik', 'akademik@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'admin_akademik', true, now(), now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac'::uuid,
    'Kaprodi TI', 'kaprodi@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'kaprodi', true, now(), now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad'::uuid,
    'Dr. Budi Santoso', 'dosen@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'dosen', true, now(), now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae'::uuid,
    'Ahmad Fauzi', 'mahasiswa@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'mahasiswa', true, now(), now()
  )
ON CONFLICT (id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email         = EXCLUDED.email,
  full_name     = EXCLUDED.full_name,
  role          = EXCLUDED.role,
  is_active     = true,
  updated_at    = now();

-- 5. Verify the fix — should return rows for password123
SELECT id, email, role,
  (password_hash = crypt('password123', password_hash)) AS password_ok
FROM users
WHERE email LIKE '%siakad.demo';
