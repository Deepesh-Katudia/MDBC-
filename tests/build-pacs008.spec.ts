import { buildPacs008 } from '../core/build-pacs008';
import { MT103 } from '../core/types';

describe('buildPacs008', () => {
  const sampleMT103: MT103 = {
    trnRef: 'TRNREF123456',
    valueDate: '250930',
    currency: 'USD',
    amount: '1234.56',
    debtor: {
      name: 'JOHN DOE',
      addressLines: ['123 CAMPUS RD', 'CITY ST'],
      account: '123456789',
    },
    creditor: {
      name: 'JANE STUDENT',
      addressLines: ['45 DORM WAY', 'CITY ST'],
      account: '987654321',
    },
    remittance: 'Payment for services',
    charges: 'SHA',
  };

  it('should generate valid XML structure', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<Document');
    expect(xml).toContain('xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08"');
    expect(xml).toContain('</Document>');
  });

  it('should include FIToFICstmrCdtTrf element', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('<FIToFICstmrCdtTrf>');
    expect(xml).toContain('</FIToFICstmrCdtTrf>');
  });

  it('should include group header with required fields', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('<GrpHdr>');
    expect(xml).toContain('<MsgId>');
    expect(xml).toContain('<CreDtTm>');
    expect(xml).toContain('<NbOfTxs>1</NbOfTxs>');
  });

  it('should map currency and amount correctly', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('Ccy="USD"');
    expect(xml).toContain('1234.56');
  });

  it('should map debtor information', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('<Dbtr>');
    expect(xml).toContain('<Nm>JOHN DOE</Nm>');
    expect(xml).toContain('123 CAMPUS RD');
  });

  it('should map creditor information', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('<Cdtr>');
    expect(xml).toContain('<Nm>JANE STUDENT</Nm>');
    expect(xml).toContain('45 DORM WAY');
  });

  it('should include remittance information when present', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('<RmtInf>');
    expect(xml).toContain('<Ustrd>Payment for services</Ustrd>');
  });

  it('should map OUR charge to DEBT', () => {
    const mt103WithOUR = { ...sampleMT103, charges: 'OUR' as const };
    const { xml } = buildPacs008(mt103WithOUR);

    expect(xml).toContain('<ChrgBr>DEBT</ChrgBr>');
  });

  it('should generate mapping report with correct rows', () => {
    const { mappingReport } = buildPacs008(sampleMT103);

    expect(mappingReport.rows.length).toBeGreaterThanOrEqual(10);
    expect(mappingReport.rows.some((r) => r.targetXPath.includes('GrpHdr/MsgId'))).toBe(true);
    expect(mappingReport.rows.some((r) => r.targetXPath.includes('IntrBkSttlmAmt'))).toBe(true);
  });

  it('should include assumptions for missing data', () => {
    const mt103NoAccount = {
      ...sampleMT103,
      debtor: { ...sampleMT103.debtor, account: undefined },
      creditor: { ...sampleMT103.creditor, account: undefined },
    };

    const { mappingReport } = buildPacs008(mt103NoAccount);

    expect(mappingReport.assumptions.length).toBeGreaterThan(0);
    expect(mappingReport.assumptions.some((a) => a.includes('Debtor account'))).toBe(true);
  });

  it('should normalize date from YYMMDD to YYYY-MM-DD', () => {
    const { xml } = buildPacs008(sampleMT103);

    expect(xml).toContain('2025-09-30');
  });
});
