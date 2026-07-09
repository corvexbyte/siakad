-- ============================================================
-- RESET / DOWN — Drops ALL objects created by migrations 001, 002, 003
-- Run this in Supabase SQL Editor to completely tear down the schema.
-- WARNING: This will DELETE ALL DATA. Use with caution.
-- ============================================================

-- -------------------------------------------------------
-- 003: Drop user management function
-- -------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_user(TEXT, TEXT, TEXT, user_role);

-- -------------------------------------------------------
-- 002: Drop program management tables (cascade), policies,
--      triggers, indexes, storage bucket, and enums
-- -------------------------------------------------------

-- Storage policies (must be dropped before bucket) — storage.objects always exists
DROP POLICY IF EXISTS academic_program_documents_select ON storage.objects;
DROP POLICY IF EXISTS academic_program_documents_insert ON storage.objects;

-- NOTE: Storage bucket + objects cannot be deleted via SQL (Supabase protect_delete blocks all
-- storage table mutations). Delete the bucket manually BEFORE running this script:
--   Supabase Dashboard → Storage → academic-program-documents → ⋯ → Delete bucket
-- The bucket does NOT block any of the DROP TABLE / DROP TYPE statements below.

-- RLS policies — 002 tables (guarded: table may not exist)
DO $$ BEGIN
  IF to_regclass('public.academic_program_assessments') IS NOT NULL THEN
    DROP POLICY IF EXISTS program_assessments_manage ON academic_program_assessments;
    DROP POLICY IF EXISTS program_assessments_select ON academic_program_assessments;
  END IF;
  IF to_regclass('public.academic_program_rubrics') IS NOT NULL THEN
    DROP POLICY IF EXISTS program_rubrics_manage ON academic_program_rubrics;
    DROP POLICY IF EXISTS program_rubrics_select ON academic_program_rubrics;
  END IF;
  IF to_regclass('public.academic_program_logbooks') IS NOT NULL THEN
    DROP POLICY IF EXISTS program_logbooks_update ON academic_program_logbooks;
    DROP POLICY IF EXISTS program_logbooks_insert ON academic_program_logbooks;
    DROP POLICY IF EXISTS program_logbooks_select ON academic_program_logbooks;
  END IF;
  IF to_regclass('public.academic_program_assignments') IS NOT NULL THEN
    DROP POLICY IF EXISTS program_assignments_manage ON academic_program_assignments;
    DROP POLICY IF EXISTS program_assignments_select ON academic_program_assignments;
  END IF;
  IF to_regclass('public.academic_program_registrations') IS NOT NULL THEN
    DROP POLICY IF EXISTS program_registrations_update ON academic_program_registrations;
    DROP POLICY IF EXISTS program_registrations_insert ON academic_program_registrations;
    DROP POLICY IF EXISTS program_registrations_select ON academic_program_registrations;
  END IF;
  IF to_regclass('public.academic_program_periods') IS NOT NULL THEN
    DROP POLICY IF EXISTS program_periods_manage ON academic_program_periods;
    DROP POLICY IF EXISTS program_periods_select ON academic_program_periods;
  END IF;
END $$;

-- Tables (cascade drops triggers, indexes, constraints, and rows)
DROP TABLE IF EXISTS academic_program_assessments  CASCADE;
DROP TABLE IF EXISTS academic_program_rubrics      CASCADE;
DROP TABLE IF EXISTS academic_program_logbooks     CASCADE;
DROP TABLE IF EXISTS academic_program_assignments  CASCADE;
DROP TABLE IF EXISTS academic_program_registrations CASCADE;
DROP TABLE IF EXISTS academic_program_periods      CASCADE;

-- Enums — 002
DROP TYPE IF EXISTS academic_program_logbook_status CASCADE;
DROP TYPE IF EXISTS academic_program_assignment_role CASCADE;
DROP TYPE IF EXISTS academic_program_registration_status CASCADE;
DROP TYPE IF EXISTS academic_program_type CASCADE;

-- -------------------------------------------------------
-- 001: Drop core tables, functions, triggers, policies,
--      enums, and extension
-- -------------------------------------------------------

