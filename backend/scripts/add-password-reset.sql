-- Add password reset columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users(password_reset_token);

SELECT 'Password reset columns added successfully!' as message;
