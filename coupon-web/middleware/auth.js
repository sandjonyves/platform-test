const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Secret key for JWT (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // 401 : les clients déconnectent l'utilisateur sur 401, un jeton
    // invalide ou expiré doit donc renvoyer à l'écran de connexion.
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  let user;
  try {
    user = await User.findByPk(decoded.userId);
  } catch (error) {
    // Base momentanément injoignable : ce n'est pas un problème de jeton,
    // on ne doit pas déconnecter l'utilisateur.
    console.error('Auth: database error while loading user:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Service momentanément indisponible, réessayez.'
    });
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  req.user = user;
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs'
    });
  }
  next();
};

const generateToken = (user) => {
  const userId = user && user.id ? user.id : user;
  const role = user && user.role ? user.role : undefined;
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  JWT_SECRET
}; 