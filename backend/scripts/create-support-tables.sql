-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Replies Table
CREATE TABLE IF NOT EXISTS support_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  admin_id UUID,
  sender_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_admin column if table already exists
ALTER TABLE support_replies ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
-- Rename admin_name to sender_name if exists
ALTER TABLE support_replies RENAME COLUMN admin_name TO sender_name;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_replies_ticket_id ON support_replies(ticket_id);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_replies ENABLE ROW LEVEL SECURITY;

-- Policies for support_tickets
CREATE POLICY "Allow insert for everyone" ON support_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated" ON support_tickets
  FOR SELECT USING (true);

CREATE POLICY "Allow update for authenticated" ON support_tickets
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated" ON support_tickets
  FOR DELETE USING (true);

-- Policies for support_replies
CREATE POLICY "Allow all for support_replies" ON support_replies
  FOR ALL USING (true);
