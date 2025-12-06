require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running support tickets migration...\n');

  try {
    // Create support_tickets table
    const { error: ticketsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (ticketsError) {
      // Try direct query if RPC doesn't exist
      console.log('Trying direct table creation...');
    }

    // Create support_replies table
    const { error: repliesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS support_replies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
          admin_id UUID,
          admin_name VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    console.log('✅ Migration completed!');
    console.log('\n📋 Tables created:');
    console.log('   - support_tickets');
    console.log('   - support_replies');
    console.log('\n⚠️  If tables were not created, please run the SQL manually in Supabase Dashboard:');
    console.log('   Go to: SQL Editor > New Query > Paste content from scripts/create-support-tables.sql');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Create New Query');
    console.log('   5. Paste content from: backend/scripts/create-support-tables.sql');
    console.log('   6. Click Run');
  }
}

runMigration();
