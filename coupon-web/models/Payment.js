const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Paiement reçu du client (en XAF). Le « déjà payé » est la somme des
 * paiements ; ils couvrent les gains des coupons les plus anciens d'abord.
 */
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdByName: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;
