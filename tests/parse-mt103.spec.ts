import { parseMT103 } from '../core/parse-mt103';

describe('parseMT103', () => {
  it('should parse a valid MT103 message', () => {
    const input = `:20:TRNREF123456
:32A:250930USD1234.56
:50K:/123456789
JOHN DOE
123 CAMPUS RD
:59:/987654321
JANE STUDENT
45 DORM WAY
:70:Payment for services
:71A:SHA`;

    const result = parseMT103(input);

    expect(result.trnRef).toBe('TRNREF123456');
    expect(result.valueDate).toBe('250930');
    expect(result.currency).toBe('USD');
    expect(result.amount).toBe('1234.56');
    expect(result.debtor.name).toBe('JOHN DOE');
    expect(result.debtor.account).toBe('123456789');
    expect(result.debtor.addressLines).toEqual(['123 CAMPUS RD']);
    expect(result.creditor.name).toBe('JANE STUDENT');
    expect(result.creditor.account).toBe('987654321');
    expect(result.creditor.addressLines).toEqual(['45 DORM WAY']);
    expect(result.remittance).toBe('Payment for services');
    expect(result.charges).toBe('SHA');
  });

  it('should handle comma as decimal separator', () => {
    const input = `:20:REF
:32A:250930EUR1000,50
:50K:Name
:59:Creditor`;

    const result = parseMT103(input);
    expect(result.amount).toBe('1000.50');
  });

  it('should handle multi-line addresses', () => {
    const input = `:20:REF
:32A:250930USD100.00
:50K:/ACC123
NAME LINE
ADDRESS LINE 1
ADDRESS LINE 2
CITY STATE
:59:CREDITOR NAME`;

    const result = parseMT103(input);
    expect(result.debtor.addressLines).toEqual([
      'ADDRESS LINE 1',
      'ADDRESS LINE 2',
      'CITY STATE',
    ]);
  });

  it('should throw error for missing transaction reference', () => {
    const input = `:32A:250930USD100.00
:50K:Debtor
:59:Creditor`;

    expect(() => parseMT103(input)).toThrow(
      'Missing required field :20: (Transaction Reference)'
    );
  });

  it('should throw error for missing value date field', () => {
    const input = `:20:REF
:50K:Debtor
:59:Creditor`;

    expect(() => parseMT103(input)).toThrow(
      'Missing required field :32A: (Value Date/Currency/Amount)'
    );
  });

  it('should handle different charge codes', () => {
    const inputOUR = `:20:REF
:32A:250930USD100.00
:50K:Debtor
:59:Creditor
:71A:OUR`;

    const inputBEN = `:20:REF
:32A:250930USD100.00
:50K:Debtor
:59:Creditor
:71A:BEN`;

    expect(parseMT103(inputOUR).charges).toBe('OUR');
    expect(parseMT103(inputBEN).charges).toBe('BEN');
  });

  it('should handle optional remittance information', () => {
    const withRemittance = `:20:REF
:32A:250930USD100.00
:50K:Debtor
:59:Creditor
:70:Test payment`;

    const withoutRemittance = `:20:REF
:32A:250930USD100.00
:50K:Debtor
:59:Creditor`;

    expect(parseMT103(withRemittance).remittance).toBe('Test payment');
    expect(parseMT103(withoutRemittance).remittance).toBeUndefined();
  });
});
