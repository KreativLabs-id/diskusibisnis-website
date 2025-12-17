-- Migration: Add user_fcm_tokens table to support multiple devices per user
-- This allows users to receive push notifications on both web and mobile simultaneously

-- Create table for storing multiple FCM tokens per user
CREATE TABLE IF NOT EXISTS public.user_fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    device_type VARCHAR(20) NOT NULL DEFAULT 'web', -- 'web', 'android', 'ios'
    device_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fcm_token)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id ON public.user_fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_token ON public.user_fcm_tokens(fcm_token);

-- Migrate existing fcm_token data from users table to new table
INSERT INTO public.user_fcm_tokens (user_id, fcm_token, device_type)
SELECT id, fcm_token, 'web' as device_type
FROM public.users 
WHERE fcm_token IS NOT NULL
ON CONFLICT (user_id, fcm_token) DO NOTHING;

-- Note: We keep the fcm_token column in users table for backward compatibility
-- but we'll use the new table going forward
