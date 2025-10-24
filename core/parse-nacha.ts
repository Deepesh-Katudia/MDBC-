import { NachaEntry } from './types';

export function parseNACHA(input: string): NachaEntry {
  const lines = input.split('\n').map((l) => l.trim()).filter(Boolean);

  const fileHeader: Record<string, string> = {};
  const batchHeader: Record<string, string> = {};
  const entries: Array<{
    name: string;
    routing: string;
    account: string;
    amountCents: number;
    memo?: string;
  }> = [];
  const controls: Record<string, string> = {};

  for (const line of lines) {
    const recordType = line.substring(0, 1);

    if (recordType === '1') {
      fileHeader.recordType = '1';
      fileHeader.priorityCode = line.substring(1, 3);
      fileHeader.immediateDestination = line.substring(3, 13).trim();
      fileHeader.immediateOrigin = line.substring(13, 23).trim();
      fileHeader.fileCreationDate = line.substring(23, 29).trim();
      fileHeader.fileCreationTime = line.substring(29, 33).trim();
      fileHeader.fileIdModifier = line.substring(33, 34).trim();
      fileHeader.recordSize = line.substring(34, 37).trim();
      fileHeader.blockingFactor = line.substring(37, 39).trim();
      fileHeader.formatCode = line.substring(39, 40).trim();
      fileHeader.immediateDestinationName = line.substring(40, 63).trim();
      fileHeader.immediateOriginName = line.substring(63, 86).trim();
      fileHeader.referenceCode = line.substring(86, 94).trim();
    } else if (recordType === '5') {
      batchHeader.recordType = '5';
      batchHeader.serviceClassCode = line.substring(1, 4).trim();
      batchHeader.companyName = line.substring(4, 20).trim();
      batchHeader.companyDiscretionaryData = line.substring(20, 40).trim();
      batchHeader.companyId = line.substring(40, 50).trim();
      batchHeader.standardEntryClass = line.substring(50, 53).trim();
      batchHeader.companyEntryDescription = line.substring(53, 63).trim();
      batchHeader.companyDescriptiveDate = line.substring(63, 69).trim();
      batchHeader.effectiveEntryDate = line.substring(69, 75).trim();
      batchHeader.originatorStatusCode = line.substring(87, 88).trim();
      batchHeader.originatingDFI = line.substring(79, 87).trim();
      batchHeader.batchNumber = line.substring(87, 94).trim();
    } else if (recordType === '6') {
      const transactionCode = line.substring(1, 3);
      const routing = line.substring(3, 11).trim();
      const checkDigit = line.substring(11, 12);
      const account = line.substring(12, 29).trim();
      const amountCents = parseInt(line.substring(29, 39).trim(), 10);
      const name = line.substring(54, 76).trim();
      const memo = line.substring(76, 78).trim() || undefined;

      entries.push({
        name,
        routing: routing + checkDigit,
        account,
        amountCents,
        memo,
      });
    } else if (recordType === '8') {
      controls.recordType = '8';
      controls.serviceClassCode = line.substring(1, 4).trim();
      controls.entryCount = line.substring(4, 10).trim();
      controls.entryHash = line.substring(10, 20).trim();
      controls.totalDebit = line.substring(20, 32).trim();
      controls.totalCredit = line.substring(32, 44).trim();
      controls.companyId = line.substring(44, 54).trim();
      controls.originatingDFI = line.substring(79, 87).trim();
      controls.batchNumber = line.substring(87, 94).trim();
    } else if (recordType === '9') {
      controls.fileRecordType = '9';
      controls.batchCount = line.substring(1, 7).trim();
      controls.blockCount = line.substring(7, 13).trim();
      controls.entryAddendaCount = line.substring(13, 21).trim();
      controls.entryHash = line.substring(21, 31).trim();
      controls.totalDebit = line.substring(31, 43).trim();
      controls.totalCredit = line.substring(43, 55).trim();
    }
  }

  if (!fileHeader.recordType) {
    throw new Error('Missing File Header (record type 1)');
  }
  if (!batchHeader.recordType) {
    throw new Error('Missing Batch Header (record type 5)');
  }
  if (entries.length === 0) {
    throw new Error('No entry details found (record type 6)');
  }

  return { fileHeader, batchHeader, entries, controls };
}
