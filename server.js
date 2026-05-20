import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const xlsx = require('xlsx');
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3001;

// Configuration
const PRODUCTION_FOLDER = "C:\\Users\\amar.sirajeldin\\Desktop\\Process\\Production Report";
const STOPPAGE_FOLDER = "C:\\Users\\amar.sirajeldin\\Desktop\\Process\\Stoppage Report";
const KPI_FOLDER = "C:\\Users\\amar.sirajeldin\\Desktop\\Process\\KPI_Entries";

// Create directories if they don't exist
[PRODUCTION_FOLDER, STOPPAGE_FOLDER, KPI_FOLDER].forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to read excel
const readExcel = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

// Helper to write excel
const writeExcel = (filePath, data) => {
  try {
    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, sheet, "Sheet1");
    xlsx.writeFile(workbook, filePath);
    return { success: true };
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return { success: false, error: err };
  }
};

// --- Production Routes ---
app.get('/api/production/:yearMonth', (req, res) => {
  const file = path.join(PRODUCTION_FOLDER, `Production ${req.params.yearMonth}.xlsx`);
  const data = readExcel(file);
  res.json(data);
});

app.post('/api/production/:yearMonth', (req, res) => {
  const file = path.join(PRODUCTION_FOLDER, `Production ${req.params.yearMonth}.xlsx`);
  const result = writeExcel(file, req.body);
  if (result.success) {
    res.json({ success: true, message: 'Saved successfully' });
  } else {
    const isBusy = result.error && result.error.code === 'EBUSY';
    const message = isBusy 
      ? `The Excel file "Production ${req.params.yearMonth}.xlsx" is open in Microsoft Excel. Please close it in Excel first, then click Save again.`
      : 'Failed to write Excel data. Please check folder permissions.';
    res.status(500).json({ success: false, message });
  }
});

// --- Stoppage Routes ---
app.get('/api/stoppage/:yearMonth', (req, res) => {
  const file = path.join(STOPPAGE_FOLDER, `Stoppage ${req.params.yearMonth}.xlsx`);
  const data = readExcel(file);
  res.json(data);
});

app.post('/api/stoppage/:yearMonth', (req, res) => {
  const file = path.join(STOPPAGE_FOLDER, `Stoppage ${req.params.yearMonth}.xlsx`);
  const result = writeExcel(file, req.body);
  if (result.success) {
    res.json({ success: true, message: 'Saved successfully' });
  } else {
    const isBusy = result.error && result.error.code === 'EBUSY';
    const message = isBusy 
      ? `The Excel file "Stoppage ${req.params.yearMonth}.xlsx" is open in Microsoft Excel. Please close it in Excel first, then click Save again.`
      : 'Failed to write Excel data. Please check folder permissions.';
    res.status(500).json({ success: false, message });
  }
});

// --- KPI Routes ---
app.get('/api/kpi/:yearMonth', (req, res) => {
  const file = path.join(KPI_FOLDER, `KPI_Entries_${req.params.yearMonth}.xlsx`);
  const data = readExcel(file);
  res.json(data);
});

app.post('/api/kpi/:yearMonth', (req, res) => {
  const file = path.join(KPI_FOLDER, `KPI_Entries_${req.params.yearMonth}.xlsx`);
  const result = writeExcel(file, req.body);
  if (result.success) {
    res.json({ success: true, message: 'Saved successfully' });
  } else {
    const isBusy = result.error && result.error.code === 'EBUSY';
    const message = isBusy 
      ? `The Excel file "KPI_Entries_${req.params.yearMonth}.xlsx" is open in Microsoft Excel. Please close it in Excel first, then click Save again.`
      : 'Failed to write Excel data. Please check folder permissions.';
    res.status(500).json({ success: false, message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
