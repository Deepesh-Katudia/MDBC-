import { parseNACHA } from '../core/parse-nacha';

describe('parseNACHA', () => {
  const validNACHA = `101 123456789 9876543212509300000000A094101MDCB BANK           STUDENT FILE
5225STUDENT CLUB       123456789PPDREIMBURSE       250930   1123456780000001
6229876543211234567890        0000012345JANE STUDENT       RENT SHARE     0
82200000010000012345                                        123456780000001
9000001000001000000010000012345`;

  it('should parse a valid NACHA file', () => {
    const result = parseNACHA(validNACHA);

    expect(result.fileHeader.recordType).toBe('1');
    expect(result.fileHeader.immediateDestination).toBe('123456789');
    expect(result.batchHeader.recordType).toBe('5');
    expect(result.batchHeader.companyName).toBe('STUDENT CLUB');
    expect(result.entries).toHaveLength(1);
    expect(result.controls.recordType).toBe('8');
  });

  it('should parse entry details correctly', () => {
    const result = parseNACHA(validNACHA);
    const entry = result.entries[0];

    expect(entry.name).toBe('JANE STUDENT');
    expect(entry.routing).toBe('987654321');
    expect(entry.account).toBe('1234567890');
    expect(entry.amountCents).toBe(12345);
  });

  it('should handle multiple entry details', () => {
    const multipleEntries = `101 123456789 9876543212509300000000A094101BANK              FILE
5225COMPANY            123456789PPDPAYROLL         250930   1123456780000001
6229876543211111111111        0000010000PERSON ONE          SALARY         0
6229876543212222222222        0000020000PERSON TWO          SALARY         0
6229876543213333333333        0000030000PERSON THREE        SALARY         0
82200000030000060000                                        123456780000001
9000001000003000000030000060000`;

    const result = parseNACHA(multipleEntries);
    expect(result.entries).toHaveLength(3);
    expect(result.entries[0].amountCents).toBe(10000);
    expect(result.entries[1].amountCents).toBe(20000);
    expect(result.entries[2].amountCents).toBe(30000);
  });

  it('should throw error for missing file header', () => {
    const noHeader = `5225COMPANY            123456789PPDPAYROLL         250930   1123456780000001
6229876543211111111111        0000010000PERSON ONE          SALARY         0`;

    expect(() => parseNACHA(noHeader)).toThrow('Missing File Header');
  });

  it('should throw error for missing batch header', () => {
    const noBatch = `101 123456789 9876543212509300000000A094101BANK              FILE
6229876543211111111111        0000010000PERSON ONE          SALARY         0`;

    expect(() => parseNACHA(noBatch)).toThrow('Missing Batch Header');
  });

  it('should throw error for no entry details', () => {
    const noEntries = `101 123456789 9876543212509300000000A094101BANK              FILE
5225COMPANY            123456789PPDPAYROLL         250930   1123456780000001
82200000000000000000                                        123456780000001`;

    expect(() => parseNACHA(noEntries)).toThrow('No entry details found');
  });

  it('should parse file header fields correctly', () => {
    const result = parseNACHA(validNACHA);

    expect(result.fileHeader.immediateOriginName).toBe('STUDENT FILE');
    expect(result.fileHeader.immediateDestinationName).toBe('MDCB BANK');
    expect(result.fileHeader.fileCreationDate).toBe('250930');
  });

  it('should parse batch header fields correctly', () => {
    const result = parseNACHA(validNACHA);

    expect(result.batchHeader.standardEntryClass).toBe('PPD');
    expect(result.batchHeader.companyEntryDescription).toBe('REIMBURSE');
    expect(result.batchHeader.effectiveEntryDate).toBe('250930');
  });
});
