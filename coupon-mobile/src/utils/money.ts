import type { CouponDevise } from '../types';

/** 12500 → "12 500" (séparateur de milliers sans dépendre d'Intl). */
export function formatNumber(value: number): string {
  const rounded = Math.round(Number(value) || 0);
  const sign = rounded < 0 ? '-' : '';
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatXaf(value: number): string {
  return `${formatNumber(value)} XAF`;
}

export function deviseSymbol(devise: CouponDevise): string {
  return devise === 'EURO' ? '€' : '$';
}

export function formatAmount(montant: number | string, devise: CouponDevise): string {
  const n = Number(montant) || 0;
  const text = Number.isInteger(n) ? formatNumber(n) : n.toFixed(2).replace('.', ',');
  return `${text} ${deviseSymbol(devise)}`;
}
