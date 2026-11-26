const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

// L'inscription publique est fermée : les comptes sont créés par un admin.
const register = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'L\'inscription publique est fermée. Un administrateur doit créer le compte.'
  });
};

const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'utilisateur et le mot de passe sont requis'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'user';
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ce nom d\'utilisateur existe déjà'
      });
    }

    const user = await User.create({
      username,
      password,
      role: assignedRole
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password, fcmToken } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Récupérer l'utilisateur depuis le middleware d'authentification
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (user) {
      user.fcmToken = null;
      await user.save();
      console.log(`User ${user.username} logged out, fcmToken cleared`);
    }

    res.json({
      success: true,
      message: 'Logout successful',
      data: {
        userId: userId,
        logoutTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (fcmToken !== undefined) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all users via API
const getAllUsersAPI = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });
    const usersWithoutPasswords = users.map(u => u.toJSON());
    
    res.json({
      success: true,
      data: usersWithoutPasswords,
      message: 'Utilisateurs récupérés avec succès'
    });
  } catch (error) {
    console.error('Get all users API error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Delete a specific user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (req.user && user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur'
        });
      }
    }

    await user.destroy();
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};

// Delete all users
const deleteAllUsers = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'La suppression de tous les utilisateurs est désactivée'
  });
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getAllUsersAPI,
  createUser,
  deleteUser,
  deleteAllUsers
}; 