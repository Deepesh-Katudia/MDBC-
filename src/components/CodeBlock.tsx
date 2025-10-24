import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../theme/tokens';
import { triggerSuccess } from '../utils/haptics';

interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: number;
  showCopy?: boolean;
}

export function CodeBlock({
  code,
  language = 'xml',
  maxHeight = 400,
  showCopy = true,
}: CodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    triggerSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: borderRadius.md,
        },
      ]}
    >
      {showCopy && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            {language.toUpperCase()}
          </Text>
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
            <Text style={[typography.bodySmall, { color: theme.primary }]}>
              {copied ? '✓ Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        style={[styles.scrollView, { maxHeight }]}
        horizontal
        showsHorizontalScrollIndicator={true}
      >
        <ScrollView showsVerticalScrollIndicator={true}>
          <Text
            style={[
              typography.code,
              {
                color: theme.text,
                padding: spacing.md,
              },
            ]}
          >
            {code}
          </Text>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  copyButton: {
    padding: spacing.xs,
  },
  scrollView: {
    width: '100%',
  },
});
