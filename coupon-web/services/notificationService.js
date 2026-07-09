const fs = require('fs');
const path = require('path');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { Op } = require('sequelize');
const { User } = require('../models');

let initialized = false;

const loadServiceAccount = () => {
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (jsonPath) {
    const resolved = path.resolve(jsonPath);
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  }

  const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!jsonString) return null;

  return JSON.parse(jsonString);
};

const initFirebase = () => {
  if (initialized) return true;

  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      console.warn(
        'FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled',
      );
      return false;
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    initialized = true;
    console.log(`Firebase Admin initialized (project: ${serviceAccount.project_id})`);
    return true;
  } catch (error) {
    console.error('Firebase init error:', error.message);
    return false;
  }
};

const sendNewCouponNotification = async (coupon) => {
  if (!initFirebase()) return { success: false, message: 'Firebase not configured' };

  try {
    const users = await User.findAll({
      where: { fcmToken: { [Op.ne]: null } },
      attributes: ['id', 'username', 'fcmToken'],
    });

    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length === 0) {
      console.warn('FCM: aucun token enregistré — reconnectez-vous sur l\'app mobile');
      return { success: false, message: 'No FCM tokens registered' };
    }

    const title = 'Nouveau coupon';
    const body = `${coupon.type} — ${coupon.montant} ${coupon.devise}`;

    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: {
        couponId: String(coupon.id),
        type: coupon.type,
        status: coupon.status,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'coupons',
          sound: 'default',
        },
      },
    });

    console.log(`FCM sent: ${response.successCount} success, ${response.failureCount} failed`);

    if (response.failureCount > 0) {
      response.responses.forEach((res, index) => {
        if (!res.success) {
          console.error(`FCM failed for token[${index}]:`, res.error?.message);
        }
      });
    }

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('FCM send error:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendNewCouponNotification };
