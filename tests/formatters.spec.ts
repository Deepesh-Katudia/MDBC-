import { normalizeDate, formatCurrency, generateUUID } from '../src/utils/formatters';

describe('formatters', () => {
  describe('normalizeDate', () => {
    it('should convert YYMMDD to YYYY-MM-DD for 21st century', () => {
      expect(normalizeDate('250930')).toBe('2025-09-30');
      expect(normalizeDate('200101')).toBe('2020-01-01');
      expect(normalizeDate('491231')).toBe('2049-12-31');
    });

    it('should convert YYMMDD to YYYY-MM-DD for 20th century', () => {
      expect(normalizeDate('990530')).toBe('1999-05-30');
      expect(normalizeDate('501231')).toBe('1950-12-31');
    });

    it('should handle invalid input gracefully', () => {
      const result = normalizeDate('');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency('1234.56', 'USD')).toBe('$1,234.56');
    });

    it('should format EUR correctly', () => {
      expect(formatCurrency('1000.00', 'EUR')).toContain('1,000.00');
    });

    it('should handle invalid amounts', () => {
      expect(formatCurrency('invalid', 'USD')).toBe('invalid');
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID format', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });
});
