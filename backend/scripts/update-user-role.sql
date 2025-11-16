-- Script to update user role to admin
-- Run this in your PostgreSQL database

-- Update the user role to admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@diskusibisnis.com';

-- Verify the update
SELECT id, email, display_name, role, created_at 
FROM public.users 
WHERE email = 'admin@diskusibisnis.com';
