const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authRoutes = require('./auth');
const { deleteAllCoupons } = require('../controllers/couponController');
const { deleteAllUsers, getAllUsersAPI, deleteUser, createUser } = require('../controllers/authController');
const { dropDatabase } = require('../controllers/pageController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const gainController = require('../controllers/gainController');

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
router.delete('/coupons/all', authenticateToken, requireAdmin, deleteAllCoupons);
router.put('/coupons/:id', authenticateToken, couponController.updateCoupon);
router.delete('/coupons/:id', authenticateToken, requireAdmin, couponController.deleteCoupon);
router.post('/encrypt', authenticateToken, couponController.encryptData);

// Gains (admin)
// Lecture : tout utilisateur connecté (app mobile). Paiements : admin.
router.get('/gains', authenticateToken, gainController.getGains);
router.post('/payments', authenticateToken, requireAdmin, gainController.createPayment);
router.delete('/payments/:id', authenticateToken, requireAdmin, gainController.deletePayment);

router.post('/users', authenticateToken, requireAdmin, createUser);
router.get('/users', authenticateToken, requireAdmin, getAllUsersAPI);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);
router.delete('/users', authenticateToken, requireAdmin, deleteAllUsers);
router.delete('/database', authenticateToken, requireAdmin, dropDatabase);

module.exports = router;
