import { create } from 'zustand';
import {
  MT103,
  NachaEntry,
  MappingReport,
  XmlValidationResult,
  Risk,
  ConversionHistory,
} from '../../core/types';

interface AppState {
  currentType: 'MT103' | 'NACHA' | null;
  rawInput: string;
  parsedData: MT103 | NachaEntry | null;
  generatedXml: string;
  mappingReport: MappingReport | null;
  validationResult: XmlValidationResult | null;
  risks: Risk[];
  history: ConversionHistory[];

  setCurrentType: (type: 'MT103' | 'NACHA') => void;
  setRawInput: (input: string) => void;
  setParsedData: (data: MT103 | NachaEntry | null) => void;
  setGeneratedXml: (xml: string) => void;
  setMappingReport: (report: MappingReport | null) => void;
  setValidationResult: (result: XmlValidationResult | null) => void;
  setRisks: (risks: Risk[]) => void;
  addToHistory: (entry: ConversionHistory) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentType: null,
  rawInput: '',
  parsedData: null,
  generatedXml: '',
  mappingReport: null,
  validationResult: null,
  risks: [],
  history: [],

  setCurrentType: (type) => set({ currentType: type }),
  setRawInput: (input) => set({ rawInput: input }),
  setParsedData: (data) => set({ parsedData: data }),
  setGeneratedXml: (xml) => set({ generatedXml: xml }),
  setMappingReport: (report) => set({ mappingReport: report }),
  setValidationResult: (result) => set({ validationResult: result }),
  setRisks: (risks) => set({ risks }),
  addToHistory: (entry) =>
    set((state) => ({ history: [entry, ...state.history] })),
  reset: () =>
    set({
      currentType: null,
      rawInput: '',
      parsedData: null,
      generatedXml: '',
      mappingReport: null,
      validationResult: null,
      risks: [],
    }),
}));
