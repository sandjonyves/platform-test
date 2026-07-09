import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

const TOKEN_KEY = '@coupon_token';
const USER_KEY = '@coupon_user';

export const authStorage = {
  async saveAuth(token: string, user: User): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },
};
