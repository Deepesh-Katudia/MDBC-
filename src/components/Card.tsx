import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme/tokens';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  noPadding?: boolean;
}

export function Card({
  children,
  style,
  padding = 'md',
  noPadding = false,
}: CardProps) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    padding: noPadding ? 0 : spacing[padding],
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.sm,
  };

  return <View style={[cardStyle, style]}>{children}</View>;
}
