import { create } from 'xmlbuilder2';
import { NachaEntry, MappingReport, MappingRow } from './types';
import { normalizeDate, generateUUID } from '../src/utils/formatters';

export function buildPain001(
  nacha: NachaEntry
): { xml: string; mappingReport: MappingReport } {
  const messageId = `PAIN${generateUUID()}`;
  const creationDateTime = new Date().toISOString();
  const paymentInfoId = `PMT${generateUUID()}`;

  const effectiveDate = normalizeDate(
    nacha.batchHeader.effectiveEntryDate || '250930'
  );
  const debtorName = nacha.batchHeader.companyName || 'Unknown Debtor';

  const totalAmountCents = nacha.entries.reduce(
    (sum, entry) => sum + entry.amountCents,
    0
  );
  const totalAmount = (totalAmountCents / 100).toFixed(2);

  const mappingRows: MappingRow[] = [
    {
      source: 'File Header (Record Type 1)',
      value: nacha.fileHeader.immediateOriginName || '',
      targetXPath: 'GrpHdr/InitgPty/Nm',
      note: 'Initiating party from file header',
    },
    {
      source: 'Batch Header (Company Name)',
      value: debtorName,
      targetXPath: 'PmtInf/Dbtr/Nm',
      note: 'Debtor is the company',
    },
    {
      source: 'Batch Header (Effective Date)',
      value: nacha.batchHeader.effectiveEntryDate || '',
      targetXPath: 'PmtInf/ReqdExctnDt',
      note: `Normalized to ${effectiveDate}`,
    },
    {
      source: 'Entry Count',
      value: nacha.entries.length.toString(),
      targetXPath: 'PmtInf/NbOfTxs',
    },
    {
      source: 'Total Amount (calculated)',
      value: totalAmount,
      targetXPath: 'PmtInf/CtrlSum',
      note: 'Sum of all entry amounts',
    },
  ];

  nacha.entries.forEach((entry, idx) => {
    const amount = (entry.amountCents / 100).toFixed(2);
    mappingRows.push(
      {
        source: `Entry ${idx + 1} (Name)`,
        value: entry.name,
        targetXPath: `CdtTrfTxInf[${idx + 1}]/Cdtr/Nm`,
      },
      {
        source: `Entry ${idx + 1} (Account)`,
        value: entry.account,
        targetXPath: `CdtTrfTxInf[${idx + 1}]/CdtrAcct/Id/Othr/Id`,
      },
      {
        source: `Entry ${idx + 1} (Routing)`,
        value: entry.routing,
        targetXPath: `CdtTrfTxInf[${idx + 1}]/CdtrAgt/FinInstnId/ClrSysMmbId/MmbId`,
        note: 'ABA routing number',
      },
      {
        source: `Entry ${idx + 1} (Amount)`,
        value: amount,
        targetXPath: `CdtTrfTxInf[${idx + 1}]/Amt/InstdAmt`,
        note: `Converted from ${entry.amountCents} cents`,
      }
    );

    if (entry.memo) {
      mappingRows.push({
        source: `Entry ${idx + 1} (Memo)`,
        value: entry.memo,
        targetXPath: `CdtTrfTxInf[${idx + 1}]/RmtInf/Ustrd`,
      });
    }
  });

  const assumptions: string[] = [
    'All amounts assumed to be in USD',
    `Payment method set to TRF (Transfer)`,
    'Service level code set to SEPA (default)',
  ];

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Document', {
      xmlns: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    })
    .ele('CstmrCdtTrfInitn')
    .ele('GrpHdr')
    .ele('MsgId')
    .txt(messageId)
    .up()
    .ele('CreDtTm')
    .txt(creationDateTime)
    .up()
    .ele('NbOfTxs')
    .txt(nacha.entries.length.toString())
    .up()
    .ele('CtrlSum')
    .txt(totalAmount)
    .up()
    .ele('InitgPty')
    .ele('Nm')
    .txt(nacha.fileHeader.immediateOriginName || 'Initiating Party')
    .up()
    .up()
    .up()
    .ele('PmtInf')
    .ele('PmtInfId')
    .txt(paymentInfoId)
    .up()
    .ele('PmtMtd')
    .txt('TRF')
    .up()
    .ele('NbOfTxs')
    .txt(nacha.entries.length.toString())
    .up()
    .ele('CtrlSum')
    .txt(totalAmount)
    .up()
    .ele('PmtTpInf')
    .ele('SvcLvl')
    .ele('Cd')
    .txt('SEPA')
    .up()
    .up()
    .up()
    .ele('ReqdExctnDt')
    .txt(effectiveDate)
    .up()
    .ele('Dbtr')
    .ele('Nm')
    .txt(debtorName)
    .up()
    .up()
    .ele('DbtrAcct')
    .ele('Id')
    .ele('Othr')
    .ele('Id')
    .txt(nacha.batchHeader.companyId || 'UNKNOWN')
    .up()
    .up()
    .up()
    .up();

  nacha.entries.forEach((entry, idx) => {
    const amount = (entry.amountCents / 100).toFixed(2);
    const cdtTrf = doc
      .ele('CdtTrfTxInf')
      .ele('PmtId')
      .ele('EndToEndId')
      .txt(`E2E-${idx + 1}`)
      .up()
      .up()
      .ele('Amt')
      .ele('InstdAmt', { Ccy: 'USD' })
      .txt(amount)
      .up()
      .up()
      .ele('CdtrAgt')
      .ele('FinInstnId')
      .ele('ClrSysMmbId')
      .ele('MmbId')
      .txt(entry.routing)
      .up()
      .up()
      .up()
      .up()
      .ele('Cdtr')
      .ele('Nm')
      .txt(entry.name)
      .up()
      .up()
      .ele('CdtrAcct')
      .ele('Id')
      .ele('Othr')
      .ele('Id')
      .txt(entry.account)
      .up()
      .up()
      .up()
      .up();

    if (entry.memo) {
      cdtTrf.ele('RmtInf').ele('Ustrd').txt(entry.memo).up().up();
    }

    cdtTrf.up();
  });

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
