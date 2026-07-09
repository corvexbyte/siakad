-- Migration 003: User management helpers
-- Adds a server-side function for creating users with proper password hashing

CREATE OR REPLACE FUNCTION public.create_user(
  p_full_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_role user_role DEFAULT 'mahasiswa'
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  role user_role,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for duplicate email
  IF EXISTS (SELECT 1 FROM users WHERE lower(users.email) = lower(trim(p_email))) THEN
    RAISE EXCEPTION 'Email sudah digunakan: %', p_email;
  END IF;

  RETURN QUERY
  INSERT INTO users (full_name, email, password_hash, role, is_active)
  VALUES (
    trim(p_full_name),
    lower(trim(p_email)),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    p_role,
    true
  )
  RETURNING
    users.id,
    users.full_name,
    users.email,
    users.role,
    users.is_active,
    users.created_at;
END;
$$;
