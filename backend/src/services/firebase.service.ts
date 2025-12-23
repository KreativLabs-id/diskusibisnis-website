import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK
// Priority: 1. FIREBASE_ADMIN_SDK_JSON env var (for Railway)
//           2. Local file (for development)
let serviceAccount: admin.ServiceAccount | null = null;

// Try environment variable first (Railway deployment)
if (process.env.FIREBASE_ADMIN_SDK_JSON) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
        console.log('✅ Firebase: Using credentials from environment variable');
    } catch (e) {
        console.error('❌ Firebase: Failed to parse FIREBASE_ADMIN_SDK_JSON env var');
    }
}

// Fallback to local file (development)
if (!serviceAccount) {
    const configPath = path.join(__dirname, '../../config/firebase-admin-sdk.json');
    if (fs.existsSync(configPath)) {
        serviceAccount = require(configPath);
        console.log('✅ Firebase: Using credentials from local file');
    } else {
        console.warn('⚠️ Firebase: No credentials found. Push notifications will not work.');
    }
}

// Initialize Firebase only if credentials are available
if (serviceAccount && admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'diskusi-bisnis',
    });
    console.log('✅ Firebase Admin SDK initialized');
}

// Only get messaging instance if Firebase is initialized
const messaging = admin.apps.length > 0 ? admin.messaging() : null;

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

        if (!messaging) {
            console.warn('Firebase messaging not initialized. Skipping notification.');
            return { success: false, error: 'Firebase not initialized' };
        }

        const response = await messaging.send(message);
        console.log('Successfully sent notification:', response);
        return { success: true, messageId: response };
    } catch (error: any) {
        // Don't log full error for common token issues (expired, unregistered)
        const errorCode = error?.errorInfo?.code;
        if (errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token') {
            console.log('FCM token expired or invalid (will be cleaned up)');
        } else {
            console.error('Error sending notification:', error);
        }
        return { success: false, error: error.message, errorCode };
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

        if (!messaging) {
            console.warn('Firebase messaging not initialized. Skipping notifications.');
            return { success: false, successCount: 0, failureCount: fcmTokens.length };
        }

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
