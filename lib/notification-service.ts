import pool from './database';

export interface CreateNotificationData {
    userId: string;
    type: 'answer' | 'comment' | 'vote' | 'mention' | 'system';
    title: string;
    message?: string;
    link?: string;
}

export const createNotification = async (data: CreateNotificationData): Promise<void> => {
    try {
        await pool.query(
            'INSERT INTO public.notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
            [data.userId, data.type, data.title, data.message, data.link]
        );
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const createAnswerNotification = async (
    questionOwnerId: string, 
    answererName: string, 
    questionTitle: string,
    questionId: string
): Promise<void> => {
    await createNotification({
        userId: questionOwnerId,
        type: 'answer',
        title: 'Jawaban baru',
        message: `**${answererName}** menjawab pertanyaan Anda: **${questionTitle}**`,
        link: `/questions/${questionId}`
    });
};

export const createCommentNotification = async (
    targetUserId: string,
    commenterName: string,
    contentTitle: string,
    contentId: string,
    contentType: 'question' | 'answer'
): Promise<void> => {
    await createNotification({
        userId: targetUserId,
        type: 'comment',
        title: 'Komentar baru',
        message: `**${commenterName}** mengomentari ${contentType === 'question' ? 'pertanyaan' : 'jawaban'} Anda: **${contentTitle}**`,
        link: `/questions/${contentId}`
    });
};

export const createVoteNotification = async (
    targetUserId: string,
    voterName: string,
    contentTitle: string,
    contentId: string,
    voteType: 'upvote' | 'downvote',
    contentType: 'question' | 'answer'
): Promise<void> => {
    if (voteType === 'upvote') {
        await createNotification({
            userId: targetUserId,
            type: 'vote',
            title: 'Vote positif',
            message: `**${voterName}** menyukai ${contentType === 'question' ? 'pertanyaan' : 'jawaban'} Anda: **${contentTitle}**`,
            link: `/questions/${contentId}`
        });
    }
};

export const createMentionNotification = async (
    mentionedUserId: string,
    mentionerName: string,
    contentTitle: string,
    contentId: string
): Promise<void> => {
    await createNotification({
        userId: mentionedUserId,
        type: 'mention',
        title: 'Mention',
        message: `**${mentionerName}** menyebut Anda dalam diskusi: **${contentTitle}**`,
        link: `/questions/${contentId}`
    });
};

export const createSystemNotification = async (
    userId: string,
    title: string,
    message?: string,
    link?: string
): Promise<void> => {
    await createNotification({
        userId,
        type: 'system',
        title,
        message: message || undefined,
        link: link || undefined
    });
};
