const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authRoutes = require('./auth');
const { deleteAllCoupons } = require('../controllers/couponController');
const { deleteAllUsers, getAllUsersAPI, deleteUser } = require('../controllers/authController');
const { dropDatabase } = require('../controllers/pageController');
const { authenticateToken } = require('../middleware/auth');

// ==================== AUTH ROUTES ====================
router.use('/auth', authRoutes);

// ==================== API ROUTES ====================

// Public — soumission de coupon depuis le site web
router.post('/coupons', couponController.createCoupon);

// Routes protégées — opérateurs (mobile + admin)
router.get('/coupons', authenticateToken, couponController.getAllCoupons);
router.get('/coupons/pending', authenticateToken, couponController.getPendingCoupons);
router.get('/coupons/:id', authenticateToken, couponController.getCouponById);
router.post('/coupons/:id/send-received-email', authenticateToken, couponController.sendReceivedEmail);
router.post('/coupons/code/validate/:id', authenticateToken, couponController.validateCouponCode);
router.post('/coupons/code/invalidate/:id', authenticateToken, couponController.invalidateCouponCode);
router.put('/coupons/validate/:id', authenticateToken, couponController.validateCoupon);
router.put('/coupons/invalidate/:id', authenticateToken, couponController.invalidateCoupon);
router.delete('/coupons/all', authenticateToken, deleteAllCoupons);
router.put('/coupons/:id', authenticateToken, couponController.updateCoupon);
router.delete('/coupons/:id', authenticateToken, couponController.deleteCoupon);
router.post('/encrypt', authenticateToken, couponController.encryptData);

router.delete('/users', authenticateToken, deleteAllUsers);
router.get('/users', authenticateToken, getAllUsersAPI);
router.delete('/users/:id', authenticateToken, deleteUser);
router.delete('/database', authenticateToken, dropDatabase);

module.exports = router;
