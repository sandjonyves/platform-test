/**
 * Calcul des gains sur les coupons validés.
 *
 * Règles :
 *  - un coupon validé rapporte montant × GAIN_RATE_XAF (100 € → 4000 XAF),
 *    même taux quelle que soit la devise ;
 *  - un coupon est « répété » si l'un de ses codes figure déjà dans un coupon
 *    validé plus ancien : seul le premier rapporte, les répétitions valent 0 ;
 *  - les coupons non validés ne rapportent rien ;
 *  - les paiements du client (table payments) couvrent les gains des coupons
 *    les plus anciens d'abord : chaque coupon est payé, partiellement payé
 *    ou à payer.
 */
const { Coupon, Payment } = require('../models');

const GAIN_RATE_XAF = Number(process.env.GAIN_RATE_XAF) || 40;

const normalizeCode = (code) => String(code || '').replace(/\s+/g, '').toUpperCase();

const couponCodes = (coupon) =>
  [coupon.code1, coupon.code2, coupon.code3, coupon.code4]
    .map(normalizeCode)
    .filter(Boolean);

const validationTime = (coupon) =>
  new Date(coupon.verificationDate || coupon.updatedAt || coupon.createdAt).getTime();

/**
 * @param {Array} coupons coupons bruts (instances Sequelize ou objets)
 * @param {number} paymentsTotal somme des paiements reçus (XAF)
 * @returns {{ rate:number, items:Array, totals:Object }}
 */
function computeGains(coupons, paymentsTotal = 0) {
  const verified = coupons
    .filter((c) => c.status === 'verified')
    .sort((a, b) => validationTime(a) - validationTime(b) || a.id - b.id);

  const firstCouponByCode = new Map();
  let remainingPayment = Math.max(0, Math.round(Number(paymentsTotal) || 0));
  const items = [];

  for (const coupon of verified) {
    const codes = couponCodes(coupon);
    const repeatedCode = codes.find((code) => firstCouponByCode.has(code));
    const duplicateOf = repeatedCode ? firstCouponByCode.get(repeatedCode) : null;

    for (const code of codes) {
      if (!firstCouponByCode.has(code)) firstCouponByCode.set(code, coupon.id);
    }

    const montant = Number(coupon.montant) || 0;
    const gain = duplicateOf ? 0 : Math.round(montant * GAIN_RATE_XAF);

    // Les paiements couvrent les coupons dans l'ordre chronologique.
    const paidAmount = Math.min(gain, remainingPayment);
    remainingPayment -= paidAmount;

    items.push({
      id: coupon.id,
      type: coupon.type,
      montant,
      devise: coupon.devise,
      email: coupon.email,
      code1: coupon.code1,
      verificationDate: coupon.verificationDate,
      createdAt: coupon.createdAt,
      duplicate: Boolean(duplicateOf),
      duplicateOf,
      gain,
      paidAmount,
      paid: gain > 0 && paidAmount === gain,
      partial: paidAmount > 0 && paidAmount < gain
    });
  }

  const totalGain = items.reduce((sum, i) => sum + i.gain, 0);
  const paid = items.reduce((sum, i) => sum + i.paidAmount, 0);
  const totals = {
    totalGain,
    paid,
    due: totalGain - paid,
    // Paiements reçus au-delà des gains actuels (ex. coupon supprimé ensuite)
    credit: remainingPayment,
    paymentsTotal: Math.max(0, Math.round(Number(paymentsTotal) || 0)),
    gainCount: items.filter((i) => !i.duplicate).length,
    duplicateCount: items.filter((i) => i.duplicate).length,
    validatedCount: items.length
  };

  // Les plus récents en premier pour l'affichage
  items.reverse();

  return { rate: GAIN_RATE_XAF, items, totals };
}

async function getGainsReport() {
  const [coupons, paymentsTotal, payments] = await Promise.all([
    Coupon.findAll({
      attributes: [
        'id', 'type', 'montant', 'devise', 'email', 'status',
        'code1', 'code2', 'code3', 'code4',
        'verificationDate', 'createdAt', 'updatedAt'
      ]
    }),
    Payment.sum('amount'),
    Payment.findAll({
      attributes: ['id', 'amount', 'createdByName', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 50
    })
  ]);

  const report = computeGains(coupons, paymentsTotal || 0);
  report.payments = payments.map((p) => p.toJSON());
  return report;
}

module.exports = { GAIN_RATE_XAF, computeGains, getGainsReport };
