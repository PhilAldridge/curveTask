require('dotenv').config();
const database = require('../src/config/database');

// Use test database
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://admin:password@localhost:27017/spreadsheet_test_db?authSource=admin';

// Setup hooks for tests
before(async function() {
  this.timeout(10000);
  console.log('Setting up test database...');
  await database.connect();
});

after(async function() {
  this.timeout(10000);
  console.log('Cleaning up test database...');
  await database.clearDatabase();
  await database.disconnect();
});

beforeEach(async function() {
  // Clear database before each test
  await database.clearDatabase();
});

module.exports = {
  database
};