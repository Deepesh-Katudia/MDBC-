import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../theme/tokens';
import { triggerImpact } from '../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      triggerImpact();
      onPress();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.border;
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return theme.danger;
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    if (variant === 'outline') return theme.primary;
    return '#FFFFFF';
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'large':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: borderRadius.md,
    ...getPadding(),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: variant === 'outline' ? 2 : 0,
    borderColor: variant === 'outline' ? theme.primary : 'transparent',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontSize: size === 'small' ? 14 : 16,
    fontWeight: '600',
  };

  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: disabled ? 1 : 1 }}
      transition={{ scale: { type: 'timing', duration: 150 } }}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={[buttonStyle, style]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    </MotiView>
  );
}
