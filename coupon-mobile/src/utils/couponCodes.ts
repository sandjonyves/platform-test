import type { CodeName, Coupon } from '../types';

export const CODE_FIELDS: {
  name: CodeName;
  label: string;
  key: keyof Coupon;
  validKey: keyof Coupon;
}[] = [
  { name: 'code1', label: 'Code 1', key: 'code1', validKey: 'code1Valid' },
  { name: 'code2', label: 'Code 2', key: 'code2', validKey: 'code2Valid' },
  { name: 'code3', label: 'Code 3', key: 'code3', validKey: 'code3Valid' },
  { name: 'code4', label: 'Code 4', key: 'code4', validKey: 'code4Valid' },
];

export function getExistingCodeFields(coupon: Coupon) {
  return CODE_FIELDS.filter((field) => Boolean(coupon[field.key]));
}

export function allCodesReviewed(
  coupon: Coupon,
  reviewedCodes: Set<CodeName>,
): boolean {
  const existing = getExistingCodeFields(coupon);
  return existing.length > 0 && existing.every((field) => reviewedCodes.has(field.name));
}
