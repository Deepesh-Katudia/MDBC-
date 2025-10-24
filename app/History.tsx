import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/theme/ThemeContext';
import { spacing, typography } from '../src/theme/tokens';
import { ListItem } from '../src/components/ListItem';
import { Chip } from '../src/components/Chip';
import { EmptyState } from '../src/components/EmptyState';
import { useAppStore } from '../src/store/useAppStore';
import { formatTimestamp } from '../src/utils/formatters';

export default function History() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const history = useAppStore((state) => state.history);

  if (history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          title="No History Yet"
          description="Your conversion history will appear here after you complete a conversion."
          icon="📋"
          actionLabel="Start New Conversion"
          onAction={() => navigation.navigate('Home' as never)}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[typography.h2, { color: theme.text }]}>
          Conversion History
        </Text>
        <Text
          style={[
            typography.body,
            { color: theme.textSecondary, marginTop: spacing.sm },
          ]}
        >
          {history.length} conversion{history.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View>
        {history.map((entry) => (
          <ListItem
            key={entry.id}
            title={`${entry.type} Conversion`}
            subtitle={formatTimestamp(new Date(entry.timestamp))}
            leftIcon={entry.type === 'MT103' ? '💳' : '🏦'}
            rightElement={
              <Chip
                label={entry.status}
                variant={entry.status === 'Valid' ? 'success' : 'danger'}
                size="small"
              />
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
});
