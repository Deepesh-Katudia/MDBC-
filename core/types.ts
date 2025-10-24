export type MT103 = {
  trnRef: string;
  valueDate: string;
  currency: string;
  amount: string;
  debtor: { name: string; addressLines: string[]; account?: string };
  creditor: { name: string; addressLines: string[]; account?: string };
  remittance?: string;
  charges?: 'SHA' | 'BEN' | 'OUR';
  extras?: Record<string, string>;
};

export type NachaEntry = {
  fileHeader: Record<string, string>;
  batchHeader: Record<string, string>;
  entries: Array<{
    name: string;
    routing: string;
    account: string;
    amountCents: number;
    memo?: string;
  }>;
  controls: Record<string, string>;
};

export type MappingRow = {
  source: string;
  value: string;
  targetXPath: string;
  note?: string;
};

export type MappingReport = {
  messageId: string;
  rows: MappingRow[];
  assumptions: string[];
  risks: string[];
};

export type XmlValidationResult =
  | { valid: true; validationTimeMs?: number }
  | { valid: false; errors: string[] };

export type RiskLevel = 'Info' | 'Warning' | 'Critical';

export type Risk = {
  id: string;
  title: string;
  level: RiskLevel;
  description: string;
  mitigation: string;
};

export type ConversionHistory = {
  id: string;
  timestamp: string;
  type: 'MT103' | 'NACHA';
  status: 'Valid' | 'Errors';
  errorCount?: number;
  xml: string;
  mappingReport: MappingReport;
  risks: Risk[];
};