-- RLS policies — 001 tables (guarded: table may not exist)
DO $$ BEGIN
  IF to_regclass('public.activity_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS activity_logs_insert ON activity_logs;
    DROP POLICY IF EXISTS activity_logs_select ON activity_logs;
  END IF;
  IF to_regclass('public.academic_records') IS NOT NULL THEN
    DROP POLICY IF EXISTS academic_records_manage ON academic_records;
    DROP POLICY IF EXISTS academic_records_select ON academic_records;
  END IF;
  IF to_regclass('public.grades') IS NOT NULL THEN
    DROP POLICY IF EXISTS grades_manage ON grades;
    DROP POLICY IF EXISTS grades_select ON grades;
  END IF;
  IF to_regclass('public.course_registration_items') IS NOT NULL THEN
    DROP POLICY IF EXISTS krs_items_manage ON course_registration_items;
    DROP POLICY IF EXISTS krs_items_select ON course_registration_items;
  END IF;
  IF to_regclass('public.course_registrations') IS NOT NULL THEN
    DROP POLICY IF EXISTS krs_update ON course_registrations;
    DROP POLICY IF EXISTS krs_insert ON course_registrations;
    DROP POLICY IF EXISTS krs_select ON course_registrations;
  END IF;
  IF to_regclass('public.student_advisors') IS NOT NULL THEN
    DROP POLICY IF EXISTS student_advisors_manage ON student_advisors;
    DROP POLICY IF EXISTS student_advisors_select ON student_advisors;
  END IF;
  IF to_regclass('public.class_schedules') IS NOT NULL THEN
    DROP POLICY IF EXISTS class_schedules_manage ON class_schedules;
    DROP POLICY IF EXISTS class_schedules_select ON class_schedules;
  END IF;
  IF to_regclass('public.classes') IS NOT NULL THEN
    DROP POLICY IF EXISTS classes_manage ON classes;
    DROP POLICY IF EXISTS classes_select ON classes;
  END IF;
  IF to_regclass('public.courses') IS NOT NULL THEN
    DROP POLICY IF EXISTS courses_manage ON courses;
    DROP POLICY IF EXISTS courses_select ON courses;
  END IF;
  IF to_regclass('public.lecturers') IS NOT NULL THEN
    DROP POLICY IF EXISTS lecturers_manage ON lecturers;
    DROP POLICY IF EXISTS lecturers_select ON lecturers;
  END IF;
  IF to_regclass('public.students') IS NOT NULL THEN
    DROP POLICY IF EXISTS students_manage ON students;
    DROP POLICY IF EXISTS students_select ON students;
  END IF;
  IF to_regclass('public.rooms') IS NOT NULL THEN
    DROP POLICY IF EXISTS read_rooms ON rooms;
    DROP POLICY IF EXISTS admin_all_rooms ON rooms;
  END IF;
  IF to_regclass('public.curriculums') IS NOT NULL THEN
    DROP POLICY IF EXISTS read_curriculums ON curriculums;
    DROP POLICY IF EXISTS admin_all_curriculums ON curriculums;
  END IF;
  IF to_regclass('public.semesters') IS NOT NULL THEN
    DROP POLICY IF EXISTS read_semesters ON semesters;
    DROP POLICY IF EXISTS admin_all_semesters ON semesters;
  END IF;
  IF to_regclass('public.academic_years') IS NOT NULL THEN
    DROP POLICY IF EXISTS read_academic_years ON academic_years;
    DROP POLICY IF EXISTS admin_all_academic_years ON academic_years;
  END IF;
  IF to_regclass('public.study_programs') IS NOT NULL THEN
    DROP POLICY IF EXISTS read_study_programs ON study_programs;
    DROP POLICY IF EXISTS admin_all_study_programs ON study_programs;
  END IF;
  IF to_regclass('public.faculties') IS NOT NULL THEN
    DROP POLICY IF EXISTS read_faculties ON faculties;
    DROP POLICY IF EXISTS admin_all_faculties ON faculties;
  END IF;
  IF to_regclass('public.users') IS NOT NULL THEN
    DROP POLICY IF EXISTS users_insert ON users;
    DROP POLICY IF EXISTS users_update ON users;
    DROP POLICY IF EXISTS users_select ON users;
  END IF;
END $$;

-- Tables — 001 (in reverse FK dependency order)
DROP TABLE IF EXISTS activity_logs              CASCADE;
DROP TABLE IF EXISTS academic_records           CASCADE;
DROP TABLE IF EXISTS grades                     CASCADE;
DROP TABLE IF EXISTS course_registration_items  CASCADE;
DROP TABLE IF EXISTS course_registrations       CASCADE;
DROP TABLE IF EXISTS student_advisors           CASCADE;
DROP TABLE IF EXISTS class_schedules            CASCADE;
DROP TABLE IF EXISTS classes                    CASCADE;
DROP TABLE IF EXISTS rooms                      CASCADE;
DROP TABLE IF EXISTS courses                    CASCADE;
DROP TABLE IF EXISTS curriculums                CASCADE;
DROP TABLE IF EXISTS lecturers                  CASCADE;
DROP TABLE IF EXISTS students                   CASCADE;
DROP TABLE IF EXISTS semesters                  CASCADE;
DROP TABLE IF EXISTS academic_years             CASCADE;
DROP TABLE IF EXISTS study_programs             CASCADE;
DROP TABLE IF EXISTS faculties                  CASCADE;
DROP TABLE IF EXISTS users                      CASCADE;

-- Functions — 001
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_study_program_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Enums — 001
DROP TYPE IF EXISTS day_of_week CASCADE;
DROP TYPE IF EXISTS academic_status CASCADE;
DROP TYPE IF EXISTS class_status CASCADE;
DROP TYPE IF EXISTS krs_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Extension (optional — comment out if other projects depend on it)
-- DROP EXTENSION IF EXISTS "pgcrypto";