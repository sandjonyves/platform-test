import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CouponFilter } from '../types';

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
  CouponDetail: { couponId: number };
};

export type MainTabParamList = {
  Coupons: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type CouponDetailScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'CouponDetail'
>;

export type CouponCounts = Record<CouponFilter, number>;
