import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../src/theme/ThemeContext';
import { spacing, typography } from '../src/theme/tokens';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { Chip } from '../src/components/Chip';
import { useAppStore } from '../src/store/useAppStore';
import { buildPacs008 } from '../core/build-pacs008';
import { buildPain001 } from '../core/build-pain001';
import { MT103, NachaEntry, MappingRow } from '../core/types';
import { triggerSuccess, triggerError } from '../src/utils/haptics';

export default function MappingPreview() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const currentType = useAppStore((s) => s.currentType);
  const parsedData = useAppStore((s) => s.parsedData);
  const setGeneratedXml = useAppStore((s) => s.setGeneratedXml);
  const setMappingReport = useAppStore((s) => s.setMappingReport);

  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [idx, setIdx] = useState(0); // which mapping to show

  useEffect(() => {
    if (!parsedData) {
      navigation.navigate('Home' as never);
      return;
    }
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedData]);

  const generatePreview = () => {
    if (!parsedData || !currentType) return;
    try {
      if (currentType === 'MT103') {
        const { xml, mappingReport } = buildPacs008(parsedData as MT103);
        setMappingRows(mappingReport.rows);
        setAssumptions(mappingReport.assumptions);
        setGeneratedXml(xml);
        setMappingReport(mappingReport);
      } else {
        const { xml, mappingReport } = buildPain001(parsedData as NachaEntry);
        setMappingRows(mappingReport.rows);
        setAssumptions(mappingReport.assumptions);
        setGeneratedXml(xml);
        setMappingReport(mappingReport);
      }
      setIdx(0); // reset to first card
    } catch {
      triggerError();
      Alert.alert('Error', 'Failed to generate mapping preview');
    }
  };

  const handleCopyXPath = async (xpath: string) => {
    await Clipboard.setStringAsync(xpath);
    triggerSuccess();
    Alert.alert('Copied', `XPath copied: ${xpath}`);
  };

  const handleConvert = () => {
    navigation.navigate('ConvertValidate' as never);
  };

  const total = mappingRows.length;
  const current = mappingRows[idx];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h2, { color: theme.text }]}>Mapping Preview</Text>
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            {currentType === 'MT103' ? 'MT103 → pacs.008.001.08' : 'NACHA → pain.001.001.09'}
          </Text>
        </View>

        {/* Assumptions (inline, no scroll) */}
        {assumptions.length > 0 && (
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>
              Assumptions
            </Text>
            <View style={styles.assumptionsRow}>
              {assumptions.slice(0, 3).map((a, i) => (
                <View key={i} style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}>
                  <Chip label={a} variant="info" size="small" />
                </View>
              ))}
              {assumptions.length > 3 && (
                <Chip label={`+${assumptions.length - 3} more`} variant="default" size="small" />
              )}
            </View>
          </Card>
        )}

        {/* Title for the deck + counter */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.deckHeader}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>
              Field Mappings
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {total ? `${idx + 1} of ${total}` : '0'}
            </Text>
          </View>
        </Card>

        {/* Single mapping card (fits one screen) */}
        {current && (
          <Card style={styles.mappingCard}>
            <View style={{ flex: 1 }}>
              <View style={styles.mappingBlock}>
                <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs }]}>
                  Source
                </Text>
                <Text style={[typography.bodySmall, { color: theme.text }]} numberOfLines={2}>
                  {current.source}
                </Text>
                <Text
                  style={[typography.bodySmall, { color: theme.primary, marginTop: spacing.xs, fontWeight: '600' }]}
                  numberOfLines={1}
                >
                  {current.value}
                </Text>
              </View>

              <View style={styles.mappingBlock}>
                <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs }]}>
                  ISO 20022 XPath
                </Text>
                <TouchableOpacity onPress={() => handleCopyXPath(current.targetXPath)}>
                  <Text
                    style={[typography.bodySmall, { color: theme.secondary, fontFamily: 'Courier New' }]}
                    numberOfLines={2}
                  >
                    {current.targetXPath}
                  </Text>
                </TouchableOpacity>

                {!!current.note && (
                  <Text
                    style={[typography.caption, { color: theme.warning, marginTop: spacing.xs }]}
                    numberOfLines={2}
                  >
                    Note: {current.note}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Pager controls */}
        <View style={styles.pager}>
          <Button
            title="◀ Prev"
            onPress={() => setIdx((i) => Math.max(0, i - 1))}
            fullWidth={false}
            size="medium"
            disabled={idx === 0}
          />
          <View style={{ width: spacing.md }} />
          <Button
            title="Next ▶"
            onPress={() => setIdx((i) => Math.min(total - 1, i + 1))}
            fullWidth={false}
            size="medium"
            disabled={idx >= total - 1}
          />
        </View>

        {/* Primary action */}
        <View style={{ marginTop: spacing.md }}>
          <Button title="Convert & Validate" onPress={handleConvert} fullWidth size="large" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'flex-start',
  },
  header: { marginBottom: spacing.md },
  assumptionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mappingCard: {
    flex: 1, // take remaining space so the card + controls fit on one screen
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  mappingBlock: {
    marginBottom: spacing.md,
  },
  pager: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
