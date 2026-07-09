import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CouponDetailScreen } from '../screens/CouponDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { setupNotificationHandlers } from '../services/notifications';
import type {
  AuthStackParamList,
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList,
} from './types';
import { colors } from '../theme';
import { Icon } from '../components/Icon';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function CouponsNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CouponDetail"
        component={CouponDetailScreen}
        options={{
          title: 'Détail coupon',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
        }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}>
      <Tab.Screen
        name="Coupons"
        component={CouponsNavigator}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}

export function AppNavigator() {
  useEffect(() => {
    const unsubscribe = setupNotificationHandlers(
      (couponId) => {
        Alert.alert(
          'Nouveau coupon',
          `Coupon #${couponId} reçu.`,
          [
            { text: 'Plus tard', style: 'cancel' },
            {
              text: 'Voir',
              onPress: () => navigateToCoupon(Number(couponId)),
            },
          ],
        );
      },
      (couponId) => navigateToCoupon(Number(couponId)),
    );
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function navigateToCoupon(couponId: number) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Main');
  setTimeout(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Main', {
        screen: 'Coupons',
        params: {
          screen: 'CouponDetail',
          params: { couponId },
        },
      } as never);
    }
  }, 300);
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
});
