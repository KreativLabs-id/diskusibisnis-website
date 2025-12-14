const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '../config/firebase-admin-sdk.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'diskusi-bisnis',
});

const messaging = admin.messaging();

/**
 * Send push notification to a single device
 */
const sendNotificationToDevice = async (fcmToken, notification, data = {}) => {
  try {
    const message = {
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
    };

    const response = await messaging.send(message);
    console.log('Successfully sent notification:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple devices
 */
const sendNotificationToMultipleDevices = async (fcmTokens, notification, data = {}) => {
  try {
    const message = {
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

    const response = await messaging.sendMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);
    if (response.failureCount > 0) {
      console.log(`Failed to send ${response.failureCount} notifications`);
    }
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification when answer is posted
 */
const sendAnswerNotification = async (questionOwnerId, questionTitle, answererName, pool) => {
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
const sendVoteNotification = async (userId, itemType, voterName, pool) => {
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
const sendAnswerAcceptedNotification = async (answererId, questionTitle, pool) => {
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

module.exports = {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
  sendAnswerNotification,
  sendVoteNotification,
  sendAnswerAcceptedNotification,
};
