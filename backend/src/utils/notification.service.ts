import pool from '../config/database';
import {
  sendAnswerNotification,
  sendVoteNotification,
  sendNotificationToDevice
} from '../services/firebase.service';

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

  // Send Push Notification
  await sendAnswerNotification(questionOwnerId, questionTitle, answererName, pool);
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

  // Send Push Notification for Comment
  try {
    const result = await pool.query(
      'SELECT fcm_token FROM public.users WHERE id = $1 AND fcm_token IS NOT NULL',
      [targetUserId]
    );

    if (result.rows.length > 0) {
      const fcmToken = result.rows[0].fcm_token;
      await sendNotificationToDevice(
        fcmToken,
        {
          title: '💬 Komentar Baru',
          body: `**${commenterName}** mengomentari ${contentType === 'question' ? 'pertanyaan' : 'jawaban'} Anda`,
        },
        {
          type: 'comment',
          link: `/questions/${contentId}`,
        }
      );
    }
  } catch (error) {
    console.error('Error sending comment push notification:', error);
  }
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
    // Check if notification already exists for this vote (prevent spam)
    const link = `/questions/${contentId}`;
    const message = `**${voterName}** menyukai ${contentType === 'question' ? 'pertanyaan' : 'jawaban'} Anda: **${contentTitle}**`;

    const existingNotif = await pool.query(
      `SELECT id FROM public.notifications 
       WHERE user_id = $1 AND type = 'vote' AND message = $2 AND link = $3`,
      [targetUserId, message, link]
    );

    // Only create notification if it doesn't exist
    if (existingNotif.rows.length === 0) {
      await createNotification({
        userId: targetUserId,
        type: 'vote',
        title: 'Vote positif',
        message,
        link
      });

      // Send Push Notification
      await sendVoteNotification(targetUserId, contentType, voterName, pool);
    }
  }
};

export const createMentionNotification = async (
  mentionedUserId: string,
  mentionerName: string,
  contentTitle: string,
  questionId: string
): Promise<void> => {
  const link = `/questions/${questionId}`;
  const message = `**${mentionerName}** menyebut Anda di pertanyaan: **${contentTitle}**`;

  // Check if notification already exists (prevent duplicate)
  const existingNotif = await pool.query(
    `SELECT id FROM public.notifications 
     WHERE user_id = $1 AND type = 'mention' AND message = $2 AND link = $3`,
    [mentionedUserId, message, link]
  );

  // Only create notification if it doesn't exist
  if (existingNotif.rows.length === 0) {
    await createNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'Seseorang menyebut Anda',
      message,
      link
    });

    // Send Push Notification for Mention
    try {
      const result = await pool.query(
        'SELECT fcm_token FROM public.users WHERE id = $1 AND fcm_token IS NOT NULL',
        [mentionedUserId]
      );

      if (result.rows.length > 0) {
        const fcmToken = result.rows[0].fcm_token;
        await sendNotificationToDevice(
          fcmToken,
          {
            title: '📢 Mention Baru',
            body: `**${mentionerName}** menyebut Anda di pertanyaan: ${contentTitle}`,
          },
          {
            type: 'mention',
            link: link,
          }
        );
      }
    } catch (error) {
      console.error('Error sending mention push notification:', error);
    }
  }
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
