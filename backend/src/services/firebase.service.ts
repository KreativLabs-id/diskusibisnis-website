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
 * Send notification when answer is posted
 */
export const sendAnswerNotification = async (
    questionOwnerId: string,
    questionTitle: string,
    answererName: string,
    pool: any
) => {
    try {
        // Get FCM tokens for the question owner
        const result = await pool.query(
            'SELECT fcm_token FROM public.users WHERE id = $1 AND fcm_token IS NOT NULL',
            [questionOwnerId]
        );

        if (result.rows.length === 0) {
            console.log('No FCM token found for user');
            return;
        }

        const fcmToken = result.rows[0].fcm_token;

        await sendNotificationToDevice(
            fcmToken,
            {
                title: '💬 Jawaban Baru!',
                body: `${answererName} menjawab pertanyaan "${questionTitle}"`,
            },
            {
                type: 'answer',
                link: '/notifications',
            }
        );
    } catch (error) {
        console.error('Error sending answer notification:', error);
    }
};

/**
 * Send notification when vote is cast
 */
export const sendVoteNotification = async (
    userId: string,
    itemType: 'question' | 'answer',
    voterName: string,
    pool: any
) => {
    try {
        const result = await pool.query(
            'SELECT fcm_token FROM public.users WHERE id = $1 AND fcm_token IS NOT NULL',
            [userId]
        );

        if (result.rows.length === 0) return;

        const fcmToken = result.rows[0].fcm_token;

        await sendNotificationToDevice(
            fcmToken,
            {
                title: '👍 Upvote!',
                body: `${voterName} menyukai ${itemType === 'question' ? 'pertanyaan' : 'jawaban'} Anda`,
            },
            {
                type: 'vote',
                link: '/notifications',
            }
        );
    } catch (error) {
        console.error('Error sending vote notification:', error);
    }
};

/**
 * Send notification when answer is accepted
 */
export const sendAnswerAcceptedNotification = async (
    answererId: string,
    questionTitle: string,
    pool: any
) => {
    try {
        const result = await pool.query(
            'SELECT fcm_token FROM public.users WHERE id = $1 AND fcm_token IS NOT NULL',
            [answererId]
        );

        if (result.rows.length === 0) return;

        const fcmToken = result.rows[0].fcm_token;

        await sendNotificationToDevice(
            fcmToken,
            {
                title: '✅ Jawaban Diterima!',
                body: `Jawaban Anda untuk "${questionTitle}" telah diterima`,
            },
            {
                type: 'answer_accepted',
                link: '/notifications',
            }
        );
    } catch (error) {
        console.error('Error sending answer accepted notification:', error);
    }
};
