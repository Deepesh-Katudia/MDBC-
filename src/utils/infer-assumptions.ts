// src/utils/infer-assumptions.ts
import { MappingReport } from '../../core/types';

type Maybe = string | undefined | null;

const has = (xml: string, re: RegExp) => re.test(xml);
const pick = (xml: string, re: RegExp) => (xml.match(re)?.[1] ?? '');

export function inferAssumptions(opts: {
  xml: string;
  currentType: 'MT103' | 'NACHA';
  mappingReport?: MappingReport;
}) {
  const { xml, currentType, mappingReport } = opts;
  const assumptions: string[] = [];

  // --- Agents / BICs ---
  const hasDebtorBIC = has(xml, /<DbtrAgt>[\s\S]*?<BICFI>.*?<\/BICFI>[\s\S]*?<\/DbtrAgt>/i);
  const hasCreditorBIC = has(xml, /<CdtrAgt>[\s\S]*?<BICFI>.*?<\/BICFI>[\s\S]*?<\/CdtrAgt>/i);
  const hasAnyClrSysId = has(xml, /<ClrSysId>|<ClrSysMmbId>/i);

  if (!hasDebtorBIC) {
    assumptions.push('Debtor Agent BIC missing – routed using clearing/member ID or account data.');
  }
  if (!hasCreditorBIC) {
    assumptions.push('Creditor Agent BIC missing – routed using clearing/member ID or account data.');
  }
  if (!hasDebtorBIC && !hasCreditorBIC && !hasAnyClrSysId) {
    assumptions.push('No BIC or clearing ID for agents – downstream routing may require manual enrichment.');
  }

  // --- Accounts (IBAN vs Other) ---
  const hasDbtrIBAN = has(xml, /<DbtrAcct>[\s\S]*?<IBAN>.*?<\/IBAN>/i);
  const hasCdtrIBAN = has(xml, /<CdtrAcct>[\s\S]*?<IBAN>.*?<\/IBAN>/i);
  const hasDbtrOthr = has(xml, /<DbtrAcct>[\s\S]*?<Othr>[\s\S]*?<Id>.*?<\/Id>[\s\S]*?<\/Othr>/i);
  const hasCdtrOthr = has(xml, /<CdtrAcct>[\s\S]*?<Othr>[\s\S]*?<Id>.*?<\/Id>[\s\S]*?<\/Othr>/i);

  if (!hasDbtrIBAN && hasDbtrOthr) {
    assumptions.push('Debtor account not IBAN – used <Othr>/Id.');
  }
  if (!hasCdtrIBAN && hasCdtrOthr) {
    assumptions.push('Creditor account not IBAN – used <Othr>/Id.');
  }

  // --- Addresses (structured vs free-form) ---
  const hasStructuredDbtrAddr =
    has(xml, /<Dbtr>[\s\S]*?<PstlAdr>[\s\S]*?(<Ctry>|<TwnNm>|<PstCd>|<StrtNm>)[\s\S]*?<\/PstlAdr>/i);
  const hasAdrLineDbtr = has(xml, /<Dbtr>[\s\S]*?<PstlAdr>[\s\S]*?<AdrLine>[\s\S]*?<\/PstlAdr>/i);
  const hasStructuredCdtrAddr =
    has(xml, /<Cdtr>[\s\S]*?<PstlAdr>[\s\S]*?(<Ctry>|<TwnNm>|<PstCd>|<StrtNm>)[\s\S]*?<\/PstlAdr>/i);
  const hasAdrLineCdtr = has(xml, /<Cdtr>[\s\S]*?<PstlAdr>[\s\S]*?<AdrLine>[\s\S]*?<\/PstlAdr>/i);

  if (!hasStructuredDbtrAddr && hasAdrLineDbtr) {
    assumptions.push('Debtor address provided as free-form <AdrLine> – country/postcode may be missing.');
  }
  if (!hasStructuredCdtrAddr && hasAdrLineCdtr) {
    assumptions.push('Creditor address provided as free-form <AdrLine> – country/postcode may be missing.');
  }

  // --- Amount / Currency ---
  const ccy = pick(xml, /<InstdAmt[^>]*?Ccy="([A-Z]{3})"/i) || pick(xml, /<Amt[^>]*?Ccy="([A-Z]{3})"/i);
  if (!ccy) assumptions.push('Currency code missing on amount – downstream validation may fail.');

  // --- Dates ---
  if (!has(xml, /<IntrBkSttlmDt>\d{4}-\d{2}-\d{2}<\/IntrBkSttlmDt>/i)) {
    assumptions.push('Interbank settlement date missing – normalized/derived date may have been used.');
  }

  // --- Identifiers reused / normalized ---
  const msgId = pick(xml, /<MsgId>(.*?)<\/MsgId>/i);
  const e2e = pick(xml, /<EndToEndId>(.*?)<\/EndToEndId>/i);
  if (msgId && e2e && msgId === e2e) {
    assumptions.push('MsgId equals EndToEndId – assumed reuse of transaction reference for both.');
  }

  // --- Charges / Purpose code ---
  if (!has(xml, /<ChrgBr>(SHAR|SLEV|CRED|DEBT)<\/ChrgBr>/i)) {
    assumptions.push('Charge bearer not provided – defaulted to scheme/clearing default (commonly SLEV).');
  }
  if (!has(xml, /<Purp>\s*<Cd>.*?<\/Cd>\s*<\/Purp>/i)) {
    assumptions.push('Purpose code not provided.');
  }

  // --- Remittance info ---
  if (!has(xml, /<RmtInf>[\s\S]*?<Ustrd>.*?<\/Ustrd>[\s\S]*?<\/RmtInf>/i)) {
    assumptions.push('Unstructured remittance info missing.');
  }

  // --- Hints from mapping report (any rows marked with notes) ---
  if (mappingReport?.rows?.length) {
    mappingReport.rows.forEach(r => {
      if (r.note?.toLowerCase().includes('assume') || r.note?.toLowerCase().includes('default')) {
        assumptions.push(`Mapping note: ${r.note}`);
      }
    });
  }

  // De-dupe & tidy
  return Array.from(new Set(assumptions));
}
