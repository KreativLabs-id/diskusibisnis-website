-- Add is_verified column to users table if it doesn't exist
-- This column is used for verified badges on user profiles

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Column is_verified added to users table';
    ELSE
        RAISE NOTICE 'Column is_verified already exists';
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON public.users(is_verified) WHERE is_verified = TRUE;

-- Log the change
COMMENT ON COLUMN public.users.is_verified IS 'Whether the user has been verified by admins';
