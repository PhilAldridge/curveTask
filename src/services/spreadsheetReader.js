const XLSX = require('xlsx');
const fs = require('fs');

class SpreadsheetReader {
  constructor() {
    this.workbook = null;
  }

  /**
   * Read spreadsheet file and return workbook
   * @param {string} filePath - Path to the spreadsheet file
   * @returns {Object} Workbook object
   */
  readFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      this.workbook = XLSX.readFile(filePath);
      return this.workbook;
    } catch (error) {
      throw new Error(`Error reading spreadsheet: ${error.message}`);
    }
  }

  /**
   * Get worksheet names
   * @returns {Array} Array of worksheet names
   */
  getWorksheetNames() {
    if (!this.workbook) {
      throw new Error('No workbook loaded. Call readFile() first.');
    }
    return this.workbook.SheetNames;
  }

  /**
   * Convert worksheet to JSON with row numbers
   * @param {string} sheetName - Name of the worksheet
   * @returns {Array} Array of objects representing rows
   */
  worksheetToJson(sheetName) {
    try {
      if (!this.workbook) {
        throw new Error('No workbook loaded. Call readFile() first.');
      }

      if (!this.workbook.Sheets[sheetName]) {
        throw new Error(`Worksheet '${sheetName}' not found`);
      }

      const worksheet = this.workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length === 0) {
        return [];
      }

      // First row contains headers
      const headers = jsonData[0];
      const rows = [];

      for (let i = 1; i < jsonData.length; i++) {
        const rowData = {};
        const rowValues = jsonData[i];

        // Add row number (Excel row number, starting from 2 since row 1 is headers)
        rowData._rowNumber = i + 1;

        // Map values to headers
        headers.forEach((header, index) => {
          if (header && header.trim()) {
            rowData[header.trim()] = rowValues[index] || '';
          }
        });

        // Only include rows that have at least some data
        const hasData = Object.values(rowData).some(value => 
          value !== '' && value !== null && value !== undefined && value !== '_rowNumber'
        );

        if (hasData) {
          rows.push(rowData);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error converting worksheet to JSON: ${error.message}`);
    }
  }

  /**
   * Get data from specific worksheet
   * @param {string} filePath - Path to the spreadsheet file
   * @param {string} sheetName - Name of the worksheet (optional, defaults to first sheet)
   * @returns {Array} Array of objects representing rows
   */
  getData(filePath, sheetName = null) {
    this.readFile(filePath);
    
    if (!sheetName) {
      const sheetNames = this.getWorksheetNames();
      sheetName = sheetNames[0];
    }

    return this.worksheetToJson(sheetName);
  }
}

module.exports = SpreadsheetReader;