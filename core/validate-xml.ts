import { XMLParser } from 'fast-xml-parser';
import { XmlValidationResult } from './types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export function validatePacs008(xml: string): XmlValidationResult {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const parsed = parser.parse(xml);

    if (!parsed.Document) {
      errors.push('Missing root element: Document');
      return { valid: false, errors };
    }

    const doc = parsed.Document;

    if (!doc.FIToFICstmrCdtTrf) {
      errors.push('Missing element: FIToFICstmrCdtTrf');
      return { valid: false, errors };
    }

    const fiToFI = doc.FIToFICstmrCdtTrf;

    if (!fiToFI.GrpHdr) {
      errors.push('Missing required element: GrpHdr');
    } else {
      if (!fiToFI.GrpHdr.MsgId) {
        errors.push('Missing required element: GrpHdr/MsgId');
      }
      if (!fiToFI.GrpHdr.CreDtTm) {
        errors.push('Missing required element: GrpHdr/CreDtTm');
      }
      if (!fiToFI.GrpHdr.NbOfTxs) {
        errors.push('Missing required element: GrpHdr/NbOfTxs');
      } else if (isNaN(Number(fiToFI.GrpHdr.NbOfTxs))) {
        errors.push('GrpHdr/NbOfTxs must be a number');
      }
    }

    if (!fiToFI.CdtTrfTxInf) {
      errors.push('Missing required element: CdtTrfTxInf');
    } else {
      const txInfo = fiToFI.CdtTrfTxInf;

      if (!txInfo.PmtId) {
        errors.push('Missing required element: CdtTrfTxInf/PmtId');
      } else {
        if (!txInfo.PmtId.InstrId) {
          errors.push('Missing required element: CdtTrfTxInf/PmtId/InstrId');
        }
        if (!txInfo.PmtId.EndToEndId) {
          errors.push(
            'Missing required element: CdtTrfTxInf/PmtId/EndToEndId'
          );
        }
      }

      if (!txInfo.IntrBkSttlmAmt) {
        errors.push('Missing required element: CdtTrfTxInf/IntrBkSttlmAmt');
      } else {
        if (typeof txInfo.IntrBkSttlmAmt === 'object') {
          const amt = txInfo.IntrBkSttlmAmt;
          if (!amt['@_Ccy']) {
            errors.push(
              'Missing required attribute: CdtTrfTxInf/IntrBkSttlmAmt/@Ccy'
            );
          } else if (!/^[A-Z]{3}$/.test(amt['@_Ccy'])) {
            errors.push(
              'Invalid currency code format (must be 3 uppercase letters)'
            );
          }
          if (!amt['#text'] || isNaN(Number(amt['#text']))) {
            errors.push('CdtTrfTxInf/IntrBkSttlmAmt must contain a valid number');
          } else if (Number(amt['#text']) <= 0) {
            errors.push('CdtTrfTxInf/IntrBkSttlmAmt must be greater than 0');
          }
        }
      }

      if (!txInfo.IntrBkSttlmDt) {
        errors.push('Missing required element: CdtTrfTxInf/IntrBkSttlmDt');
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(txInfo.IntrBkSttlmDt)) {
        errors.push(
          'CdtTrfTxInf/IntrBkSttlmDt must be in format YYYY-MM-DD'
        );
      }

      if (!txInfo.Dbtr) {
        errors.push('Missing required element: CdtTrfTxInf/Dbtr');
      } else if (!txInfo.Dbtr.Nm) {
        errors.push('Missing required element: CdtTrfTxInf/Dbtr/Nm');
      }

      if (!txInfo.Cdtr) {
        errors.push('Missing required element: CdtTrfTxInf/Cdtr');
      } else if (!txInfo.Cdtr.Nm) {
        errors.push('Missing required element: CdtTrfTxInf/Cdtr/Nm');
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const validationTimeMs = Date.now() - startTime;
    return { valid: true, validationTimeMs };
  } catch (error) {
    errors.push(`XML parsing error: ${(error as Error).message}`);
    return { valid: false, errors };
  }
}

