import { removeSpecialCharacters, processStringArray } from "./inputProcessing.js";

/**
   * Convert row data to track object
   * @param {Object} rowData - Row data from spreadsheet
   * @returns {Object} Track object ready for saving
   */
export function convertToTrackObject(rowData) {
    const track = {
      Title: rowData.Title.trim(),
      Version: rowData.Version?.trim() || '',
      Artist: rowData.Artist?.trim() || '',
      ISRC: removeSpecialCharacters(rowData.ISRC),
      PLine: rowData['P Line']?.trim() || '',
      Aliases: processStringArray(rowData.Aliases,';')
    };

    return {
      track:track,
      contract:rowData.Contract?.trim()
    };
  }