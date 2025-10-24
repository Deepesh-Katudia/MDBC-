import { MT103 } from './types';

export function parseMT103(input: string): MT103 {
  const lines = input.split('\n').map((l) => l.trim());
  const tags: Record<string, string[]> = {};

  let currentTag = '';
  for (const line of lines) {
    if (line.startsWith(':') && line.includes(':')) {
      const match = line.match(/^:(\w+):(.*)/);
      if (match) {
        currentTag = match[1];
        tags[currentTag] = [match[2]];
      }
    } else if (currentTag && line) {
      tags[currentTag].push(line);
    }
  }

  const trnRef = tags['20']?.[0] || '';
  if (!trnRef) {
    throw new Error('Missing required field :20: (Transaction Reference)');
  }

  const field32A = tags['32A']?.[0] || '';
  if (!field32A) {
    throw new Error('Missing required field :32A: (Value Date/Currency/Amount)');
  }

  const valueDateMatch = field32A.match(/^(\d{6})/);
  const currencyMatch = field32A.match(/^\d{6}([A-Z]{3})/);
  const amountMatch = field32A.match(/^\d{6}[A-Z]{3}([\d,\.]+)/);

  if (!valueDateMatch || !currencyMatch || !amountMatch) {
    throw new Error(
      'Invalid :32A: format. Expected YYMMDDCCCAMOUNT (e.g., 250930USD1234.56)'
    );
  }

  const valueDate = valueDateMatch[1];
  const currency = currencyMatch[1];
  const amount = amountMatch[1].replace(',', '.');

  const debtor = parseParty(tags['50K'] || [], true);
  const creditor = parseParty(tags['59'] || [], true);

  const remittance = tags['70']?.join(' ').trim() || undefined;
  const charges = (tags['71A']?.[0] as 'SHA' | 'BEN' | 'OUR') || undefined;

  const extras: Record<string, string> = {};
  Object.keys(tags).forEach((tag) => {
    if (!['20', '32A', '50K', '59', '70', '71A'].includes(tag)) {
      extras[tag] = tags[tag].join(' ');
    }
  });

  return {
    trnRef,
    valueDate,
    currency,
    amount,
    debtor,
    creditor,
    remittance,
    charges,
    extras: Object.keys(extras).length > 0 ? extras : undefined,
  };
}

function parseParty(
  lines: string[],
  includeAccount: boolean
): { name: string; addressLines: string[]; account?: string } {
  if (!lines || lines.length === 0) {
    throw new Error('Missing party information');
  }

  let account: string | undefined;
  let nameAndAddress = [...lines];

  if (includeAccount && lines[0].startsWith('/')) {
    account = lines[0].substring(1);
    nameAndAddress = lines.slice(1);
  }

  const name = nameAndAddress[0] || '';
  const addressLines = nameAndAddress.slice(1);

  return { name, addressLines, account };
}
