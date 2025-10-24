import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/theme/ThemeContext';
import { spacing, typography, borderRadius } from '../src/theme/tokens';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { useAppStore } from '../src/store/useAppStore';
import { parseMT103 } from '../core/parse-mt103';
import { parseNACHA } from '../core/parse-nacha';
import { triggerError, triggerSuccess } from '../src/utils/haptics';

export default function Import() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  const { type } = route.params as { type: 'MT103' | 'NACHA' };

  const [input, setInput] = useState('');
  const [detectedFields, setDetectedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const setCurrentType = useAppStore((state) => state.setCurrentType);
  const setRawInput = useAppStore((state) => state.setRawInput);
  const setParsedData = useAppStore((state) => state.setParsedData);

  useEffect(() => {
    setCurrentType(type);
    loadSampleData();
  }, [type]);

  const loadSampleData = () => {
    if (type === 'MT103') {
      const sample = `:20:TRNREF123456
:32A:250930USD1234,56
:50K:/123456789
JOHN DOE
123 CAMPUS RD
CITY ST
:59:/987654321
JANE STUDENT
45 DORM WAY
CITY ST
:70:Utilities share for Sep
:71A:SHA`;
      setInput(sample);
      detectFields(sample, type);
    } else {
      const sample = `101 123456789 9876543212509300000000A094101MDCB BANK           STUDENT FILE
5225STUDENT CLUB       123456789PPDREIMBURSE       250930   1123456780000001
6229876543211234567890        0000012345JANE STUDENT       RENT SHARE     0
82200000010000012345                                        123456780000001
9000001000001000000010000012345`;
      setInput(sample);
      detectFields(sample, type);
    }
  };

  const detectFields = (text: string, formatType: 'MT103' | 'NACHA') => {
    const fields: string[] = [];
    if (formatType === 'MT103') {
      const tags = text.match(/:\d+[A-Z]*:/g);
      if (tags) {
        fields.push(...tags.map((t) => t.replace(/:/g, '')));
      }
    } else {
      const lines = text.split('\n');
      lines.forEach((line) => {
        if (line.trim()) {
          const recordType = line.charAt(0);
          if (recordType === '1') fields.push('File Header');
          if (recordType === '5') fields.push('Batch Header');
          if (recordType === '6') fields.push('Entry Detail');
          if (recordType === '8') fields.push('Batch Control');
          if (recordType === '9') fields.push('File Control');
        }
      });
    }
    setDetectedFields([...new Set(fields)]);
  };

  useEffect(() => {
    if (input) {
      detectFields(input, type);
    }
  }, [input]);

  const handleContinue = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter some data to parse');
      return;
    }

    setLoading(true);
    try {
      if (type === 'MT103') {
        const parsed = parseMT103(input);
        setParsedData(parsed);
      } else {
        const parsed = parseNACHA(input);
        setParsedData(parsed);
      }
      setRawInput(input);
      triggerSuccess();
      navigation.navigate('MappingPreview' as never);
    } catch (error) {
      triggerError();
      Alert.alert(
        'Parsing Error',
        (error as Error).message || 'Failed to parse input'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[typography.h2, { color: theme.text }]}>
          Import {type}
        </Text>
        <Text
          style={[
            typography.body,
            { color: theme.textSecondary, marginTop: spacing.sm },
          ]}
        >
          {type === 'MT103'
            ? 'Paste SWIFT MT103 message text below'
            : 'Paste NACHA ACH file content below'}
        </Text>
      </View>

      <Card>
        <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>
          Input Data
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.border,
              marginTop: spacing.sm,
            },
          ]}
          value={input}
          onChangeText={setInput}
          multiline
          placeholder={`Paste your ${type} data here...`}
          placeholderTextColor={theme.textMuted}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Card>

      {detectedFields.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text
            style={[typography.body, { color: theme.text, fontWeight: '600' }]}
          >
            Detected Fields
          </Text>
          <View style={styles.chipsContainer}>
            {detectedFields.map((field, idx) => (
              <View key={idx} style={{ marginRight: spacing.sm, marginTop: spacing.sm }}>
                <Chip label={field} variant="info" size="small" />
              </View>
            ))}
          </View>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="Load Sample Data"
          onPress={loadSampleData}
          variant="outline"
          fullWidth
        />
        <View style={{ height: spacing.md }} />
        <Button
          title="Continue to Mapping Preview"
          onPress={handleContinue}
          fullWidth
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 200,
    fontFamily: 'Courier New',
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
