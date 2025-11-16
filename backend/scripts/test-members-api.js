const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testMembersQuery() {
    try {
        console.log('Testing members query for community "test"...\n');
        
        // First, get community id
        const communityResult = await pool.query(
            'SELECT id, name, slug FROM public.communities WHERE slug = $1',
            ['test']
        );
        
        if (communityResult.rows.length === 0) {
            console.log('Community "test" not found');
            return;
        }
        
        const community = communityResult.rows[0];
        console.log('Community found:', community);
        console.log('');
        
        // Test the exact query from the API
        console.log('Attempting query with is_verified column...');
        try {
            const result = await pool.query(`
                SELECT 
                    cm.id, 
                    cm.user_id, 
                    cm.role, 
                    cm.joined_at,
                    u.display_name, 
                    u.avatar_url,
                    u.is_verified
                FROM public.community_members cm
                JOIN public.users u ON cm.user_id = u.id
                WHERE cm.community_id = $1
                ORDER BY cm.joined_at DESC
            `, [community.id]);
            
            console.log('✅ Query successful!');
            console.log(`Found ${result.rows.length} members:`);
            result.rows.forEach((member, index) => {
                console.log(`${index + 1}. ${member.display_name} (${member.role}) - joined: ${member.joined_at}`);
            });
        } catch (error) {
            console.log('❌ Query failed with is_verified:', error.message);
            console.log('');
            
            // Try without is_verified
            console.log('Attempting query without is_verified column...');
            const result = await pool.query(`
                SELECT 
                    cm.id, 
                    cm.user_id, 
                    cm.role, 
                    cm.joined_at,
                    u.display_name, 
                    u.avatar_url
                FROM public.community_members cm
                JOIN public.users u ON cm.user_id = u.id
                WHERE cm.community_id = $1
                ORDER BY cm.joined_at DESC
            `, [community.id]);
            
            console.log('✅ Query successful without is_verified!');
            console.log(`Found ${result.rows.length} members:`);
            result.rows.forEach((member, index) => {
                console.log(`${index + 1}. ${member.display_name} (${member.role}) - joined: ${member.joined_at}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

testMembersQuery();
