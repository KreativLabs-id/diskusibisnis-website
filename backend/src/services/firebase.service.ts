import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
// Note: In TS/ES modules, require might need createRequire or just use typical import if json.
// But since this is checking for a file, we can keep using require or fs.
// However, 'firebase-admin-sdk.json' location might be different in build.
// Let's assume the current path logic works for dev.
const serviceAccount = require(path.join(__dirname, '../../config/firebase-admin-sdk.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'diskusi-bisnis',
    });
}

const messaging = admin.messaging();

interface NotificationPayload {
    title: string;
    body: string;
}

interface NotificationData {
    [key: string]: string;
}

/**
 * Helper function to get all FCM tokens for a user
 * Falls back to legacy single token if user_fcm_tokens table doesn't exist
 */
const getUserFcmTokens = async (userId: string, pool: any): Promise<string[]> => {
    try {
        // Try new multi-device table first
        const result = await pool.query(
            'SELECT fcm_token FROM public.user_fcm_tokens WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            return result.rows.map((row: any) => row.fcm_token);
        }
    } catch (error) {
        // Table might not exist, fall through to legacy
        console.log('user_fcm_tokens table not available, using legacy method');
    }

    // Fallback to legacy single token
    try {
        const legacyResult = await pool.query(
            'SELECT fcm_token FROM public.users WHERE id = $1 AND fcm_token IS NOT NULL',
            [userId]
        );

        if (legacyResult.rows.length > 0 && legacyResult.rows[0].fcm_token) {
            return [legacyResult.rows[0].fcm_token];
        }
    } catch (error) {
        console.error('Error getting legacy FCM token:', error);
    }

    return [];
};

/**
 * Send push notification to a single device
 */
export const sendNotificationToDevice = async (
    fcmToken: string,
    notification: NotificationPayload,
    data: NotificationData = {}
) => {
    try {
        const message: admin.messaging.Message = {
            token: fcmToken,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: data,
            webpush: {
                fcmOptions: {
                    link: data.link || '/',
                },
            },
            // Android specific config if needed
            android: {
                priority: 'high',
                notification: {
                    sound: 'default'
                }
            }
        };

        const response = await messaging.send(message);
        console.log('Successfully sent notification:', response);
        return { success: true, messageId: response };
    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send push notification to multiple devices
 */
export const sendNotificationToMultipleDevices = async (
    fcmTokens: string[],
    notification: NotificationPayload,
    data: NotificationData = {}
) => {
    try {
        const message: admin.messaging.MulticastMessage = {
            tokens: fcmTokens,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: data,
            webpush: {
                fcmOptions: {
                    link: data.link || '/',
                },
            },
        };

        const response = await messaging.sendEachForMulticast(message); // sendMulticast is deprecated
        console.log(`Successfully sent ${response.successCount} notifications`);
        if (response.failureCount > 0) {
            console.log(`Failed to send ${response.failureCount} notifications`);
        }
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        };
    } catch (error: any) {
        console.error('Error sending notifications:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification when answer is posted - sends to ALL user devices
 */
export const sendAnswerNotification = async (
    questionOwnerId: string,
    questionTitle: string,
    answererName: string,
    pool: any
) => {
    try {
        const tokens = await getUserFcmTokens(questionOwnerId, pool);

        if (tokens.length === 0) {
            console.log('No FCM token found for user');
            return;
        }

        console.log(`Sending answer notification to ${tokens.length} device(s)`);

        if (tokens.length === 1) {
            await sendNotificationToDevice(
                tokens[0],
                {
                    title: '💬 Jawaban Baru!',
                    body: `${answererName} menjawab pertanyaan "${questionTitle}"`,
                },
                {
                    type: 'answer',
                    link: '/notifications',
                }
            );
        } else {
            await sendNotificationToMultipleDevices(
                tokens,
                {
                    title: '💬 Jawaban Baru!',
                    body: `${answererName} menjawab pertanyaan "${questionTitle}"`,
                },
                {
                    type: 'answer',
                    link: '/notifications',
                }
            );
        }
    } catch (error) {
        console.error('Error sending answer notification:', error);
    }
};

/**
 * Send notification when vote is cast - sends to ALL user devices
 */
export const sendVoteNotification = async (
    userId: string,
    itemType: 'question' | 'answer',
    voterName: string,
    pool: any
) => {
    try {
        const tokens = await getUserFcmTokens(userId, pool);

        if (tokens.length === 0) return;

        console.log(`Sending vote notification to ${tokens.length} device(s)`);

        const notification = {
            title: '👍 Upvote!',
            body: `${voterName} menyukai ${itemType === 'question' ? 'pertanyaan' : 'jawaban'} Anda`,
        };
        const data = {
            type: 'vote',
            link: '/notifications',
        };

        if (tokens.length === 1) {
            await sendNotificationToDevice(tokens[0], notification, data);
        } else {
            await sendNotificationToMultipleDevices(tokens, notification, data);
        }
    } catch (error) {
        console.error('Error sending vote notification:', error);
    }
};

/**
 * Send notification when answer is accepted - sends to ALL user devices
 */
export const sendAnswerAcceptedNotification = async (
    answererId: string,
    questionTitle: string,
    pool: any
) => {
    try {
        const tokens = await getUserFcmTokens(answererId, pool);

        if (tokens.length === 0) return;

        console.log(`Sending answer accepted notification to ${tokens.length} device(s)`);

        const notification = {
            title: '✅ Jawaban Diterima!',
            body: `Jawaban Anda untuk "${questionTitle}" telah diterima`,
        };
        const data = {
            type: 'answer_accepted',
            link: '/notifications',
        };

        if (tokens.length === 1) {
            await sendNotificationToDevice(tokens[0], notification, data);
        } else {
            await sendNotificationToMultipleDevices(tokens, notification, data);
        }
    } catch (error) {
        console.error('Error sending answer accepted notification:', error);
    }
};
