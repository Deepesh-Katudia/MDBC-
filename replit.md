# MDCB Transform App - Replit Documentation

## Project Overview

A complete React Native Expo mobile application for transforming legacy payment formats (MT103 SWIFT and NACHA ACH) to ISO 20022 XML standards. Built for educational purposes with comprehensive features including parsing, mapping visualization, XML generation, validation, risk detection, and export capabilities.

## Architecture

### Core Structure
- **app/**: Six main screens (Home, Import, MappingPreview, ConvertValidate, Risks, History)
- **core/**: Framework-agnostic business logic for parsing and XML generation
- **src/components/**: Reusable UI component library with design system
- **src/theme/**: Design tokens and dark mode support
- **tests/**: Comprehensive Jest test suite with >80% coverage

### Key Technologies
- Expo SDK 51 with React Native
- TypeScript with strict typing
- React Navigation for routing
- Zustand for state management
- xmlbuilder2 for XML generation
- fast-xml-parser for validation
- Moti for animations

## Recent Changes

**2025-10-24**: Initial project creation
- Set up complete Expo project structure
- Implemented MT103 and NACHA parsers
- Built pacs.008 and pain.001 XML generators
- Created soft XML validator
- Developed full UI with 7 reusable components
- Added risk detection system with 5+ categories
- Included comprehensive test suite
- Created sample data files
- Documented with README

## Features Implemented

1. **Parsing**: MT103 SWIFT tag parser and NACHA fixed-width parser
2. **Mapping**: Side-by-side field mapping with 10+ rows
3. **Conversion**: ISO 20022 XML generation (pacs.008.001.08, pain.001.001.09)
4. **Validation**: Soft validator with node/type/constraint checking
5. **Risk Detection**: 7 MT103 risks, 5 NACHA risks with explanations
6. **Export**: XML and JSON mapping report sharing
7. **UI/UX**: Dark mode, haptics, animations, accessibility
8. **Testing**: Unit tests for parsers, builders, validators, formatters

## User Preferences

None specified yet.

## Development Notes

- Project uses Expo for cross-platform development
- All business logic is in `core/` for framework independence
- Design system uses tokens for consistent theming
- Soft validator used instead of libxmljs2 due to React Native limitations
- History is in-memory (not persisted to AsyncStorage yet)

## Sample Data

- `assets/samples/mt103-sample.txt`: Example SWIFT MT103 message
- `assets/samples/nacha-sample.txt`: Example NACHA ACH file
