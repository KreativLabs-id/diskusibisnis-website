const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testQuestionsQuery() {
    try {
        console.log('Testing questions query for community "test"...\n');
        
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
        console.log('Attempting questions query...');
        const result = await pool.query(`
            SELECT 
                q.id,
                q.title,
                q.content,
                q.created_at,
                q.view_count,
                u.id as author_id,
                u.display_name as author_name,
                u.avatar_url as author_avatar,
                COALESCE(u.is_verified, false) as author_verified,
                COUNT(DISTINCT a.id) as answer_count,
                COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'upvote') as upvote_count,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
                    ) FILTER (WHERE t.id IS NOT NULL),
                    '[]'
                ) as tags
            FROM public.questions q
            LEFT JOIN public.users u ON q.author_id = u.id
            LEFT JOIN public.answers a ON q.id = a.question_id
            LEFT JOIN public.votes v ON q.id = v.question_id
            LEFT JOIN public.question_tags qt ON q.id = qt.question_id
            LEFT JOIN public.tags t ON qt.tag_id = t.id
            WHERE q.community_id = $1
            GROUP BY q.id, u.id, u.display_name, u.avatar_url, u.is_verified
            ORDER BY q.created_at DESC
            LIMIT 20 OFFSET 0
        `, [community.id]);
        
        console.log('✅ Query successful!');
        console.log(`Found ${result.rows.length} questions:`);
        result.rows.forEach((question, index) => {
            console.log(`${index + 1}. ${question.title}`);
            console.log(`   Author: ${question.author_name}`);
            console.log(`   Answers: ${question.answer_count}, Upvotes: ${question.upvote_count}`);
            console.log(`   Tags:`, question.tags);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error code:', error.code);
        console.error('Error detail:', error.detail);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

testQuestionsQuery();
