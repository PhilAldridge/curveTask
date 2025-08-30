import { convertToTrackObject } from './utils/trackRowProcessing';

require('dotenv').config();

const database = require('./config/database');
const ContractService = require('./services/contractService')
const TrackService = require('./services/trackService')
const SpreadsheetReader = require('./services/spreadsheetReader')
const path = require('path');

async function main() {  
  try {
    console.log('🚀 Starting Data Ingestion Process...');
    
    // Connect to database
    await database.connect();

    // Initialize spreadsheet reader
    const reader = new SpreadsheetReader();
    
    // Initialize track and contract services
    const contractService = new ContractService();
    const trackService = new TrackService(reader, contractService.findContract);
    
    // Create "Contract 1" as required
    console.log('\n📋 Setting up contracts...');
    await contractService.createContract('Contract 1');
    
    // Define the path to the test data file
    const dataFilePath = path.join(__dirname, '..', 'data', 'Track Import Test.xlsx');
    
    console.log(`\n📊 Ingesting data from: ${dataFilePath}`);
    
    // Ingest the data
    const results = await trackService.ingestFromSpreadsheet(dataFilePath, null, convertToTrackObject);
    
    // Display results
    console.log('\n📈 INGESTION RESULTS');
    
    console.log(`Total rows processed: ${results.totalRows}`);
    console.log(`Successfully imported: ${results.successCount}`);
    console.log(`Failed imports: ${results.errorCount}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.error(`  • ${error}`);
      });
    }
    
    if (results.successCount > 0) {
      console.log('\n✅ SUCCESSFUL IMPORTS:');
      results.processedTracks.forEach(track => {
        console.log(`  • "${track.title}" by ${track.artist}`);
      });
    }
    
    console.log('\n🎉 Data ingestion process completed!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await database.disconnect();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { main };