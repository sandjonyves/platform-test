export type CouponStatus = 'pending' | 'verified' | 'invalid';

export type CouponType =
  | 'NEOSURF'
  | 'PCS'
  | 'TRANSCASH'
  | 'PAYSAFECARD'
  | 'GOOGLE PLAY'
  | 'STEAM'
  | 'FLEXEPIN'
  | 'CASHLIB'
  | 'NETFLIX'
  | 'AMAZON';

export type CouponDevise = 'EURO' | 'Dollar' | 'Dollard';

export type CodeName = 'code1' | 'code2' | 'code3' | 'code4';

export interface User {
  id: number;
  username: string;
  role?: 'admin' | 'user';
  fcmToken?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: number;
  type: CouponType;
  montant: string;
  devise: CouponDevise;
  code1: string;
  code1Valid: boolean;
  code2?: string | null;
  code2Valid: boolean;
  code3?: string | null;
  code3Valid: boolean;
  code4?: string | null;
  code4Valid: boolean;
  email: string;
  status: CouponStatus;
  verificationDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export type CouponFilter = 'all' | CouponStatus;

/** Gain d'un coupon validé (voir coupon-web/services/gainService.js). */
export interface GainItem {
  id: number;
  type: CouponType;
  montant: number;
  devise: CouponDevise;
  gain: number;
  duplicate: boolean;
  duplicateOf: number | null;
  /** Part du gain couverte par les paiements (XAF). */
  paidAmount: number;
  paid: boolean;
  partial: boolean;
}

export interface Payment {
  id: number;
  amount: number;
  createdByName?: string | null;
  createdAt: string;
}

export interface GainsTotals {
  totalGain: number;
  paid: number;
  due: number;
  gainCount: number;
  duplicateCount: number;
  validatedCount: number;
}

export interface GainsReport {
  rate: number;
  items: GainItem[];
  totals: GainsTotals;
  payments: Payment[];
}
