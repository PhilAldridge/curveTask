// const { expect } = require('chai');
// const path = require('path');
// const fs = require('fs');
// const XLSX = require('xlsx');
// const DataIngestionService = require('../src/services/dataIngestionService');
// const SpreadsheetReader = require('../src/services/spreadsheetReader');
// const Track = require('../src/models/Track');
// const Contract = require('../src/models/Contract');
// require('./setup');

// describe('Services', function() {
  
//   describe('SpreadsheetReader', function() {
//     let testFilePath;
//     let reader;

//     before(function() {
//       reader = new SpreadsheetReader();
//       testFilePath = path.join(__dirname, 'test-data.xlsx');
      
//       // Create a test Excel file
//       const testData = [
//         ['title', 'artist', 'album', 'aliases', 'contract'],
//         ['Test Song 1', 'Artist 1', 'Album 1', 'Alias1;Alias2', 'Contract 1'],
//         ['Test Song 2', 'Artist 2', 'Album 2', 'Alias3', ''],
//         ['Test Song 3', 'Artist 3', '', '', 'NonExistentContract']
//       ];
      
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(testData);
//       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//       XLSX.writeFile(wb, testFilePath);
//     });

//     after(function() {
//       // Clean up test file
//       if (fs.existsSync(testFilePath)) {
//         fs.unlinkSync(testFilePath);
//       }
//     });

//     it('should read Excel file successfully', function() {
//       const workbook = reader.readFile(testFilePath);
//       expect(workbook).to.exist;
//       expect(workbook.SheetNames).to.be.an('array').with.length.greaterThan(0);
//     });

//     it('should convert worksheet to JSON with row numbers', function() {
//       reader.readFile(testFilePath);
//       const data = reader.worksheetToJson('Sheet1');
      
//       expect(data).to.be.an('array').with.length(3);
//       expect(data[0]).to.have.property('_rowNumber', 2);
//       expect(data[0]).to.have.property('title', 'Test Song 1');
//       expect(data[0]).to.have.property('artist', 'Artist 1');
//     });

//     it('should handle missing files gracefully', function() {
//       expect(() => {
//         reader.readFile('nonexistent.xlsx');
//       }).to.throw('File not found');
//     });

//     it('should get data with convenience method', function() {
//       const data = reader.getData(testFilePath);
//       expect(data).to.be.an('array').with.length(3);
//     });
//   });

//   describe('DataIngestionService', function() {
//     let service;
//     let testFilePath;
//     let contract;

//     beforeEach(async function() {
//       service = new DataIngestionService();
//       testFilePath = path.join(__dirname, 'test-tracks.xlsx');
      
//       // Create test contract
//       contract = await service.createContract('Contract 1');
      
//       // Create test Excel file
//       const testData = [
//         ['title', 'artist', 'album', 'genre', 'duration', 'aliases', 'contract', 'isrc'],
//         ['Valid Song 1', 'Artist 1', 'Album 1', 'Rock', '180', 'Alias1;Alias2', 'Contract 1', 'US123456789'],
//         ['Valid Song 2', 'Artist 2', 'Album 2', 'Pop', '240', 'Alias3', '', 'US987654321'],
//         ['Invalid Song', '', 'Album 3', 'Jazz', 'invalid', 'Alias4', 'NonExistent', 'US111111111'],
//         ['Valid Song 3', 'Artist 3', 'Album 3', 'Classical', '300', '', 'Contract 1', '']
//       ];
      
//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.aoa_to_sheet(testData);
//       XLSX.utils.book_append_sheet(wb, ws, 'Tracks');
//       XLSX.writeFile(wb, testFilePath);
//     });

//     afterEach(function() {
//       if (fs.existsSync(testFilePath)) {
//         fs.unlinkSync(testFilePath);
//       }
//     });

//     describe('processAliases', function() {
//       it('should split aliases on semicolon', function() {
//         const aliases = service.processAliases('Alias1;Alias2;Alias3');
//         expect(aliases).to.deep.equal(['Alias1', 'Alias2', 'Alias3']);
//       });

//       it('should handle empty or null aliases', function() {
//         expect(service.processAliases('')).to.deep.equal([]);
//         expect(service.processAliases(null)).to.deep.equal([]);
//         expect(service.processAliases(undefined)).to.deep.equal([]);
//       });

//       it('should trim whitespace from aliases', function() {
//         const aliases = service.processAliases(' Alias1 ; Alias2 ; Alias3 ');
//         expect(aliases).to.deep.equal(['Alias1', 'Alias2', 'Alias3']);
//       });
//     });

//     describe('findContract', function() {
//       it('should find existing contract by name', async function() {
//         const foundContract = await service.findContract('Contract 1');
//         expect(foundContract).to.exist;
//         expect(foundContract.name).to.equal('Contract 1');
//       });

//       it('should return null for non-existent contract', async function() {
//         const foundContract = await service.findContract('NonExistent Contract');
//         expect(foundContract).to.be.null;
//       });

//       it('should return null for empty contract name', async function() {
//         const foundContract = await service.findContract('');
//         expect(foundContract).to.be.null;
//       });
//     });

