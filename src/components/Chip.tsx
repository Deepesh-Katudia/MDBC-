import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius } from '../theme/tokens';
import { RiskLevel } from '../../core/types';
import { triggerLight } from '../utils/haptics';

interface ChipProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  onPress?: () => void;
  selected?: boolean;
}

export function Chip({
  label,
  variant = 'default',
  size = 'medium',
  onPress,
  selected = false,
}: ChipProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      triggerLight();
      onPress();
    }
  };

  const getBackgroundColor = () => {
    if (selected) return theme.primary;
    switch (variant) {
      case 'success':
        return theme.successBg;
      case 'warning':
        return theme.warningBg;
      case 'danger':
        return theme.dangerBg;
      case 'info':
        return theme.infoBg;
      default:
        return theme.surfaceHover;
    }
  };

  const getTextColor = () => {
    if (selected) return '#FFFFFF';
    switch (variant) {
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'danger':
        return theme.danger;
      case 'info':
        return theme.info;
      default:
        return theme.text;
    }
  };

  const chipStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: borderRadius.full,
    paddingVertical: size === 'small' ? spacing.xs : spacing.sm,
    paddingHorizontal: size === 'small' ? spacing.sm : spacing.md,
    alignSelf: 'flex-start',
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: selected ? 1.05 : 1 }}
      transition={{ scale: { type: 'timing', duration: 150 } }}
    >
      <Component
        onPress={onPress ? handlePress : undefined}
        style={chipStyle}
        activeOpacity={0.7}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={label}
      >
        <Text
          style={{
            color: getTextColor(),
            fontSize: size === 'small' ? 12 : 14,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      </Component>
    </MotiView>
  );
}

interface RiskChipProps {
  level: RiskLevel;
  label: string;
  onPress?: () => void;
}

export function RiskChip({ level, label, onPress }: RiskChipProps) {
  const variantMap: Record<RiskLevel, 'info' | 'warning' | 'danger'> = {
    Info: 'info',
    Warning: 'warning',
    Critical: 'danger',
  };

  return <Chip label={label} variant={variantMap[level]} onPress={onPress} />;
}

const View = ({ children, style }: any) => {
  return <MotiView style={style}>{children}</MotiView>;
};
