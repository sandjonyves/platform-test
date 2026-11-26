const { Payment } = require('../models');
const { getGainsReport } = require('../services/gainService');

const formatXaf = (n) => `${Math.round(n).toLocaleString('fr-FR')} XAF`;

// GET /api/gains — rapport complet (gain par coupon, totaux, paiements)
const getGains = async (req, res) => {
  try {
    const report = await getGainsReport();
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Get gains error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des gains' });
  }
};

// POST /api/payments — body { amount } : enregistre un paiement du client (admin)
const createPayment = async (req, res) => {
  try {
    const raw = String(req.body && req.body.amount != null ? req.body.amount : '')
      .replace(/\s/g, '')
      .replace(',', '.');
    const amount = Number(raw);

    if (!raw || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Entrez un montant entier positif en XAF'
      });
    }

    const { totals } = await getGainsReport();
    if (amount > totals.due) {
      return res.status(400).json({
        success: false,
        message: totals.due > 0
          ? `Le montant dépasse le reste à payer (${formatXaf(totals.due)})`
          : 'Il ne reste rien à payer'
      });
    }

    const payment = await Payment.create({
      amount,
      createdBy: req.user.id,
      createdByName: req.user.username
    });

    res.status(201).json({
      success: true,
      message: `Paiement de ${formatXaf(amount)} enregistré`,
      data: payment.toJSON()
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du paiement' });
  }
};

// DELETE /api/payments/:id — annule un paiement saisi par erreur (admin)
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement introuvable' });
    }
    await payment.destroy();
    res.json({ success: true, message: `Paiement de ${formatXaf(payment.amount)} supprimé` });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du paiement' });
  }
};

module.exports = { getGains, createPayment, deletePayment };
