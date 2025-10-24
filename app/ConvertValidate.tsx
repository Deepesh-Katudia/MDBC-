import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../src/theme/ThemeContext';
import { spacing, typography } from '../src/theme/tokens';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { CodeBlock } from '../src/components/CodeBlock';
import { Timeline } from '../src/components/Timeline';
import { useAppStore } from '../src/store/useAppStore';
import { validatePacs008, validatePain001 } from '../core/validate-xml';
import { exportXML } from '../src/utils/export';
import { triggerSuccess, triggerError, triggerWarning } from '../src/utils/haptics';
import { detectMT103Risks, detectNACHARisks } from '../src/utils/risk-detection';
import { MT103, NachaEntry } from '../core/types';
import { generateUUID } from '../src/utils/formatters';
import { inferAssumptions } from '../src/utils/infer-assumptions';

type AnalysisSummary = {
  score: number;
  assumptionsCount: number;
  risksTotal: number;
  risksByLevel: Record<'low' | 'medium' | 'high', number>;
};

type Step = 0 | 1 | 2 | 3 | 4;

export default function ConvertValidate() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const currentType = useAppStore((s) => s.currentType);
  const generatedXml = useAppStore((s) => s.generatedXml);
  const mappingReport = useAppStore((s) => s.mappingReport);
  const parsedData = useAppStore((s) => s.parsedData);
  const validationResult = useAppStore((s) => s.validationResult);
  const setValidationResult = useAppStore((s) => s.setValidationResult);
  const setRisks = useAppStore((s) => s.setRisks);
  const addToHistory = useAppStore((s) => s.addToHistory);
  const risks = useAppStore((s) => s.risks);

  const [step, setStep] = useState<Step>(0);
  const [downloading, setDownloading] = useState(false);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [showAllAssumptions, setShowAllAssumptions] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);

  // layout caps for inner widgets (page itself scrolls)
  const H = Dimensions.get('window').height;
  const TL_MAX = Math.max(140, Math.min(260, H * 0.28));
  const XML_MAX = Math.max(220, Math.min(500, H * 0.5));

  useEffect(() => {
    if (!generatedXml) {
      navigation.navigate('Home' as never);
      return;
    }
    performValidation();
    detectRisks();

    const inferred = inferAssumptions({
      xml: generatedXml,
      currentType: currentType === 'MT103' ? 'MT103' : 'NACHA',
      mappingReport: mappingReport ?? undefined,
    });
    setAssumptions(inferred);
    setShowAllAssumptions(false);
    setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedXml, currentType, mappingReport]);

  // Build analysis whenever inputs change
  useEffect(() => {
    const byLevel: AnalysisSummary['risksByLevel'] = { low: 0, medium: 0, high: 0 };
    risks.forEach((r) => {
      const lvl = (r.level || '').toLowerCase();
      if (lvl === 'high') byLevel.high++;
      else if (lvl === 'medium') byLevel.medium++;
      else byLevel.low++;
    });

    const assumptionsPenalty = Math.min(assumptions.length * 3, 30); // up to -30
    const riskPenalty = Math.min(byLevel.high * 20 + byLevel.medium * 8 + byLevel.low * 2, 60); // up to -60
    const validityBonus = validationResult?.valid ? 10 : 0;
    const base = 50 + validityBonus;
    const score = Math.max(0, Math.min(100, base - assumptionsPenalty - riskPenalty));

    setAnalysis({
      score,
      assumptionsCount: assumptions.length,
      risksTotal: risks.length,
      risksByLevel: byLevel,
    });
  }, [assumptions, risks, validationResult]);

  const performValidation = () => {
    if (!currentType || !generatedXml) return;
    try {
      const result =
        currentType === 'MT103' ? validatePacs008(generatedXml) : validatePain001(generatedXml);
      setValidationResult(result);
      result.valid ? triggerSuccess() : triggerWarning();
    } catch (e) {
      triggerError();
      setValidationResult({ valid: false, errors: [(e as Error).message] });
    }
  };

  const detectRisks = () => {
    if (!parsedData || !currentType) return;
    const detected =
      currentType === 'MT103'
        ? detectMT103Risks(parsedData as MT103)
        : detectNACHARisks(parsedData as NachaEntry);
    setRisks(detected);
  };

  const handleCopyXML = async () => {
    try {
      await Clipboard.setStringAsync(generatedXml || '');
      triggerSuccess();
      Alert.alert('Copied', 'XML copied to clipboard');
    } catch {
      triggerError();
      Alert.alert('Error', 'Failed to copy XML');
    }
  };

  const handleDownloadXML = async () => {
    if (!generatedXml) return;
    setDownloading(true);
    const filename = `${currentType || 'XML'}_${Date.now()}.xml`;
    try {
      if (Platform.OS === 'web') {
        // @ts-ignore web globals exist
        const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8' });
        // @ts-ignore
        const url = URL.createObjectURL(blob);
        // @ts-ignore
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        // @ts-ignore
        document.body.appendChild(a);
        a.click();
        // @ts-ignore
        document.body.removeChild(a);
        // @ts-ignore
        URL.revokeObjectURL(url);
      } else {
        await exportXML(generatedXml, filename);
      }
      triggerSuccess();
      Alert.alert('Success', 'XML downloaded successfully');
    } catch {
      triggerError();
      Alert.alert('Error', 'Failed to download XML');
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!mappingReport || !validationResult || !currentType) return;
    addToHistory({
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      type: currentType,
      status: validationResult.valid ? 'Valid' : 'Errors',
      errorCount: validationResult.valid ? 0 : validationResult.errors.length,
      xml: generatedXml,
      mappingReport,
      risks,
    });
    triggerSuccess();
    Alert.alert('Saved', 'Conversion saved to history', [
      { text: 'OK', onPress: () => navigation.navigate('Home' as never) },
    ]);
  };

  const timelineItems = [
    { id: '1', title: 'Parsed', description: `Successfully parsed ${currentType} data`, completed: true },
    { id: '2', title: 'Built', description: 'Generated ISO 20022 XML', completed: true },
    {
      id: '3',
      title: 'Validated',
      description: validationResult?.valid
        ? `✓ Valid (${validationResult.validationTimeMs}ms)`
        : `✗ ${validationResult?.errors.length || 0} errors`,
      completed: true,
    },
  ];

  const totalSteps = 5;
  const shownAssumptions = showAllAssumptions ? assumptions : assumptions.slice(0, 8);
  const hiddenCount = Math.max(assumptions.length - shownAssumptions.length, 0);
  const scoreBarWidth = useMemo(() => Math.max(6, analysis?.score ?? 0), [analysis?.score]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {/* Header + step indicator */}
        <View style={styles.headerRow}>
          <Text style={[typography.h2, { color: theme.text }]}>Convert & Validate</Text>
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            {step + 1} of {totalSteps}
          </Text>
        </View>

        {/* STEP 0: Timeline */}
        {step === 0 && (
          <Card style={{ ...styles.card, maxHeight: TL_MAX }}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>
              Conversion Timeline
            </Text>
            <Timeline items={timelineItems} />
          </Card>
        )}

        {/* STEP 1: Assumptions */}
        {step === 1 && (
          <Card style={styles.card}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.xs }]}>
              Assumptions / Missing Data
            </Text>
            {shownAssumptions.length === 0 ? (
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>No assumptions detected.</Text>
            ) : (
              shownAssumptions.map((a, i) => (
                <Text
                  key={`${a}-${i}`}
                  style={[typography.bodySmall, { color: theme.textSecondary, marginTop: i ? spacing.xs : 0 }]}
                >
                  • {a}
                </Text>
              ))
            )}
            {hiddenCount > 0 && !showAllAssumptions && (
              <TouchableOpacity onPress={() => setShowAllAssumptions(true)} style={{ marginTop: spacing.xs }}>
                <Text style={[typography.caption, { color: theme.primary }]}>+{hiddenCount} more…</Text>
              </TouchableOpacity>
            )}
            {showAllAssumptions && assumptions.length > 8 && (
              <TouchableOpacity onPress={() => setShowAllAssumptions(false)} style={{ marginTop: spacing.xs }}>
                <Text style={[typography.caption, { color: theme.primary }]}>Show less</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* STEP 2: Analytics */}
        {step === 2 && analysis && (
          <Card style={styles.card}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.sm }]}>
              Analysis Summary
            </Text>

            {/* Score bar */}
            <View style={[styles.scoreWrap, { backgroundColor: theme.border }]}>
              <View style={[styles.scoreFill, { width: `${scoreBarWidth}%`, backgroundColor: theme.primary }]} />
            </View>
            <Text style={[typography.body, { color: theme.text, marginTop: spacing.xs }]}>
              Completeness score:{' '}
              <Text style={{ fontWeight: '700', color: theme.primary }}>{analysis.score}</Text>/100
            </Text>

            {/* KPIs */}
            <View style={styles.kpiRow}>
              <View style={[styles.kpi, { borderColor: theme.border }]}>
                <Text style={[typography.caption, { color: theme.textMuted }]}>Assumptions</Text>
                <Text style={[typography.h3, { color: theme.text }]}>{analysis.assumptionsCount}</Text>
              </View>
              <View style={[styles.kpi, { borderColor: theme.border }]}>
                <Text style={[typography.caption, { color: theme.textMuted }]}>Risks</Text>
                <Text style={[typography.h3, { color: theme.text }]}>{analysis.risksTotal}</Text>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: spacing.xs }]}>
                  H:{analysis.risksByLevel.high} · M:{analysis.risksByLevel.medium} · L:{analysis.risksByLevel.low}
                </Text>
              </View>
              <View style={[styles.kpi, { borderColor: theme.border }]}>
                <Text style={[typography.caption, { color: theme.textMuted }]}>Validity</Text>
                <Text style={[typography.h3, { color: validationResult?.valid ? theme.success : theme.danger }]}>
                  {validationResult?.valid ? 'Valid' : 'Errors'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
              <Button title="View Risks" onPress={() => navigation.navigate('Risks' as never)} />
              <View style={{ width: spacing.sm }} />
              <Button title="Show Assumptions" variant="secondary" onPress={() => setStep(1)} />
              <View style={{ width: spacing.sm }} />
              <Button title="Save" variant="outline" onPress={handleSaveToHistory} />
            </View>
          </Card>
        )}

        {/* STEP 3: Validation */}
        {step === 3 && (
          <Card style={styles.card}>
            <View style={styles.validationHeader}>
              <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Validation Result</Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>Soft Validator (Fallback)</Text>
            </View>

            {validationResult?.valid ? (
              <View style={[styles.validationBanner, { backgroundColor: theme.successBg }]}>
                <Text style={[typography.body, { color: theme.success }]}>✓ XML is valid</Text>
                {!!validationResult.validationTimeMs && (
                  <Text style={[typography.bodySmall, { color: theme.success }]}>
                    Validated in {validationResult.validationTimeMs}ms
                  </Text>
                )}
              </View>
            ) : (
              <View style={[styles.validationBanner, { backgroundColor: theme.dangerBg }]}>
                <Text style={[typography.body, { color: theme.danger }]}>
                  ✗ {validationResult?.errors.length || 0} validation errors
                </Text>
                {(validationResult?.errors || []).slice(0, 3).map((e, i) => (
                  <Text
                    key={i}
                    style={[typography.bodySmall, { color: theme.danger, marginTop: spacing.xs }]}
                    numberOfLines={2}
                  >
                    • {e}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* STEP 4: XML */}
        {step === 4 && (
          <Card style={styles.card}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginBottom: spacing.xs }]}>
              Generated XML
            </Text>
            <CodeBlock code={generatedXml} language="xml" maxHeight={XML_MAX} />

            <View style={{ marginTop: spacing.md }}>
              <Button title="Copy XML" onPress={handleCopyXML} fullWidth />
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Button
                title={downloading ? 'Downloading…' : 'Download XML'}
                onPress={handleDownloadXML}
                fullWidth
                disabled={downloading}
              />
            </View>

            <View style={styles.saveRow}>
              <Button title="Save" onPress={handleSaveToHistory} variant="outline" />
            </View>
          </Card>
        )}

        {/* PAGER CONTROLS */}
        <View style={styles.pagerRow}>
          <Button
            title="◀ Prev"
            onPress={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            size="medium"
            fullWidth={false}
            disabled={step === 0}
          />
          <View style={{ width: spacing.md }} />
          <Button
            title={step < totalSteps - 1 ? 'Next ▶' : 'Done'}
            onPress={() => {
              if (step < totalSteps - 1) setStep((s) => ((s + 1) as Step));
              else navigation.navigate('Home' as never);
            }}
            size="medium"
            fullWidth={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  headerRow: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  card: {
    marginBottom: spacing.md, // space between cards
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  validationBanner: {
    padding: spacing.md,
    borderRadius: 8,
  },
  saveRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagerRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  kpi: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 140,
  },
  scoreWrap: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
  },
});
