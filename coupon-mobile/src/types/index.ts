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
