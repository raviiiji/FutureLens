
-- Add share_token to decisions for public sharing
ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Create index for fast lookup by share_token
CREATE INDEX IF NOT EXISTS idx_decisions_share_token ON public.decisions(share_token) WHERE share_token IS NOT NULL;

-- Allow anyone to read a decision by share_token (public access)
CREATE POLICY "Anyone can view shared decisions"
ON public.decisions
FOR SELECT
TO anon, authenticated
USING (share_token IS NOT NULL);
