import { create } from 'xmlbuilder2';
import { MT103, MappingReport, MappingRow } from './types';
import { normalizeDate, generateUUID } from '../src/utils/formatters';

export function buildPacs008(
  mt103: MT103
): { xml: string; mappingReport: MappingReport } {
  const messageId = `PACS${generateUUID()}`;
  const endToEndId = mt103.trnRef || `E2E${generateUUID()}`;
  const creationDateTime = new Date().toISOString();
  const settlementDate = normalizeDate(mt103.valueDate);

  const mappingRows: MappingRow[] = [
    {
      source: ':20: (Transaction Reference)',
      value: mt103.trnRef,
      targetXPath: 'GrpHdr/MsgId',
      note: 'Used as message identifier',
    },
    {
      source: ':20: (Transaction Reference)',
      value: mt103.trnRef,
      targetXPath: 'CdtTrfTxInf/PmtId/EndToEndId',
      note: 'End-to-end reference',
    },
    {
      source: ':32A: (Value Date)',
      value: mt103.valueDate,
      targetXPath: 'CdtTrfTxInf/IntrBkSttlmDt',
      note: `Normalized to ${settlementDate}`,
    },
    {
      source: ':32A: (Currency)',
      value: mt103.currency,
      targetXPath: 'CdtTrfTxInf/IntrBkSttlmAmt/@Ccy',
      note: 'ISO currency code',
    },
    {
      source: ':32A: (Amount)',
      value: mt103.amount,
      targetXPath: 'CdtTrfTxInf/IntrBkSttlmAmt',
      note: 'Settlement amount',
    },
    {
      source: ':50K: (Debtor Name)',
      value: mt103.debtor.name,
      targetXPath: 'CdtTrfTxInf/Dbtr/Nm',
    },
    {
      source: ':50K: (Debtor Address)',
      value: mt103.debtor.addressLines.join(', '),
      targetXPath: 'CdtTrfTxInf/Dbtr/PstlAdr/AdrLine',
    },
    {
      source: ':59: (Creditor Name)',
      value: mt103.creditor.name,
      targetXPath: 'CdtTrfTxInf/Cdtr/Nm',
    },
    {
      source: ':59: (Creditor Address)',
      value: mt103.creditor.addressLines.join(', '),
      targetXPath: 'CdtTrfTxInf/Cdtr/PstlAdr/AdrLine',
    },
    {
      source: ':70: (Remittance Info)',
      value: mt103.remittance || '(none)',
      targetXPath: 'CdtTrfTxInf/RmtInf/Ustrd',
      note: mt103.remittance ? undefined : 'No remittance provided',
    },
  ];

  if (mt103.debtor.account) {
    mappingRows.push({
      source: ':50K: (Debtor Account)',
      value: mt103.debtor.account,
      targetXPath: 'CdtTrfTxInf/DbtrAcct/Id/Othr/Id',
    });
  }

  if (mt103.creditor.account) {
    mappingRows.push({
      source: ':59: (Creditor Account)',
      value: mt103.creditor.account,
      targetXPath: 'CdtTrfTxInf/CdtrAcct/Id/Othr/Id',
    });
  }

  if (mt103.charges) {
    const chargeBearer = mt103.charges === 'OUR' ? 'DEBT' : mt103.charges;
    mappingRows.push({
      source: ':71A: (Charge Bearer)',
      value: mt103.charges,
      targetXPath: 'CdtTrfTxInf/ChrgBr',
      note: mt103.charges === 'OUR' ? 'Mapped OUR → DEBT' : undefined,
    });
  }

  const assumptions: string[] = [];
  if (!mt103.debtor.account) {
    assumptions.push('Debtor account not provided; generic account used');
  }
  if (!mt103.creditor.account) {
    assumptions.push('Creditor account not provided; generic account used');
  }
  if (!mt103.remittance) {
    assumptions.push('No remittance information provided');
  }

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Document', {
      xmlns: 'urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    })
    .ele('FIToFICstmrCdtTrf')
    .ele('GrpHdr')
    .ele('MsgId')
    .txt(messageId)
    .up()
    .ele('CreDtTm')
    .txt(creationDateTime)
    .up()
    .ele('NbOfTxs')
    .txt('1')
    .up()
    .ele('SttlmInf')
    .ele('SttlmMtd')
    .txt('CLRG')
    .up()
    .up()
    .up()
    .ele('CdtTrfTxInf')
    .ele('PmtId')
    .ele('InstrId')
    .txt(messageId)
    .up()
    .ele('EndToEndId')
    .txt(endToEndId)
    .up()
    .up()
    .ele('IntrBkSttlmAmt', { Ccy: mt103.currency })
    .txt(mt103.amount)
    .up()
    .ele('IntrBkSttlmDt')
    .txt(settlementDate)
    .up();

  if (mt103.charges) {
    const chargeBearer = mt103.charges === 'OUR' ? 'DEBT' : mt103.charges;
    doc.ele('ChrgBr').txt(chargeBearer).up();
  }

  doc.ele('Dbtr').ele('Nm').txt(mt103.debtor.name).up();

  if (mt103.debtor.addressLines.length > 0) {
    const dbtrAddr = doc.ele('PstlAdr');
    mt103.debtor.addressLines.forEach((line) => {
      dbtrAddr.ele('AdrLine').txt(line).up();
    });
    dbtrAddr.up();
  }
  doc.up();

  if (mt103.debtor.account) {
    doc
      .ele('DbtrAcct')
      .ele('Id')
      .ele('Othr')
      .ele('Id')
      .txt(mt103.debtor.account)
      .up()
      .up()
      .up()
      .up();
  }

  doc.ele('Cdtr').ele('Nm').txt(mt103.creditor.name).up();

  if (mt103.creditor.addressLines.length > 0) {
    const cdtrAddr = doc.ele('PstlAdr');
    mt103.creditor.addressLines.forEach((line) => {
      cdtrAddr.ele('AdrLine').txt(line).up();
    });
    cdtrAddr.up();
  }
  doc.up();

  if (mt103.creditor.account) {
    doc
      .ele('CdtrAcct')
      .ele('Id')
      .ele('Othr')
      .ele('Id')
      .txt(mt103.creditor.account)
      .up()
      .up()
      .up()
      .up();
  }

  if (mt103.remittance) {
    doc.ele('RmtInf').ele('Ustrd').txt(mt103.remittance).up().up();
  }

  const xml = doc.end({ prettyPrint: true });

  return {
    xml,
    mappingReport: {
      messageId,
      rows: mappingRows,
      assumptions,
      risks: [],
    },
  };
}
