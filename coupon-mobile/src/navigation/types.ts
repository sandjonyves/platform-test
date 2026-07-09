import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CouponFilter } from '../types';

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
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

export type CouponCounts = Record<CouponFilter, number>;
