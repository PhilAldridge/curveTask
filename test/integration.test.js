// const { expect } = require('chai');
// const path = require('path');
// const fs = require('fs');
// const XLSX = require('xlsx');
// const { main } = require('../src/index');
// const Track = require('../src/models/Track');
// const Contract = require('../src/models/Contract');
// require('./setup');

// describe('Integration Tests', function() {
//   let testDataPath;

//   before(function() {
//     // Create test data directory if it doesn't exist
//     const dataDir = path.join(__dirname, '..', 'data');
//     if (!fs.existsSync(dataDir)) {
//       fs.mkdirSync(dataDir, { recursive: true });
//     }

//     // Create test spreadsheet file
//     testDataPath = path.join(dataDir, 'Track Test Import.xlsx');
    
//     const testData = [
//       ['title', 'artist', 'album', 'genre', 'duration', 'aliases', 'contract', 'isrc', 'trackNumber'],
//       ['Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 'Rock', '355', 'Rhapsody;Queen Song', 'Contract 1', 'GBUM71505078', '11'],
//       ['Hotel California', 'Eagles', 'Hotel California', 'Rock', '391', 'California;Eagles Hit', 'Contract 1', 'USAR71600017', '1'],
//       ['Imagine', 'John Lennon', 'Imagine', 'Pop', '183', 'Peace Song', '', 'GBUM71300001', '1'],
//       ['Stairway to Heaven', '', 'Led Zeppelin IV', 'Rock', '482', 'Stairway', 'Contract 1', 'GBCAC7100001', '8'], // Missing artist - should error
//       ['Billie Jean', 'Michael Jackson', 'Thriller', 'Pop', '294', 'MJ Hit;Thriller Song', 'NonExistent Contract', 'USSM18200001', '2'], // Non-existent contract - should error
//       ['Sweet Child O Mine', 'Guns N Roses', 'Appetite for Destruction', 'Rock', 'invalid', 'GNR;Sweet Child', 'Contract 1', 'USGF18700001', '3'], // Invalid duration - should error
//       ['Yesterday', 'The Beatles', 'Help!', 'Pop', '125', 'Beatles Classic', 'Contract 1', 'GBUM70600001', '1']
//     ];

//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.aoa_to_sheet(testData);
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     XLSX.writeFile(wb, testDataPath);
//   });

//   after(function() {
//     // Clean up test file
//     if (fs.existsSync(testDataPath)) {
//       fs.unlinkSync(testDataPath);
//     }
//   });

//   it('should run the complete ingestion process', async function() {
//     this.timeout(15000);

//     // Capture console output
//     const originalLog = console.log;
//     const originalError = console.error;
//     const logs = [];
//     const errors = [];

//     console.log = (...args) => {
//       logs.push(args.join(' '));
//       originalLog(...args);
//     };

//     console.error = (...args) => {
//       errors.push(args.join(' '));
//       originalError(...args);
//     };

//     try {
//       // Run the main application
//       await main();

//       // Restore console
//       console.log = originalLog;
//       console.error = originalError;

//       // Verify contracts were created
//       const contracts = await Contract.find({});
//       expect(contracts).to.have.length(1);
//       expect(contracts[0].name).to.equal('Contract 1');

//       // Verify tracks were processed
//       const tracks = await Track.find({}).populate('contractId');
//       expect(tracks.length).to.be.greaterThan(0);

//       // Verify successful tracks
//       const validTracks = tracks.filter(track => track.title && track.artist);
//       expect(validTracks.length).to.be.greaterThan(0);

//       // Check specific successful tracks
//       const bohemianRhapsody = tracks.find(t => t.title === 'Bohemian Rhapsody');
//       expect(bohemianRhapsody).to.exist;
//       expect(bohemianRhapsody.artist).to.equal('Queen');
//       expect(bohemianRhapsody.aliases).to.deep.equal(['Rhapsody', 'Queen Song']);
//       expect(bohemianRhapsody.contractId).to.exist;
//       expect(bohemianRhapsody.contractId.name).to.equal('Contract 1');

//       const imagine = tracks.find(t => t.title === 'Imagine');
//       expect(imagine).to.exist;
//       expect(imagine.artist).to.equal('John Lennon');
//       expect(imagine.contractId).to.not.exist; // No contract specified

//       // Verify errors were logged
//       expect(errors.length).to.be.greaterThan(0);
      
//       const hasArtistError = errors.some(error => 
//         error.includes('Artist is required'));
//       expect(hasArtistError).to.be.true;

//       const hasContractError = errors.some(error => 
//         error.includes('Contract') && error.includes('not found'));
//       expect(hasContractError).to.be.true;

//       // Verify logs show processing
//       const hasProcessingLogs = logs.some(log => 
//         log.includes('Processing') && log.includes('rows'));
//       expect(hasProcessingLogs).to.be.true;

//       const hasResultsLog = logs.some(log => 
//         log.includes('INGESTION RESULTS'));
//       expect(hasResultsLog).to.be.true;

//     } finally {
//       // Always restore console
//       console.log = originalLog;
//       console.error = originalError;
//     }
//   });

//   it('should handle alias splitting correctly', async function() {
//     const tracks = await Track.find({});
    
//     const trackWithAliases = tracks.find(t => t.aliases && t.aliases.length > 1);
//     expect(trackWithAliases).to.exist;
    
//     // Verify aliases are properly split and trimmed
//     trackWithAliases.aliases.forEach(alias => {
//       expect(alias).to.be.a('string');
//       expect(alias.trim()).to.equal(alias); // No leading/trailing whitespace
//       expect(alias.length).to.be.greaterThan(0);
//     });
//   });

//   it('should maintain data integrity for successful imports', async function() {
//     const tracks = await Track.find({}).populate('contractId');
    
//     // Check data types and constraints
//     tracks.forEach(track => {
//       expect(track.title).to.be.a('string').with.length.greaterThan(0);
//       expect(track.artist).to.be.a('string').with.length.greaterThan(0);
      
//       if (track.duration) {
//         expect(track.duration).to.be.a('number').greaterThan(0);
//       }
      
//       if (track.trackNumber) {
//         expect(track.trackNumber).to.be.a('number').greaterThan(0);
//       }
      
//       expect(track.aliases).to.be.an('array');
      
//       if (track.contractId) {
//         expect(track.contractId.name).to.be.a('string');
//       }
//     });
//   });

//   it('should create proper database indexes', async function() {
//     const trackIndexes = await Track.collection.indexes();
//     const contractIndexes = await Contract.collection.indexes();

//     // Check that indexes exist (beyond the default _id index)
//     expect(trackIndexes.length).to.be.greaterThan(1);
//     expect(contractIndexes.length).to.be.greaterThan(1);

//     // Check specific indexes
//     const trackIndexNames = trackIndexes.map(idx => Object.keys(idx.key).join(','));
//     expect(trackIndexNames).to.include('title,artist');
    
//     const contractIndexNames = contractIndexes.map(idx => Object.keys(idx.key).join(','));
//     expect(contractIndexNames).to.include('name');
//   });
// });