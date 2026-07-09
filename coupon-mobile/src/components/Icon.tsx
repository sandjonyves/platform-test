import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { StyleProp, TextStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 22, color = '#64748B', style }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
