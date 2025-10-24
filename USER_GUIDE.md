# MDCB Transform App - Complete User Guide

## ✅ Fixed Issues

### 1. Scrolling in All Screens
- **Import MT103/NACHA**: Now scrollable to see all content including buttons at the bottom
- **Mapping Preview**: Full scrolling to view all mapping rows (10+ rows)
- **Convert & Validate**: Complete scrolling to reach export buttons at the bottom

### 2. Export Functionality Location

The export buttons are located in the **Convert & Validate** screen. Here's the complete flow:

## 📱 Complete User Journey

### Step 1: Home Screen
- Click **"Import MT103"** or **"Import NACHA"** to begin

### Step 2: Import Screen
- Sample data is automatically loaded
- **Scroll down** to see:
  - Detected Fields (shown as chips)
  - "Load Sample Data" button
  - **"Continue to Mapping Preview"** button (at the bottom)

### Step 3: Mapping Preview Screen
- Shows field mappings in a table format
- **You can now scroll down** to see:
  - All 10+ mapping rows
  - Source fields and their values
  - Target ISO 20022 XPath locations
  - **"Convert & Validate"** button (at the bottom)
- Click any XPath to copy it to clipboard

### Step 4: Convert & Validate Screen
This is where the **Export Buttons** are located!

**Scroll down through:**
1. **Conversion Timeline** - Shows Parsed → Built → Validated
2. **Validation Result** - Shows if XML is valid or has errors
3. **Generated XML** - The converted XML output (can copy)
4. **Risk Detection Summary** - Shows number of risks detected
5. **EXPORT BUTTONS SECTION** ⬇️

**At the bottom of this screen, you will find:**

```
┌─────────────────────────────────┐
│   Export XML                    │  ← Export as .xml file
├─────────────────────────────────┤
│   Export Mapping Report (JSON)  │  ← Export mapping as .json
├─────────────────────────────────┤
│   Save to History               │  ← Save to view later
└─────────────────────────────────┘
```

### Step 5: Risks Screen (Optional)
- Click "View Detailed Risk Analysis" to see all detected risks
- Shows Critical, Warning, and Info level risks
- Provides mitigation strategies for each risk

### Step 6: History Screen
- Click "View History" from Home screen
- See all your previous conversions
- Click any history item to view details

## 🔍 How to Test Scrolling

### Import Screen:
1. Click "Import MT103"
2. You'll see sample data pre-loaded
3. **Scroll down** → You should see "Detected Fields" section
4. **Scroll more** → You'll see "Continue to Mapping Preview" button

### Mapping Preview:
1. After importing, you'll see the mapping table
2. **Scroll down** → You'll see all 10+ mapping rows
3. Each row shows: Source → Value → ISO 20022 XPath
4. **Scroll to bottom** → You'll see "Convert & Validate" button

### Convert & Validate (Export Buttons):
1. After clicking "Convert & Validate"
2. You'll see the conversion results
3. **Scroll down past the XML code block**
4. **Keep scrolling** → You'll see the risk detection summary
5. **Scroll to the very bottom** → You'll find:
   - ✅ **Export XML** button
   - ✅ **Export Mapping Report (JSON)** button
   - ✅ **Save to History** button

## 📤 How to Export

### Export XML:
1. Navigate to Convert & Validate screen
2. Scroll to the bottom
3. Click **"Export XML"**
4. File will be saved/shared (depending on your device)
5. Filename format: `MT103_[timestamp].xml` or `NACHA_[timestamp].xml`

### Export Mapping Report:
1. Navigate to Convert & Validate screen
2. Scroll to the bottom
3. Click **"Export Mapping Report (JSON)"**
4. File contains:
   - All field mappings
   - Assumptions made
   - Detected risks
   - Validation results
5. Filename format: `mapping_report_[timestamp].json`

### Save to History:
1. Navigate to Convert & Validate screen
2. Scroll to the bottom
3. Click **"Save to History"**
4. Conversion is saved for later viewing
5. Access from Home → "View History"

## 🎯 Summary

**All scrolling issues are now fixed:**
- ✅ Import screens scroll properly
- ✅ Mapping Preview scrolls to show all rows
- ✅ Convert & Validate scrolls to reveal export buttons

**Export buttons are located:**
- ✅ At the bottom of the **Convert & Validate** screen
- ✅ After scrolling past the validation results and XML code
- ✅ Three buttons: Export XML, Export Mapping Report (JSON), Save to History

**Tip:** The export buttons appear **only after you've completed the conversion**. They won't show on the Import or Mapping Preview screens - you need to reach the Convert & Validate screen first!