//     describe('validateTrackData', function() {
//       it('should validate required fields', function() {
//         const validData = {
//           title: 'Test Song',
//           artist: 'Test Artist',
//           duration: '180'
//         };
        
//         const result = service.validateTrackData(validData, 2);
//         expect(result.isValid).to.be.true;
//         expect(result.errors).to.have.length(0);
//       });

//       it('should catch missing required fields', function() {
//         const invalidData = {
//           title: '',
//           artist: null
//         };
        
//         const result = service.validateTrackData(invalidData, 2);
//         expect(result.isValid).to.be.false;
//         expect(result.errors).to.have.length(2);
//         expect(result.errors[0]).to.include('Title is required');
//         expect(result.errors[1]).to.include('Artist is required');
//       });

//       it('should validate numeric fields', function() {
//         const invalidData = {
//           title: 'Test Song',
//           artist: 'Test Artist',
//           duration: 'not a number',
//           trackNumber: 'invalid'
//         };
        
//         const result = service.validateTrackData(invalidData, 3);
//         expect(result.isValid).to.be.false;
//         expect(result.errors).to.have.length(2);
//         expect(result.errors.some(e => e.includes('Duration must be a number'))).to.be.true;
//         expect(result.errors.some(e => e.includes('Track number must be a number'))).to.be.true;
//       });
//     });

//     describe('convertToTrackObject', function() {
//       it('should convert row data to track object', function() {
//         const rowData = {
//           title: 'Test Song',
//           artist: 'Test Artist',
//           album: 'Test Album',
//           genre: 'Rock',
//           duration: '180',
//           trackNumber: '5',
//           isrc: 'US123456789',
//           aliases: 'Alias1;Alias2'
//         };
        
//         const trackObj = service.convertToTrackObject(rowData);
        
//         expect(trackObj.title).to.equal('Test Song');
//         expect(trackObj.artist).to.equal('Test Artist');
//         expect(trackObj.album).to.equal('Test Album');
//         expect(trackObj.genre).to.equal('Rock');
//         expect(trackObj.duration).to.equal(180);
//         expect(trackObj.trackNumber).to.equal(5);
//         expect(trackObj.isrc).to.equal('US123456789');
//         expect(trackObj.aliases).to.deep.equal(['Alias1', 'Alias2']);
//       });

//       it('should handle empty optional fields', function() {
//         const rowData = {
//           title: 'Test Song',
//           artist: 'Test Artist',
//           album: '',
//           duration: '',
//           aliases: ''
//         };
        
//         const trackObj = service.convertToTrackObject(rowData);
        
//         expect(trackObj.title).to.equal('Test Song');
//         expect(trackObj.artist).to.equal('Test Artist');
//         expect(trackObj.album).to.equal('');
//         expect(trackObj.duration).to.be.undefined;
//         expect(trackObj.aliases).to.deep.equal([]);
//       });
//     });

//     describe('ingestFromSpreadsheet', function() {
//       it('should ingest valid tracks successfully', async function() {
//         const results = await service.ingestFromSpreadsheet(testFilePath, 'Tracks');
        
//         expect(results.totalRows).to.equal(4);
//         expect(results.successCount).to.be.greaterThan(0);
//         expect(results.processedTracks).to.be.an('array');
        
//         // Check that valid tracks were saved
//         const savedTracks = await Track.find({});
//         expect(savedTracks.length).to.be.greaterThan(0);
//       });

//       it('should report errors for invalid data', async function() {
//         const results = await service.ingestFromSpreadsheet(testFilePath, 'Tracks');
        
//         expect(results.errorCount).to.be.greaterThan(0);
//         expect(results.errors).to.be.an('array').with.length.greaterThan(0);
        
//         // Should have error for missing artist
//         const hasArtistError = results.errors.some(error => 
//           error.includes('Artist is required'));
//         expect(hasArtistError).to.be.true;
        
//         // Should have error for non-existent contract
//         const hasContractError = results.errors.some(error => 
//           error.includes('Contract') && error.includes('not found'));
//         expect(hasContractError).to.be.true;
//       });

//       it('should handle tracks with and without contracts', async function() {
//         const results = await service.ingestFromSpreadsheet(testFilePath, 'Tracks');
        
//         // Check saved tracks
//         const tracksWithContract = await Track.find({ contractId: { $exists: true } });
//         const tracksWithoutContract = await Track.find({ contractId: { $exists: false } });
        
//         expect(tracksWithContract.length).to.be.greaterThan(0);
//         expect(tracksWithoutContract.length).to.be.greaterThan(0);
//       });
//     });

//     describe('createContract', function() {
//       it('should create a new contract', async function() {
//         const contractName = 'Test Contract 2';
//         const createdContract = await service.createContract(contractName);
        
//         expect(createdContract).to.exist;
//         expect(createdContract.name).to.equal(contractName);
//         expect(createdContract.status).to.equal('active');
//       });

//       it('should return existing contract if already exists', async function() {
//         const contractName = 'Contract 1'; // Already exists from beforeEach
//         const contract2 = await service.createContract(contractName);
        
//         expect(contract2._id.toString()).to.equal(contract._id.toString());
//       });
//     });
//   });
// });