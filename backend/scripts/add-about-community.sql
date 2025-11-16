-- Add about fields to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS vision TEXT,
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS target_members TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.communities.vision IS 'Community vision statement';
COMMENT ON COLUMN public.communities.mission IS 'Community mission statement';
COMMENT ON COLUMN public.communities.target_members IS 'Target audience description';
COMMENT ON COLUMN public.communities.benefits IS 'Benefits members can gain';
