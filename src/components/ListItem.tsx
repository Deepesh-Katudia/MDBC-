import React, { ReactNode } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme/tokens';
import { triggerLight } from '../utils/haptics';

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  onPress?: () => void;
  leftIcon?: string;
}

export function ListItem({
  title,
  subtitle,
  rightElement,
  onPress,
  leftIcon,
}: ListItemProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      triggerLight();
      onPress();
    }
  };

  const Component: React.ComponentType<any> = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress ? handlePress : undefined}
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}
      activeOpacity={0.7}
    >
      {leftIcon && <Text style={styles.leftIcon}>{leftIcon}</Text>}
      <View style={styles.content}>
        <Text style={[typography.body, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text
            style={[
              typography.bodySmall,
              { color: theme.textSecondary, marginTop: spacing.xs },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      {onPress && !rightElement && (
        <Text style={[typography.body, { color: theme.textMuted }]}>›</Text>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  leftIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  rightElement: {
    marginLeft: spacing.md,
  },
});
