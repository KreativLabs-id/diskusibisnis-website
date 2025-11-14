import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/users/[id]/activities - Get user reputation activities

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        
        // Get user's questions
        const questionsResult = await pool.query(
            `SELECT 
                q.id, 
                q.title, 
                q.created_at,
                'question_posted' as type,
                1 as points
             FROM public.questions q
             WHERE q.author_id = $1
             ORDER BY q.created_at DESC
             LIMIT 20`,
            [userId]
        );
        
        // Get upvotes on user's questions
        const questionUpvotesResult = await pool.query(
            `SELECT 
                v.id as vote_id,
                q.id,
                q.title,
                v.created_at,
                'question_upvote' as type,
                5 as points
             FROM public.votes v
             JOIN public.questions q ON v.question_id = q.id
             WHERE q.author_id = $1 AND v.vote_type = 'upvote'
             ORDER BY v.created_at DESC
             LIMIT 20`,
            [userId]
        );
        
        // Get upvotes on user's answers
        const answerUpvotesResult = await pool.query(
            `SELECT 
                v.id as vote_id,
                q.id,
                q.title,
                v.created_at,
                'answer_upvote' as type,
                10 as points
             FROM public.votes v
             JOIN public.answers a ON v.answer_id = a.id
             JOIN public.questions q ON a.question_id = q.id
             WHERE a.author_id = $1 AND v.vote_type = 'upvote'
             ORDER BY v.created_at DESC
             LIMIT 20`,
            [userId]
        );
        
        // Get accepted answers
        const acceptedAnswersResult = await pool.query(
            `SELECT 
                q.id,
                q.title,
                a.updated_at as created_at,
                'answer_accepted' as type,
                15 as points
             FROM public.answers a
             JOIN public.questions q ON a.question_id = q.id
             WHERE a.author_id = $1 AND a.is_accepted = true
             ORDER BY a.updated_at DESC
             LIMIT 20`,
            [userId]
        );
        
        // Combine all activities
        const activities = [
            ...questionsResult.rows.map(row => ({
                id: `question-${row.id}`,
                type: row.type,
                points: row.points,
                description: 'Membuat pertanyaan',
                date: row.created_at,
                questionTitle: row.title,
                questionId: row.id
            })),
            ...questionUpvotesResult.rows.map(row => ({
                id: `q-upvote-${row.vote_id}`,
                type: row.type,
                points: row.points,
                description: 'Pertanyaan Anda mendapat upvote',
                date: row.created_at,
                questionTitle: row.title,
                questionId: row.id
            })),
            ...answerUpvotesResult.rows.map(row => ({
                id: `a-upvote-${row.vote_id}`,
                type: row.type,
                points: row.points,
                description: 'Jawaban Anda mendapat upvote',
                date: row.created_at,
                questionTitle: row.title,
                questionId: row.id
            })),
            ...acceptedAnswersResult.rows.map(row => ({
                id: `accepted-${row.id}`,
                type: row.type,
                points: row.points,
                description: 'Jawaban Anda diterima sebagai jawaban terbaik',
                date: row.created_at,
                questionTitle: row.title,
                questionId: row.id
            }))
        ];
        
        // Sort by date
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return NextResponse.json({
            success: true,
            data: { activities: activities.slice(0, 50) }
        });
        
    } catch (error) {
        console.error('Get user activities error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
