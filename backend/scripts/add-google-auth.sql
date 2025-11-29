-- Add google_id column to users table for Google OAuth
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);

-- Make password_hash nullable for Google-only users
ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;
