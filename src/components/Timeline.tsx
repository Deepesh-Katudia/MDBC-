import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme/tokens';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <MotiView
          key={item.id}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{
            opacity: {
              type: 'timing',
              duration: 300,
              delay: index * 100,
            },
            translateX: {
              type: 'timing',
              duration: 300,
              delay: index * 100,
            },
          }}
          style={styles.itemContainer}
        >
          <View style={styles.leftColumn}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: item.completed
                    ? theme.success
                    : theme.border,
                },
              ]}
            />
            {index < items.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: item.completed
                      ? theme.success
                      : theme.border,
                  },
                ]}
              />
            )}
          </View>
          <View style={styles.content}>
            <Text
              style={[
                typography.body,
                {
                  color: item.completed ? theme.text : theme.textMuted,
                  fontWeight: item.completed ? '600' : '400',
                },
              ]}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: spacing.xs },
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: -2,
  },
});
