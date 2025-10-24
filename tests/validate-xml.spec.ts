import { validatePacs008, validatePain001 } from '../core/validate-xml';

describe('validatePacs008', () => {
  const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>MSG123</MsgId>
      <CreDtTm>2025-09-30T10:00:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR123</InstrId>
        <EndToEndId>E2E123</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">1234.56</IntrBkSttlmAmt>
      <IntrBkSttlmDt>2025-09-30</IntrBkSttlmDt>
      <Dbtr>
        <Nm>John Doe</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>Jane Smith</Nm>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;

  it('should validate correct pacs.008 XML', () => {
    const result = validatePacs008(validXML);

    expect(result.valid).toBe(true);
    expect(result.validationTimeMs).toBeGreaterThan(0);
  });

  it('should detect missing Document root', () => {
    const invalidXML = `<?xml version="1.0"?>
<FIToFICstmrCdtTrf>
  <GrpHdr><MsgId>MSG</MsgId></GrpHdr>
</FIToFICstmrCdtTrf>`;

    const result = validatePacs008(invalidXML);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing root element: Document');
  });

  it('should detect missing GrpHdr/MsgId', () => {
    const xml = validXML.replace('<MsgId>MSG123</MsgId>', '');
    const result = validatePacs008(xml);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('MsgId'))).toBe(true);
  });

  it('should detect invalid currency code', () => {
    const xml = validXML.replace('Ccy="USD"', 'Ccy="US"');
    const result = validatePacs008(xml);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('currency'))).toBe(true);
  });

  it('should detect invalid date format', () => {
    const xml = validXML.replace(
      '<IntrBkSttlmDt>2025-09-30</IntrBkSttlmDt>',
      '<IntrBkSttlmDt>20250930</IntrBkSttlmDt>'
    );
    const result = validatePacs008(xml);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('YYYY-MM-DD'))).toBe(true);
  });

  it('should detect negative amount', () => {
    const xml = validXML.replace('1234.56', '-100');
    const result = validatePacs008(xml);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('greater than 0'))).toBe(true);
  });

  it('should detect missing debtor name', () => {
    const xml = validXML.replace('<Nm>John Doe</Nm>', '');
    const result = validatePacs008(xml);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Dbtr/Nm'))).toBe(true);
  });
});

describe('validatePain001', () => {
  const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG123</MsgId>
      <CreDtTm>2025-09-30T10:00:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <InitgPty>
        <Nm>Company</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT123</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>2025-09-30</ReqdExctnDt>
      <Dbtr>
        <Nm>Debtor Name</Nm>
      </Dbtr>
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>E2E123</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="USD">100.00</InstdAmt>
        </Amt>
        <Cdtr>
          <Nm>Creditor Name</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <Othr>
              <Id>123456</Id>
            </Othr>
          </Id>
        </CdtrAcct>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

  it('should validate correct pain.001 XML', () => {
    const result = validatePain001(validXML);

    expect(result.valid).toBe(true);
    expect(result.validationTimeMs).toBeGreaterThan(0);
  });

  it('should detect missing payment information', () => {
    const xml = validXML.replace(/<PmtInf>[\s\S]*<\/PmtInf>/, '');
    const result = validatePain001(xml);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required element: PmtInf');
  });

  it('should detect invalid execution date format', () => {
    const xml = validXML.replace(
      '<ReqdExctnDt>2025-09-30</ReqdExctnDt>',
      '<ReqdExctnDt>20250930</ReqdExctnDt>'
    );
    const result = validatePain001(xml);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('YYYY-MM-DD'))).toBe(true);
  });

  it('should handle malformed XML', () => {
    const result = validatePain001('<invalid>xml');

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('parsing error'))).toBe(true);
  });
});
