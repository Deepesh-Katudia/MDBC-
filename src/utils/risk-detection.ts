import { MT103, NachaEntry, Risk } from '../../core/types';

export function detectMT103Risks(mt103: MT103): Risk[] {
  const risks: Risk[] = [];

  if (!mt103.debtor.account) {
    risks.push({
      id: 'mt103-missing-debtor-account',
      title: 'Missing Debtor Account',
      level: 'Warning',
      description:
        'The debtor account number was not provided in the MT103 message.',
      mitigation:
        'Verify account details manually before processing. Contact sender for complete information.',
    });
  }

  if (!mt103.creditor.account) {
    risks.push({
      id: 'mt103-missing-creditor-account',
      title: 'Missing Creditor Account',
      level: 'Warning',
      description:
        'The creditor account number was not provided in the MT103 message.',
      mitigation:
        'Confirm beneficiary account through alternative channels before settlement.',
    });
  }

  const amount = parseFloat(mt103.amount);
  if (isNaN(amount) || amount <= 0) {
    risks.push({
      id: 'mt103-invalid-amount',
      title: 'Invalid Payment Amount',
      level: 'Critical',
      description: `The payment amount "${mt103.amount}" is invalid or zero.`,
      mitigation:
        'Reject transaction and request corrected MT103 with valid amount.',
    });
  }

  if (!mt103.remittance || mt103.remittance.trim().length === 0) {
    risks.push({
      id: 'mt103-no-remittance',
      title: 'No Remittance Information',
      level: 'Info',
      description:
        'Payment lacks remittance details, making reconciliation difficult.',
      mitigation:
        'Contact sender for payment purpose. Consider adding internal reference notes.',
    });
  } else if (mt103.remittance.length > 140) {
    risks.push({
      id: 'mt103-long-remittance',
      title: 'Unstructured Remittance Info',
      level: 'Info',
      description:
        'Remittance information is lengthy and unstructured, which may cause truncation.',
      mitigation:
        'Consider structured remittance format for better interoperability.',
    });
  }

  const knownCurrencies = [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CHF',
    'CAD',
    'AUD',
    'CNY',
  ];
  if (!knownCurrencies.includes(mt103.currency)) {
    risks.push({
      id: 'mt103-uncommon-currency',
      title: 'Uncommon Currency',
      level: 'Warning',
      description: `Currency "${mt103.currency}" is not commonly used or may require special handling.`,
      mitigation:
        'Verify currency code is correct and check exchange rate availability.',
    });
  }

  if (
    mt103.debtor.addressLines.length === 0 ||
    mt103.creditor.addressLines.length === 0
  ) {
    risks.push({
      id: 'mt103-incomplete-address',
      title: 'Incomplete Address Information',
      level: 'Warning',
      description:
        'One or more parties have incomplete address details, which may impact compliance checks.',
      mitigation:
        'Obtain full address for KYC/AML screening and regulatory compliance.',
    });
  }

  if (!mt103.charges) {
    risks.push({
      id: 'mt103-no-charge-code',
      title: 'Missing Charge Bearer Code',
      level: 'Info',
      description: 'Charge allocation (SHA/OUR/BEN) not specified.',
      mitigation:
        'Default charge allocation may apply. Confirm with sender if needed.',
    });
  }

  return risks;
}

export function detectNACHARisks(nacha: NachaEntry): Risk[] {
  const risks: Risk[] = [];

  if (nacha.entries.length === 0) {
    risks.push({
      id: 'nacha-no-entries',
      title: 'No Payment Entries',
      level: 'Critical',
      description: 'NACHA file contains no payment entry records.',
      mitigation: 'File is invalid and cannot be processed. Request valid file.',
    });
  }

  nacha.entries.forEach((entry, idx) => {
    if (entry.amountCents <= 0) {
      risks.push({
        id: `nacha-invalid-amount-${idx}`,
        title: `Entry ${idx + 1}: Invalid Amount`,
        level: 'Critical',
        description: `Payment entry has zero or negative amount (${entry.amountCents} cents).`,
        mitigation: 'Reject entry and request correction from originator.',
      });
    }

    if (entry.amountCents > 1000000000) {
      risks.push({
        id: `nacha-large-amount-${idx}`,
        title: `Entry ${idx + 1}: Unusually Large Amount`,
        level: 'Warning',
        description: `Payment amount exceeds $10 million (${entry.amountCents / 100} USD).`,
        mitigation:
          'Verify transaction authenticity and conduct enhanced due diligence.',
      });
    }

    if (!entry.routing || entry.routing.length !== 9) {
      risks.push({
        id: `nacha-invalid-routing-${idx}`,
        title: `Entry ${idx + 1}: Invalid Routing Number`,
        level: 'Critical',
        description: `Routing number "${entry.routing}" is not 9 digits.`,
        mitigation:
          'Correct routing number required for successful ACH processing.',
      });
    }

    if (!entry.account || entry.account.trim().length === 0) {
      risks.push({
        id: `nacha-missing-account-${idx}`,
        title: `Entry ${idx + 1}: Missing Account Number`,
        level: 'Critical',
        description: 'Account number is missing or empty.',
        mitigation: 'Account number is mandatory. Request complete entry data.',
      });
    }

    if (!entry.name || entry.name.trim().length === 0) {
      risks.push({
        id: `nacha-missing-name-${idx}`,
        title: `Entry ${idx + 1}: Missing Recipient Name`,
        level: 'Warning',
        description: 'Recipient name is missing.',
        mitigation:
          'Name helps with reconciliation and fraud prevention. Obtain if possible.',
      });
    }
  });

  const totalAmount = nacha.entries.reduce(
    (sum, e) => sum + e.amountCents,
    0
  );
  const controlTotal = parseInt(nacha.controls.totalCredit || '0', 10);

  if (controlTotal > 0 && totalAmount !== controlTotal) {
    risks.push({
      id: 'nacha-control-mismatch',
      title: 'Control Total Mismatch',
      level: 'Critical',
      description: `Calculated total (${totalAmount}) does not match file control total (${controlTotal}).`,
      mitigation:
        'File integrity compromised. Reject and request corrected file from originator.',
    });
  }

  if (!nacha.batchHeader.effectiveEntryDate) {
    risks.push({
      id: 'nacha-no-effective-date',
      title: 'Missing Effective Entry Date',
      level: 'Warning',
      description: 'Batch header lacks effective entry date.',
      mitigation:
        'Settlement timing unclear. Confirm intended processing date.',
    });
  }

  return risks;
}
