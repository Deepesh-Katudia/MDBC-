import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { spacing, typography } from '../src/theme/tokens';
import { Card } from '../src/components/Card';
import { RiskChip } from '../src/components/Chip';
import { EmptyState } from '../src/components/EmptyState';
import { useAppStore } from '../src/store/useAppStore';
import { useNavigation } from '@react-navigation/native';

export default function Risks() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const risks = useAppStore((state) => state.risks);

  if (risks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          title="No Risks Detected"
          description="The conversion looks good! No significant risks were identified."
          icon="✓"
          actionLabel="Go Home"
          onAction={() => navigation.navigate('Home' as never)}
        />
      </View>
    );
  }

  const criticalRisks = risks.filter((r) => r.level === 'Critical');
  const warningRisks = risks.filter((r) => r.level === 'Warning');
  const infoRisks = risks.filter((r) => r.level === 'Info');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[typography.h2, { color: theme.text }]}>
          Risk Analysis
        </Text>
        <Text
          style={[
            typography.body,
            { color: theme.textSecondary, marginTop: spacing.sm },
          ]}
        >
          {risks.length} risk{risks.length !== 1 ? 's' : ''} detected
        </Text>
      </View>

      <View style={styles.summary}>
        {criticalRisks.length > 0 && (
          <RiskChip
            level="Critical"
            label={`${criticalRisks.length} Critical`}
          />
        )}
        {warningRisks.length > 0 && (
          <View style={{ marginLeft: spacing.sm }}>
            <RiskChip
              level="Warning"
              label={`${warningRisks.length} Warning${warningRisks.length !== 1 ? 's' : ''}`}
            />
          </View>
        )}
        {infoRisks.length > 0 && (
          <View style={{ marginLeft: spacing.sm }}>
            <RiskChip
              level="Info"
              label={`${infoRisks.length} Info`}
            />
          </View>
        )}
      </View>

      {criticalRisks.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={[
              typography.h3,
              { color: theme.danger, marginBottom: spacing.md },
            ]}
          >
            Critical Risks
          </Text>
          {criticalRisks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </View>
      )}

      {warningRisks.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={[
              typography.h3,
              { color: theme.warning, marginBottom: spacing.md },
            ]}
          >
            Warnings
          </Text>
          {warningRisks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </View>
      )}

      {infoRisks.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={[
              typography.h3,
              { color: theme.info, marginBottom: spacing.md },
            ]}
          >
            Information
          </Text>
          {infoRisks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function RiskCard({ risk }: { risk: any }) {
  const { theme } = useTheme();

  const levelColors = {
    Critical: { bg: theme.dangerBg, text: theme.danger },
    Warning: { bg: theme.warningBg, text: theme.warning },
    Info: { bg: theme.infoBg, text: theme.info },
  };

  const colors = levelColors[risk.level as keyof typeof levelColors];

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={styles.riskHeader}>
        <RiskChip level={risk.level} label={risk.level} />
        <Text
          style={[
            typography.body,
            {
              color: theme.text,
              fontWeight: '600',
              flex: 1,
              marginLeft: spacing.md,
            },
          ]}
        >
          {risk.title}
        </Text>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          Why it Matters
        </Text>
        <Text
          style={[
            typography.bodySmall,
            { color: theme.textSecondary, marginTop: spacing.xs },
          ]}
        >
          {risk.description}
        </Text>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          Mitigation
        </Text>
        <Text
          style={[
            typography.bodySmall,
            { color: theme.textSecondary, marginTop: spacing.xs },
          ]}
        >
          {risk.mitigation}
        </Text>
      </View>
    </Card>
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
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
