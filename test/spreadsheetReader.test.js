import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import XLSX from 'xlsx';
import SpreadsheetReader from '../src/services/spreadsheetReader.js';

describe('SpreadsheetReader', () => {
  let reader;
  const mockFilePath = 'mock.xlsx';
  const mockWorkbook = {
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: 'mockSheetData'
    }
  };

  beforeEach(() => {
    reader = new SpreadsheetReader();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('readFile', () => {
    it('should read file and return workbook', () => {
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(XLSX, 'readFile').returns(mockWorkbook);

      const result = reader.readFile(mockFilePath);
      expect(result).to.deep.equal(mockWorkbook);
      expect(reader.workbook).to.equal(mockWorkbook);
    });

    it('should throw error if file does not exist', () => {
      sinon.stub(fs, 'existsSync').returns(false);

      expect(() => reader.readFile(mockFilePath)).to.throw(`File not found: ${mockFilePath}`);
    });

    it('should throw error if readFile fails', () => {
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(XLSX, 'readFile').throws(new Error('Failed to read'));

      expect(() => reader.readFile(mockFilePath)).to.throw('Error reading spreadsheet: Failed to read');
    });
  });

  describe('getWorksheetNames', () => {
    it('should return sheet names from workbook', () => {
      reader.workbook = mockWorkbook;
      const result = reader.getWorksheetNames();
      expect(result).to.deep.equal(['Sheet1']);
    });

    it('should throw error if workbook is not loaded', () => {
      expect(() => reader.getWorksheetNames()).to.throw('No workbook loaded. Call readFile() first.');
    });
  });

  describe('worksheetToJson', () => {
    it('should return parsed rows with headers and row numbers', () => {
      reader.workbook = {
        Sheets: {
          Sheet1: {}
        }
      };

      const sheetData = [
        ['Name', 'Age'],
        ['Alice', 25],
        ['Bob', 30]
      ];

      sinon.stub(XLSX.utils, 'sheet_to_json').returns(sheetData);

      const result = reader.worksheetToJson('Sheet1');
      expect(result).to.deep.equal([
        { _rowNumber: 2, Name: 'Alice', Age: 25 },
        { _rowNumber: 3, Name: 'Bob', Age: 30 }
      ]);
    });

    it('should return empty array if sheet is empty', () => {
      reader.workbook = {
        Sheets: {
          Sheet1: {}
        }
      };
      sinon.stub(XLSX.utils, 'sheet_to_json').returns([]);
      const result = reader.worksheetToJson('Sheet1');
      expect(result).to.deep.equal([]);
    });

    it('should throw error if no workbook loaded', () => {
      expect(() => reader.worksheetToJson('Sheet1')).to.throw('No workbook loaded. Call readFile() first.');
    });

    it('should throw error if sheet not found', () => {
      reader.workbook = { Sheets: {} };
      expect(() => reader.worksheetToJson('SheetX')).to.throw(`Worksheet 'SheetX' not found`);
    });
  });

  describe('getData', () => {
    it('should read file and return data from specified sheet', () => {
      sinon.stub(reader, 'readFile').returns(mockWorkbook);
      sinon.stub(reader, 'worksheetToJson').returns([{ Name: 'Test' }]);
      reader.workbook = mockWorkbook;

      const result = reader.getData(mockFilePath, 'Sheet1');
      expect(result).to.deep.equal([{ Name: 'Test' }]);
      expect(reader.readFile.calledWith(mockFilePath)).to.be.true;
    });

    it('should read file and return data from first sheet if no sheetName given', () => {
      sinon.stub(reader, 'readFile').returns(mockWorkbook);
      sinon.stub(reader, 'getWorksheetNames').returns(['Sheet1']);
      sinon.stub(reader, 'worksheetToJson').returns([{ Name: 'Test' }]);
      reader.workbook = mockWorkbook;

      const result = reader.getData(mockFilePath);
      expect(result).to.deep.equal([{ Name: 'Test' }]);
    });
  });
});
