/**
 * Import Calendar from Excel
 * 
 * يستورد بيانات جدول من ملف Excel
 * ويحولها إلى صيغة قابلة للاستخدام في النظام
 */

import * as XLSX from 'xlsx';

/**
 * Parse Excel file data
 * @param {File} file - Excel file
 * @returns {Promise} Parsed data
 */
export async function importCalendarFromExcel(file) {
  // Check file type
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    throw new Error('Please select an Excel file (.xlsx or .xls)');
  }

  // Parse with SheetJS
  try {
    return await parseWithSheetJS(file);
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Parse using SheetJS library
 * @param {File} file - Excel file
 * @returns {Promise} Parsed data
 */
function parseWithSheetJS(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve({
          success: true,
          data: rows,
          sheetName: workbook.SheetNames[0],
          rowCount: rows.length,
          columnCount: rows[0]?.length || 0
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Extract calendar structure from raw Excel data
 * @param {array} rawData - Raw data from Excel
 * @returns {object} Extracted calendar
 */
export function extractCalendarStructure(rawData) {
  if (!rawData || rawData.length < 2) {
    throw new Error('Invalid data: needs at least 2 rows');
  }

  // Find header row (contains dates/days)
  const headerRowIndex = findHeaderRow(rawData);
  if (headerRowIndex === -1) {
    throw new Error('Could not find header row with dates');
  }

  const headerRow = rawData[headerRowIndex];
  const daysRange = extractDaysRange(headerRow);

  // Find driver names (usually in first column)
  const driverRows = [];
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row[0] && typeof row[0] === 'string' && row[0].trim()) {
      driverRows.push({
        index: i,
        name: row[0].trim(),
        data: row.slice(daysRange.start, daysRange.end)
      });
    }
  }

  return {
    headerRowIndex,
    daysRange,
    driverRows,
    daysCount: daysRange.count
  };
}

/**
 * Find header row (row with day numbers/names)
 * @param {array} rawData - Raw data
 * @returns {number} Header row index
 */
function findHeaderRow(rawData) {
  for (let i = 0; i < Math.min(rawData.length, 5); i++) {
    const row = rawData[i];
    // Look for row containing numbers (1-31) or day names
    const hasNumbers = row.some(cell => 
      typeof cell === 'number' && cell >= 1 && cell <= 31
    );
    
    if (hasNumbers) return i;
  }
  
  return -1;
}

/**
 * Extract days range from header row
 * @param {array} headerRow - Header row
 * @returns {object} Range info
 */
function extractDaysRange(headerRow) {
  let start = -1;
  let end = -1;
  let count = 0;

  for (let i = 0; i < headerRow.length; i++) {
    const cell = headerRow[i];
    const isDay = typeof cell === 'number' && cell >= 1 && cell <= 31;
    
    if (isDay && start === -1) {
      start = i;
    }
    
    if (isDay) {
      end = i + 1;
      count++;
    }
  }

  return { start, end: end || start + 1, count };
}

/**
 * Convert imported data to standard format
 * @param {object} calendarStructure - Calendar structure
 * @returns {object} Standard format
 */
export function convertToStandardFormat(calendarStructure) {
  const { driverRows, daysCount } = calendarStructure;

  return {
    driverNames: driverRows.map(r => r.name),
    calendarData: driverRows.map(r => r.data),
    daysInMonth: daysCount
  };
}

/**
 * Full import flow
 * @param {File} excelFile - Excel file
 * @returns {Promise} Formatted data ready to use
 */
export async function importAndProcessCalendar(excelFile) {
  // Step 1: Read Excel file
  const excelData = await importCalendarFromExcel(excelFile);
  console.log('✅ Excel file read successfully');

  // Step 2: Extract structure
  const structure = extractCalendarStructure(excelData.data);
  console.log('✅ Calendar structure extracted');

  // Step 3: Convert to standard format
  const standardFormat = convertToStandardFormat(structure);
  console.log('✅ Data converted to standard format');

  return {
    ...standardFormat,
    source: 'excel_import',
    fileName: excelFile.name,
    importedAt: new Date().toISOString()
  };
}

/**
 * Import progress reporter
 */
export function createImportProgressTracker() {
  return {
    steps: [
      { name: 'Reading Excel file', status: 'pending' },
      { name: 'Extracting structure', status: 'pending' },
      { name: 'Parsing drivers', status: 'pending' },
      { name: 'Validating data', status: 'pending' },
      { name: 'Generating groups', status: 'pending' }
    ],
    
    markComplete(stepIndex) {
      if (this.steps[stepIndex]) {
        this.steps[stepIndex].status = 'complete';
      }
    },
    
    markError(stepIndex, error) {
      if (this.steps[stepIndex]) {
        this.steps[stepIndex].status = 'error';
        this.steps[stepIndex].error = error;
      }
    },
    
    getProgress() {
      const completed = this.steps.filter(s => s.status === 'complete').length;
      return {
        percentage: (completed / this.steps.length) * 100,
        current: this.steps.findIndex(s => s.status === 'pending'),
        completed,
        total: this.steps.length
      };
    }
  };
}
