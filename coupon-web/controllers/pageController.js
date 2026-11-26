// ==================== PAGE CONTROLLERS ====================

/**
 * Afficher la nouvelle page d'accueil moderne
 * GET /
 */
const getNewHomePage = (req, res) => {
  res.render('home', { 
    title: 'Plateform-Test.cm - Vérification de Coupons en Ligne | Europe',
    success_msg: req.flash('success_msg'),
    error_msg: req.flash('error_msg')
  });
};

/**
 * Afficher la page de vérification
 * GET /verify
 */
const getVerifyPage = (req, res) => {
  res.render('verify', { 
    title: 'Vérification de Coupons - Plateform-Test.cm | Service Sécurisé',
    success_msg: req.flash('success_msg'),
    error_msg: req.flash('error_msg')
  });
};

/**
 * Afficher la page de connexion
 * GET /login
 */
const getLoginPage = (req, res) => {
  res.render('login', { 
    title: 'Connexion - Platform Web Test'
  });
};

/**
 * Afficher la page d'enregistrement
 * GET /register
 */
// L'inscription publique est fermée : les comptes sont créés depuis /admin.
const getRegisterPage = (req, res) => {
  res.redirect('/login');
};

/**
 * Afficher la page de profil
 * GET /profile
 */
const getProfilePage = (req, res) => {
  res.render('profile', { 
    title: 'Profil - Platform Web Test'
  });
};

/**
 * Afficher la page d'administration des coupons
 * GET /admin-coupons
 */
const getAdminCouponsPage = (req, res) => {
  res.redirect('/admin');
};

const getAdminUsersPage = (req, res) => {
  res.redirect('/admin');
};

/**
 * Afficher la page d'erreur
 * GET /error
 */
const getErrorPage = (req, res) => {
  res.render('error', {
    title: 'Erreur - Platform Web Test',
    message: req.query.message || 'Une erreur est survenue',
    error: req.query.error ? { stack: req.query.error } : null
  });
};

/**
 * Route legacy pour la compatibilité
 * POST /verify-coupon
 */
const legacyVerifyCoupon = async (req, res) => {
  try {
    const { type, montant, devise, code, mail } = req.body;
    
    // Rediriger vers l'API
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        montant,
        devise,
        codes: code,
        email: mail
      })
    });

    const result = await response.json();
    
    if (result.success) {
      req.flash('success_msg', result.message);
    } else {
      req.flash('error_msg', result.message);
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('Error in legacy route:', error);
    req.flash('error_msg', 'Une erreur est survenue.');
    res.redirect('/');
  }
};

const { sequelize } = require('../models');

const dropDatabase = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'La suppression de la base de données est désactivée'
  });
};

const getAdminPage = (req, res) => {
  res.render('admin', {
    title: 'Administration - Plateform-Test'
  });
};

const redirectToAdmin = (req, res) => {
  res.redirect('/admin');
};

module.exports = {
  getNewHomePage,
  getVerifyPage,
  getLoginPage,
  getRegisterPage,
  getProfilePage,
  getAdminCouponsPage,
  getAdminUsersPage,
  getAdminPage,
  redirectToAdmin,
  getErrorPage,
  legacyVerifyCoupon,
  dropDatabase
}; 