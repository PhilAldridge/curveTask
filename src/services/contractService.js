const Contract = require('../models/Contract');

class ContractService {
  /**
   * Create initial contract for testing
   * @param {string} contractName - Name of the contract to create
   * @returns {Object} Created contract
   */
   async createContract(contractName) {
    try {
      // Check if contract already exists
      const existingContract = await Contract.findOne({ name: contractName });
      if (existingContract) {
        console.log(`Contract "${contractName}" already exists`);
        return existingContract;
      }

      // Create new contract
      const contract = new Contract({
        name: contractName,
        description: `Test contract: ${contractName}`,
        status: 'active'
      });

      await contract.save();
      console.log(`Created contract: "${contractName}"`);
      return contract;

    } catch (error) {
      throw new Error(`Error creating contract: ${error.message}`);
    }
  }

  /**
     * Find contract by name
     * @param {string} contractName - Name of the contract to find
     * @returns {Object|null} Contract object or null if not found
     */
    async findContract(contractName) {
      if (!contractName || typeof contractName !== 'string') {
        return null;
      }
  
      try {
        const contract = await Contract.findOne({ 
          Name: contractName.trim() 
        });
        return contract;
      } catch (error) {
        throw new Error(`Error finding contract: ${error.message}`);
      }
    }
}

module.exports = ContractService