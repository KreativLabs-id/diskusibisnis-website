const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkCommunity() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔍 Checking community "test"...\n');
        
        // Check if community exists
        const communityResult = await pool.query(
            'SELECT * FROM public.communities WHERE slug = $1',
            ['test']
        );
        
        if (communityResult.rows.length === 0) {
            console.log('❌ Community "test" not found!');
            console.log('\n📝 Creating test community...');
            
            // Get first user as creator
            const userResult = await pool.query('SELECT id FROM public.users LIMIT 1');
            if (userResult.rows.length === 0) {
                console.log('❌ No users found! Please create a user first.');
                return;
            }
            
            const userId = userResult.rows[0].id;
            
            // Create test community
            const newCommunity = await pool.query(`
                INSERT INTO public.communities 
                (name, slug, description, category, created_by)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [
                'Test',
                'test',
                'Test community for development',
                'Testing',
                userId
            ]);
            
            console.log('✅ Test community created!');
            console.log(newCommunity.rows[0]);
            
            // Add creator as admin member
            await pool.query(`
                INSERT INTO public.community_members 
                (community_id, user_id, role)
                VALUES ($1, $2, $3)
            `, [newCommunity.rows[0].id, userId, 'admin']);
            
            console.log('✅ Creator added as admin member');
        } else {
            console.log('✅ Community "test" found!');
            console.log(communityResult.rows[0]);
            
            // Check members
            const membersResult = await pool.query(`
                SELECT 
                    cm.id, 
                    cm.user_id, 
                    cm.role, 
                    cm.created_at as joined_at,
                    u.display_name, 
                    u.email
                FROM public.community_members cm
                JOIN public.users u ON cm.user_id = u.id
                WHERE cm.community_id = $1
            `, [communityResult.rows[0].id]);
            
            console.log(`\n👥 Members (${membersResult.rows.length}):`);
            membersResult.rows.forEach(member => {
                console.log(`  - ${member.display_name} (${member.email}) - ${member.role}`);
            });
        }
        
        // Check if is_verified column exists
        console.log('\n🔍 Checking is_verified column...');
        const columnCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'is_verified'
        `);
        
        if (columnCheck.rows.length > 0) {
            console.log('✅ is_verified column exists');
        } else {
            console.log('❌ is_verified column NOT found!');
            console.log('💡 Run: node scripts/add-is-verified-column.js');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

checkCommunity();
