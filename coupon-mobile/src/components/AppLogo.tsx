import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

const logo = require('../assets/logo.png');

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export function AppLogo({ size = 120, style }: AppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }, style]}>
      <Image
        source={logo}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        resizeMode="cover"
        accessibilityLabel="Logo Plateform-Test"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});
