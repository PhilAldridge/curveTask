/**
   * Process string as array - split on any delimiter and clean
   * @param {string} arrayString
   * @param {string} delimiter
   * @returns {Array} Cleaned array
   */
export function processStringArray(arrayString, delimiter) {
    if (!arrayString || typeof arrayString !== 'string') {
      return [];
    }

    return arrayString
      .split(delimiter)
      .map(alias => alias.trim())
      .filter(alias => alias.length > 0);
  }

/**
 * Remove any special characters or spaces from input
 * @param {string} inputString 
 * @returns {string}
 */
export function removeSpecialCharacters(inputString) {
    return inputString.replace(/[^0-9a-zA-Z]/gi, '')
}