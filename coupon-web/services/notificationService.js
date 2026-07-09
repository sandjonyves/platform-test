const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
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

    admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
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
      attributes: ['fcmToken'],
    });

    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length === 0) {
      return { success: false, message: 'No FCM tokens registered' };
    }

    const title = 'Nouveau coupon';
    const body = `${coupon.type} — ${coupon.montant} ${coupon.devise}`;

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: {
        couponId: String(coupon.id),
        type: coupon.type,
        status: coupon.status,
      },
      android: {
        priority: 'high',
        notification: { channelId: 'coupons' },
      },
    });

    console.log(`FCM sent: ${response.successCount} success, ${response.failureCount} failed`);
    return { success: true, successCount: response.successCount };
  } catch (error) {
    console.error('FCM send error:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendNewCouponNotification };
