import { processStringArray, removeSpecialCharacters } from '../utils/inputProcessing';

const Track = require('../models/Track');


class TrackService {
  constructor(reader, findContract) {
    this.reader = reader;
    this.errors = [];
    this.findContract = findContract
  }

  /**
   * Validate track data
   * @param {Object} track - Track data from row of spreadsheet
   * @param {number} rowNumber - Row number for error reporting
   * @returns {Object} Validation result with isValid and errors
   */
  validateTrackData(track, rowNumber) {
    const errors = [];

    // Required fields validation
    if (!track.Title || track.Title === '') {
      errors.push(`Row ${rowNumber}: Title is required`);
    }

    if (!track.ISRC || track.ISRC === '') {
      errors.push(`Row ${rowNumber}: ISRC is required`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Process a single row of track data
   * @param {Object} track - Track data from row of spreadsheet
   * @param {string} contractName - Contract name
   * @returns {Object} Processing result
   */
  async processRow(track, contractName, row) {    
    try {
      // Validate the data
      const validation = this.validateTrackData(track, row);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          row
        };
      }

      // Handle contract association
      if (contractName) {
        const contract = await this.findContract(contractName);
        
        if (contract) {
          trackData.ContractId = contract._id;
        } else {
          return {
            success: false,
            errors: [`Row ${row}: Contract '${contractName}' not found`],
            row
          };
        }
      }

      // Save the track
      const trackEntry = new Track(track);
      await trackEntry.save();

      return {
        success: true,
        track: trackEntry,
        row
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Row ${row}: ${error.message}`],
        row
      };
    }
  }

  /**
   * Ingest data from spreadsheet
   * @param {string} filePath - Path to the spreadsheet file
   * @param {string} sheetName - Optional sheet name
   * @param {function} convertRowToTrack - Function for converting a row into a track object
   * @returns {Object} Ingestion result with success count and errors
   */
  async ingestFromSpreadsheet(filePath, sheetName = null, convertRowToTrack) {
    this.errors = [];
    const results = {
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      processedTracks: []
    };

    try {
      // Read spreadsheet data
      const data = this.reader.getData(filePath, sheetName);
      results.totalRows = data.length;

      if (data.length === 0) {
        results.errors.push('No data found in spreadsheet');
        return results;
      }

      console.log(`Processing ${data.length} rows...`);

      // Process each row
      for (const rowData of data) {
        const {track, contract} = convertRowToTrack(rowData)
        const result = await this.processRow(track, contract, rowData._rowNumber);
        
        if (result.success) {
          results.successCount++;
          results.processedTracks.push(result.track);
          console.log(`✓ Row ${result.rowNumber}: Successfully processed track "${result.track.Title}"`);
        } else {
          results.errorCount++;
          results.errors.push(...result.errors);
          console.error(`✗ Row ${result.rowNumber}: ${result.errors.join(', ')}`);
        }
      }

      return results;

    } catch (error) {
      results.errors.push(`General error: ${error.message}`);
      return results;
    }
  }
}

module.exports = TrackService;