export function validatePain001(xml: string): XmlValidationResult {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const parsed = parser.parse(xml);

    if (!parsed.Document) {
      errors.push('Missing root element: Document');
      return { valid: false, errors };
    }

    const doc = parsed.Document;

    if (!doc.CstmrCdtTrfInitn) {
      errors.push('Missing element: CstmrCdtTrfInitn');
      return { valid: false, errors };
    }

    const cdtTrf = doc.CstmrCdtTrfInitn;

    if (!cdtTrf.GrpHdr) {
      errors.push('Missing required element: GrpHdr');
    } else {
      if (!cdtTrf.GrpHdr.MsgId) {
        errors.push('Missing required element: GrpHdr/MsgId');
      }
      if (!cdtTrf.GrpHdr.CreDtTm) {
        errors.push('Missing required element: GrpHdr/CreDtTm');
      }
      if (!cdtTrf.GrpHdr.NbOfTxs) {
        errors.push('Missing required element: GrpHdr/NbOfTxs');
      } else if (isNaN(Number(cdtTrf.GrpHdr.NbOfTxs))) {
        errors.push('GrpHdr/NbOfTxs must be a number');
      }
      if (!cdtTrf.GrpHdr.InitgPty) {
        errors.push('Missing required element: GrpHdr/InitgPty');
      }
    }

    if (!cdtTrf.PmtInf) {
      errors.push('Missing required element: PmtInf');
    } else {
      const pmtInf = cdtTrf.PmtInf;

      if (!pmtInf.PmtInfId) {
        errors.push('Missing required element: PmtInf/PmtInfId');
      }
      if (!pmtInf.PmtMtd) {
        errors.push('Missing required element: PmtInf/PmtMtd');
      }
      if (!pmtInf.ReqdExctnDt) {
        errors.push('Missing required element: PmtInf/ReqdExctnDt');
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(pmtInf.ReqdExctnDt)) {
        errors.push('PmtInf/ReqdExctnDt must be in format YYYY-MM-DD');
      }
      if (!pmtInf.Dbtr) {
        errors.push('Missing required element: PmtInf/Dbtr');
      } else if (!pmtInf.Dbtr.Nm) {
        errors.push('Missing required element: PmtInf/Dbtr/Nm');
      }

      if (!pmtInf.CdtTrfTxInf) {
        errors.push('Missing required element: PmtInf/CdtTrfTxInf');
      } else {
        const txInfos = Array.isArray(pmtInf.CdtTrfTxInf)
          ? pmtInf.CdtTrfTxInf
          : [pmtInf.CdtTrfTxInf];

        txInfos.forEach((txInfo: any, idx: number) => {
          const prefix = `CdtTrfTxInf[${idx}]`;

          if (!txInfo.PmtId?.EndToEndId) {
            errors.push(`Missing required element: ${prefix}/PmtId/EndToEndId`);
          }

          if (!txInfo.Amt?.InstdAmt) {
            errors.push(`Missing required element: ${prefix}/Amt/InstdAmt`);
          } else {
            const amt = txInfo.Amt.InstdAmt;
            if (typeof amt === 'object') {
              if (!amt['@_Ccy']) {
                errors.push(
                  `Missing required attribute: ${prefix}/Amt/InstdAmt/@Ccy`
                );
              }
              if (!amt['#text'] || isNaN(Number(amt['#text']))) {
                errors.push(`${prefix}/Amt/InstdAmt must contain a valid number`);
              }
            }
          }

          if (!txInfo.Cdtr?.Nm) {
            errors.push(`Missing required element: ${prefix}/Cdtr/Nm`);
          }

          if (!txInfo.CdtrAcct) {
            errors.push(`Missing required element: ${prefix}/CdtrAcct`);
          }
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const validationTimeMs = Date.now() - startTime;
    return { valid: true, validationTimeMs };
  } catch (error) {
    errors.push(`XML parsing error: ${(error as Error).message}`);
    return { valid: false, errors };
  }
}
