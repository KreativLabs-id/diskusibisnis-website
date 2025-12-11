-- Newsletter History Table
-- This table stores the history of sent newsletters

CREATE TABLE IF NOT EXISTS public.newsletter_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    sent_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    recipients_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_history_created_at ON public.newsletter_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_history_sent_by ON public.newsletter_history(sent_by);

-- Grant permissions
GRANT ALL ON public.newsletter_history TO authenticated;
GRANT SELECT ON public.newsletter_history TO anon;
