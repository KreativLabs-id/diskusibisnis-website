import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const castVote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { votableType, votableId, voteType } = req.body;
        const userId = req.user?.id;

        // Check if user already voted
        const existingVote = await pool.query(
            'SELECT id, vote_type FROM votes WHERE user_id = $1 AND votable_type = $2 AND votable_id = $3',
            [userId, votableType, votableId]
        );

        if (existingVote.rows.length > 0) {
            // Update existing vote
            if (existingVote.rows[0].vote_type === voteType) {
                // Remove vote if same type
                await pool.query('DELETE FROM votes WHERE id = $1', [existingVote.rows[0].id]);
                await updateVoteCount(votableType, votableId, voteType, -1);
                res.json({ success: true, message: 'Vote removed' });
                return;
            } else {
                // Change vote
                await pool.query('UPDATE votes SET vote_type = $1 WHERE id = $2', [voteType, existingVote.rows[0].id]);
                await updateVoteCount(votableType, votableId, existingVote.rows[0].vote_type, -1);
                await updateVoteCount(votableType, votableId, voteType, 1);

                // Update reputation
                await updateAuthorReputation(votableType, votableId, voteType);

                res.json({ success: true, message: 'Vote updated' });
                return;
            }
        }

        // Create new vote
        await pool.query(
            'INSERT INTO votes (user_id, votable_type, votable_id, vote_type) VALUES ($1, $2, $3, $4)',
            [userId, votableType, votableId, voteType]
        );

        await updateVoteCount(votableType, votableId, voteType, 1);
        await updateAuthorReputation(votableType, votableId, voteType);

        res.status(201).json({ success: true, message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Cast vote error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const removeVote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const voteResult = await pool.query(
            'SELECT * FROM votes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (voteResult.rows.length === 0) {
            res.status(404).json({ success: false, message: 'Vote not found' });
            return;
        }

        const vote = voteResult.rows[0];
        await pool.query('DELETE FROM votes WHERE id = $1', [id]);
        await updateVoteCount(vote.votable_type, vote.votable_id, vote.vote_type, -1);

        res.json({ success: true, message: 'Vote removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

async function updateVoteCount(votableType: string, votableId: string, voteType: string, change: number) {
    const table = votableType === 'question' ? 'questions' : 'answers';
    const column = voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
    
    await pool.query(
        `UPDATE ${table} SET ${column} = ${column} + $1 WHERE id = $2`,
        [change, votableId]
    );
}

async function updateAuthorReputation(votableType: string, votableId: string, voteType: string) {
    if (voteType !== 'upvote') return; // Only upvotes give reputation

    const table = votableType === 'question' ? 'questions' : 'answers';
    const points = votableType === 'question' ? 5 : 10;

    const result = await pool.query(`SELECT author_id FROM ${table} WHERE id = $1`, [votableId]);
    if (result.rows.length > 0) {
        await pool.query(
            'UPDATE public.users SET reputation_points = reputation_points + $1 WHERE id = $2',
            [points, result.rows[0].author_id]
        );
    }
}
